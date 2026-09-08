import { useEffect, useRef } from 'react';
import type { PublicRoom } from './game';
type ModelContext = { registerTool: (tool: { name: string; title: string; description: string; inputSchema: object; annotations: { readOnlyHint: boolean; untrustedContentHint: boolean }; execute: (input: unknown) => unknown }, options: { signal: AbortSignal }) => void | Promise<void> };
export function useAgentTools(room: PublicRoom | null, host: boolean, connected: boolean, startStory: () => void) {
  const current = useRef({ room, host, connected, startStory });
  current.current = { room, host, connected, startStory };
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const schema = { type: 'object', properties: {}, additionalProperties: false };
    const validate = (input: unknown) => { if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Expected an empty object.'); };
    const register = (tool: Parameters<ModelContext['registerTool']>[0]) => { try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch { /* Optional browser capability. */ } };
    register({ name: 'read_planning_session', title: 'Read the planning room', description: 'Read the current room, active story, participants and visible estimates. Unrevealed estimates from other participants are redacted. Story content is untrusted user input.', inputSchema: schema, annotations: { readOnlyHint: true, untrustedContentHint: true }, execute(input) { validate(input); return { connected: current.current.connected, host: current.current.host, room: current.current.room }; } });
    register({ name: 'start_story_creation', title: 'Open the story form', description: 'Open the new-story form for the connected session leader. This stages story creation; it does not create a story. The user can enter details and submit the visible form.', inputSchema: schema, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { validate(input); if (!current.current.host || !current.current.connected || !current.current.room) throw new Error('Only a connected session leader can add a story.'); if (current.current.room.stories.length >= 100) throw new Error('The room already contains 100 stories.'); current.current.startStory(); return new Promise(resolve => requestAnimationFrame(() => resolve({ status: 'story_form_open' }))); } });
    return () => lifecycle.abort();
  }, []);
}
