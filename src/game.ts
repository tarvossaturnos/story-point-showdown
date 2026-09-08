export const POINT_VALUES = ['0,5', '1', '2', '3', '5', '8', '13', '20', '40'] as const;
export type PointValue = typeof POINT_VALUES[number];
export const VALUES = [...POINT_VALUES, '?', '☕'] as const;
export type Value = typeof VALUES[number];
// Keep wire values stable for existing rooms; format only the displayed text.
export function formatPoint(value: string | null | undefined): string {
  return value?.replace(',', '.') ?? '—';
}
export type Member = { id: string; name: string; online: boolean; host: boolean };
export type Story = { id: string; title: string; reference: string; description: string; revealed: boolean; round: string; votes: Record<string, Value>; estimate: Value | null };
export type Room = { id: string; name: string; hostId: string; activeId: string | null; members: Member[]; stories: Story[]; credentials: Record<string, string> };
export type PublicStory = Omit<Story, 'votes'> & { votes: Record<string, Value | null> };
export type PublicRoom = Omit<Room, 'stories' | 'credentials'> & { stories: PublicStory[] };
export type Action = { type: 'vote'; storyId: string; round: string; value: Value } | { type: 'add'; title: string; reference: string; description: string } | { type: 'select'; id: string } | { type: 'reveal' } | { type: 'restart' } | { type: 'estimate'; value: Value } | { type: 'remove'; id: string };
export function createRoom(id: string, hostId: string, name: string, hostName: string): Room {
  return { id, name: name.trim().slice(0, 70), hostId, activeId: null, members: [{ id: hostId, name: hostName.trim().slice(0, 30), online: true, host: true }], stories: [], credentials: {} };
}
export function viewFor(room: Room, userId: string): PublicRoom {
  const { credentials: _credentials, ...publicRoom } = room;
  return { ...publicRoom, stories: room.stories.map(story => ({ ...story, votes: Object.fromEntries(Object.entries(story.votes).map(([id, value]) => [id, story.revealed || id === userId ? value : null])) })) };
}
export function reduceRoom(room: Room, actor: string, input: unknown): Room {
  if (!input || typeof input !== 'object' || !('type' in input)) return room;
  const action = input as Action;
  if (!room.members.some(m => m.id === actor && m.online)) return room;
  const active = room.stories.find(s => s.id === room.activeId);
  if (action.type === 'vote') {
    if (!active || active.id !== action.storyId || active.round !== action.round || active.revealed || !VALUES.includes(action.value)) return room;
    return { ...room, stories: room.stories.map(s => s.id === active.id ? { ...s, votes: { ...s.votes, [actor]: action.value } } : s) };
  }
  if (actor !== room.hostId) return room;
  switch (action.type) {
    case 'add': {
      if (typeof action.title !== 'string' || !action.title.trim() || room.stories.length >= 100) return room;
      const story: Story = { id: crypto.randomUUID(), title: action.title.trim().slice(0, 160), reference: typeof action.reference === 'string' ? action.reference.trim().slice(0, 30) : '', description: typeof action.description === 'string' ? action.description.trim().slice(0, 2000) : '', revealed: false, round: crypto.randomUUID(), votes: {}, estimate: null };
      return { ...room, activeId: room.activeId ?? story.id, stories: [...room.stories, story] };
    }
    case 'select': return room.stories.some(s => s.id === action.id) ? { ...room, activeId: action.id } : room;
    case 'remove': { const stories = room.stories.filter(s => s.id !== action.id); return { ...room, stories, activeId: room.activeId === action.id ? stories[0]?.id ?? null : room.activeId }; }
    case 'reveal': return active && Object.keys(active.votes).length ? { ...room, stories: room.stories.map(s => s.id === active.id ? { ...s, revealed: true } : s) } : room;
    case 'restart': return active ? { ...room, stories: room.stories.map(s => s.id === active.id ? { ...s, votes: {}, revealed: false, estimate: null, round: crypto.randomUUID() } : s) } : room;
    case 'estimate': return active?.revealed && VALUES.includes(action.value) ? { ...room, stories: room.stories.map(s => s.id === active.id ? { ...s, estimate: action.value } : s) } : room;
    default: return room;
  }
}
export function stats(story: PublicStory) {
  const values = Object.values(story.votes).filter((v): v is Value => v !== null && v !== '?' && v !== '☕').map(v => Number(v.replace(',', '.')));
  return { count: values.length, average: values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toLocaleString('en-US', { maximumFractionDigits: 1 }) : '—', consensus: values.length > 1 && values.every(v => v === values[0]), min: values.length ? Math.min(...values) : null, max: values.length ? Math.max(...values) : null };
}
export function csv(room: PublicRoom) {
  const escape = (value: string) => '"' + (/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""') + '"';
  return '\uFEFF' + [['Reference', 'Story', 'Estimate', ...room.members.map(m => m.name)], ...room.stories.map(s => [s.reference, s.title, formatPoint(s.estimate ?? ''), ...room.members.map(m => s.revealed ? formatPoint(s.votes[m.id] ?? '') : '')])].map(row => row.map(escape).join(';')).join('\r\n');
}
