import { useEffect, useRef, useState } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import { reduceRoom, viewFor, type Action, type PublicRoom, type Room } from './game';
export type Session = { roomId: string; userId: string; name: string; host: boolean; token?: string; initial?: Room; fresh?: boolean; collisions?: number };
type Wire = { type: 'hello'; userId: string; name: string; token: string } | { type: 'action'; action: Action } | { type: 'state'; room: PublicRoom } | { type: 'ping' } | { type: 'pong' };
export function useRoom(session: Session | null, onPinCollision?: () => void) {
  const collisionHandler = useRef(onPinCollision);
  collisionHandler.current = onPinCollision;
  const openedId = useRef<string | null>(null);
  const [room, setRoom] = useState<PublicRoom | null>(session?.initial ? viewFor(session.initial, session.userId) : null);
  const [status, setStatus] = useState('Connecting…');
  const [connected, setConnected] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const sendRef = useRef<(action: Action) => void>(() => {});
  const source = useRef<Room | null>(session?.initial ?? null);
  useEffect(() => {
    if (!session) return;
    let live = true;
    let received = Date.now();
    let joined = false;
    let ready = false;
    const connections = new Map<string, DataConnection>();
    let hostConnection: DataConnection | undefined;
    setError(''); setConnected(false); setStatus('Connecting…');
    if (session.host && source.current?.id !== session.roomId) source.current = session.initial ?? null;
    setRoom(null);
    // Preserve the signaling namespace so existing room links remain compatible.
    const peer = session.host ? new Peer('shodown-' + session.roomId) : new Peer();
    const broadcast = () => {
      if (!source.current || !live) return;
      setRoom(viewFor(source.current, session.userId));
      try { sessionStorage.setItem('shodown-host-' + session.roomId, JSON.stringify(source.current)); } catch { /* The room also works without local recovery. */ }
      connections.forEach((connection, id) => { if (connection.open && source.current) connection.send({ type: 'state', room: viewFor(source.current, id) }); });
    };
    const apply = (id: string, action: unknown) => { if (source.current) { source.current = reduceRoom(source.current, id, action); broadcast(); } };
    sendRef.current = action => { if (session.host) apply(session.userId, action); else if (hostConnection?.open && joined) hostConnection.send({ type: 'action', action }); };
    const fail = (message: string) => { if (live) { setError(message); setConnected(false); setStatus('Disconnected'); } };
    peer.on('open', () => {
      if (!live) return;
      ready = true;
      openedId.current = session.roomId;
      if (session.host) { setConnected(true); setStatus('Room is live'); broadcast(); return; }
      setStatus('Joining room…');
      hostConnection = peer.connect('shodown-' + session.roomId, { reliable: true, serialization: 'json' });
      hostConnection.on('open', () => hostConnection?.send({ type: 'hello', userId: session.userId, name: session.name, token: session.token }));
      hostConnection.on('data', raw => {
        const message = raw as Wire;
        if (!live || !message || typeof message !== 'object') return;
        if (message.type === 'pong') received = Date.now();
        if (message.type === 'state' && message.room?.id === session.roomId && Array.isArray(message.room.stories)) {
          received = Date.now(); joined = true; setRoom(message.room); setConnected(true); setError(''); setStatus('Connected to the room');
        }
      });
      hostConnection.on('close', () => { joined = false; fail('The connection to the host was lost. Ask the host to keep the room open, then reconnect.'); });
      hostConnection.on('error', () => fail('The room cannot be reached. Check that the host has the room open. A corporate network or VPN may be blocking the connection.'));
    });
    peer.on('connection', connection => {
      if (!session.host) { connection.on('open', () => connection.close()); return; }
      let memberId: string | null = null;
      const timeout = setTimeout(() => { if (!memberId) connection.close(); }, 10000);
      connection.on('data', raw => {
        const message = raw as Wire;
        if (!live || !source.current || !message || typeof message !== 'object') return;
        if (message.type === 'hello' && !memberId) {
          if (typeof message.userId !== 'string' || !/^[a-f0-9-]{36}$/.test(message.userId) || message.userId === session.userId || typeof message.name !== 'string' || !message.name.trim()) { connection.close(); return; }
          if (typeof message.token !== 'string' || !/^[a-f0-9-]{36}$/.test(message.token)) { connection.close(); return; }
          const knownToken = source.current.credentials[message.userId];
          if (knownToken && knownToken !== message.token) { connection.close(); return; }
          if (source.current.members.length >= 30 && !source.current.members.some(m => m.id === message.userId)) { connection.close(); return; }
          memberId = message.userId;
          clearTimeout(timeout);
          const old = connections.get(memberId);
          connections.set(memberId, connection);
          old?.close();
          const member = { id: memberId, name: message.name.trim().slice(0, 30), online: true, host: false };
          source.current = { ...source.current, credentials: { ...source.current.credentials, [memberId]: message.token }, members: source.current.members.some(m => m.id === memberId) ? source.current.members.map(m => m.id === memberId ? member : m) : [...source.current.members, member] };
          broadcast();
        } else if (memberId && connections.get(memberId) === connection) {
          if (message.type === 'ping') connection.send({ type: 'pong' });
          if (message.type === 'action') apply(memberId, message.action);
        }
      });
      const disconnect = () => {
        clearTimeout(timeout);
        if (memberId && connections.get(memberId) === connection && source.current) {
          connections.delete(memberId);
          source.current = { ...source.current, members: source.current.members.map(m => m.id === memberId ? { ...m, online: false } : m) };
          broadcast();
        }
      };
      connection.on('close', disconnect); connection.on('error', disconnect);
    });
    peer.on('disconnected', () => { if (live && !peer.destroyed) { setStatus('Reconnecting…'); peer.reconnect(); } });
    peer.on('error', err => {
      if (err.type === 'unavailable-id') {
        if (session.host && session.fresh && openedId.current !== session.roomId && (session.collisions ?? 0) < 5 && collisionHandler.current) {
          collisionHandler.current();
        } else fail(session.fresh && openedId.current !== session.roomId ? 'Could not reserve a room PIN. Please try creating a room again.' : 'This room is already open in another tab. Return to that tab.');
      }
      else if (err.type === 'peer-unavailable') fail('This room is not active. Ask the host to open the original room.');
      else fail('Connection failed. Check your internet connection. A corporate network or VPN may block direct connections.');
    });
    const watchdog = setTimeout(() => { if (session.host && !ready) fail('The connection service is not responding. Check your internet connection and try again.'); else if (!session.host && !joined) fail('The room is not responding. Check the link and ask the host to keep the room open.'); }, 18000);
    const heartbeat = setInterval(() => {
      if (!session.host && hostConnection?.open) {
        hostConnection.send({ type: 'ping' });
        if (joined && Date.now() - received > 25000) { joined = false; fail('The host is no longer responding. Reconnect when the room is open again.'); }
      }
    }, 5000);
    return () => { live = false; clearTimeout(watchdog); clearInterval(heartbeat); connections.forEach(c => c.close()); peer.destroy(); sendRef.current = () => {}; };
  }, [session, attempt]);
  return { room, connected, status, error, act: (action: Action) => sendRef.current(action), retry: () => setAttempt(n => n + 1) };
}
