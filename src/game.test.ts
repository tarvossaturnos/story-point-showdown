import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { createRoom, reduceRoom, viewFor, stats, csv, POINT_VALUES } from './game';
import { CREATURES } from './creatures';
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
function fixture() {
  let room = createRoom('room', 'host', 'Refinement', 'Marcel');
  room.members.push({ id: 'guest', name: 'Bas', host: false, online: true });
  room = reduceRoom(room, 'host', { type: 'add', title: 'Redesign UX', reference: '123', description: '' });
  return room;
}
test('Guests cannot add, remove, reveal, reset or finalize stories', () => {
  const room = fixture();
  for (const action of [{ type: 'add', title: 'Injected' }, { type: 'remove', id: room.activeId }, { type: 'reveal' }, { type: 'restart' }, { type: 'estimate', value: '20' }]) assert.equal(reduceRoom(room, 'guest', action), room);
});
test('Hidden points are omitted from wire views, but users see their own choice', () => {
  let room = fixture(); const story = room.stories[0];
  room.credentials.guest = 'private-reconnection-secret';
  room = reduceRoom(room, 'host', { type: 'vote', storyId: story.id, round: story.round, value: '3' });
  room = reduceRoom(room, 'guest', { type: 'vote', storyId: story.id, round: story.round, value: '8' });
  assert.deepEqual(viewFor(room, 'guest').stories[0].votes, { host: null, guest: '8' });
  assert.ok(!JSON.stringify(viewFor(room, 'guest')).includes('private-reconnection-secret'));
  assert.ok(!Object.hasOwn(viewFor(room, 'guest'), 'credentials'));
  assert.deepEqual(viewFor(room, 'host').stories[0].votes, { host: '3', guest: null });
  assert.deepEqual(viewFor(room, 'another').stories[0].votes, { host: null, guest: null });
  assert.equal(room.stories[0].votes.host, '3');
  room = reduceRoom(room, 'host', { type: 'reveal' });
  assert.deepEqual(viewFor(room, 'guest').stories[0].votes, { host: '3', guest: '8' });
});
test('Reject forged, stale, malformed, inactive, and post-reveal votes', () => {
  let room = fixture(); const story = room.stories[0];
  const action = { type: 'vote', storyId: story.id, round: story.round, value: '5' };
  assert.equal(reduceRoom(room, 'stranger', action), room);
  assert.equal(reduceRoom(room, 'guest', { ...action, value: '1000' }), room);
  assert.equal(reduceRoom(room, 'guest', { ...action, round: 'old-round' }), room);
  assert.equal(reduceRoom(room, 'guest', null), room);
  room = reduceRoom(room, 'guest', action);
  room = reduceRoom(room, 'host', { type: 'reveal' });
  assert.equal(reduceRoom(room, 'guest', { ...action, value: '8' }), room);
  room = reduceRoom(room, 'host', { type: 'restart' });
  assert.equal(reduceRoom(room, 'guest', action), room);
});
test('Multiple stories retain independent votes and final estimates', () => {
  let room = fixture(); const first = room.stories[0];
  room = reduceRoom(room, 'guest', { type: 'vote', storyId: first.id, round: first.round, value: '5' });
  room = reduceRoom(room, 'host', { type: 'reveal' });
  room = reduceRoom(room, 'host', { type: 'estimate', value: '5' });
  room = reduceRoom(room, 'host', { type: 'add', title: 'Fix bugs' });
  const second = room.stories[1];
  room = reduceRoom(room, 'host', { type: 'select', id: second.id });
  assert.equal(room.stories[0].estimate, '5');
  assert.deepEqual(room.stories[1].votes, {});
  assert.equal(reduceRoom(room, 'guest', { type: 'vote', storyId: first.id, round: first.round, value: '3' }), room);
});
test('Restart clears votes, revelation and final estimate, and rotates round', () => {
  let room = fixture(); const first = room.stories[0];
  room = reduceRoom(room, 'guest', { type: 'vote', storyId: first.id, round: first.round, value: '3' });
  room = reduceRoom(room, 'host', { type: 'reveal' });
  room = reduceRoom(room, 'host', { type: 'estimate', value: '3' });
  room = reduceRoom(room, 'host', { type: 'restart' });
  assert.deepEqual(room.stories[0].votes, {}); assert.equal(room.stories[0].revealed, false); assert.equal(room.stories[0].estimate, null); assert.notEqual(room.stories[0].round, first.round);
});
test('Statistics parse the decimal comma and exclude uncertainty or coffee', () => {
  const story = viewFor(fixture(), 'host').stories[0];
  assert.deepEqual(stats({ ...story, votes: { a: '0,5', b: '1', c: '?', d: '☕', e: null } }), { count: 2, average: '0,8', consensus: false, min: 0.5, max: 1 });
  assert.equal(stats({ ...story, votes: { a: '5', b: '5' } }).consensus, true);
});
test('Half-point and 40-point votes remain private until reveal and can be finalized and exported', () => {
  let room = fixture(); const story = room.stories[0];
  room = reduceRoom(room, 'guest', { type: 'vote', storyId: story.id, round: story.round, value: '0,5' });
  room = reduceRoom(room, 'host', { type: 'vote', storyId: story.id, round: story.round, value: '40' });
  assert.deepEqual(viewFor(room, 'guest').stories[0].votes, { guest: '0,5', host: null });
  assert.equal(reduceRoom(room, 'guest', { type: 'vote', storyId: story.id, round: story.round, value: '0' }), room);
  room = reduceRoom(room, 'host', { type: 'reveal' });
  assert.equal(stats(viewFor(room, 'guest').stories[0]).average, '20,3');
  for (const value of ['0,5', '40']) {
    room = reduceRoom(room, 'host', { type: 'estimate', value });
    assert.equal(room.stories[0].estimate, value);
    assert.ok(csv(viewFor(room, 'guest')).includes(`"${value}"`));
  }
});
test('All nine point cards use distinct illustration panels with stable identities', () => {
  assert.deepEqual(POINT_VALUES, ['0,5', '1', '2', '3', '5', '8', '13', '20', '40']);
  const deck = POINT_VALUES.map(value => CREATURES[value]);
  assert.equal(new Set(deck.map(c => `${c.sheet}:${c.panel}`)).size, 9);
  assert.equal(new Set(deck.map(c => c.name)).size, 9);
});
test('CSV escapes formulas and quotes and excludes unrevealed votes', () => {
  let room = fixture(); room.stories[0].title = '=SUM(1;2)'; room.members[0].name = 'A "quote"';
  room.stories[0].votes.guest = '13';
  const output = csv(viewFor(room, 'guest'));
  assert.ok(output.includes('"\'=SUM(1;2)"')); assert.ok(output.includes('"A ""quote"""')); assert.ok(!output.includes('"13"'));
  room = reduceRoom(room, 'host', { type: 'reveal' });
  assert.ok(csv(viewFor(room, 'guest')).includes('"13"'));
});
test('Removing the active story chooses another and removing last empties the arena', () => {
  let room = fixture(); const id = room.activeId;
  room = reduceRoom(room, 'host', { type: 'add', title: 'Second' });
  room = reduceRoom(room, 'host', { type: 'remove', id });
  assert.equal(room.activeId, room.stories[0].id);
  room = reduceRoom(room, 'host', { type: 'remove', id: room.activeId });
  assert.equal(room.activeId, null); assert.equal(room.stories.length, 0);
});
