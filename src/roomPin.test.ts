import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { PIN_ALPHABET, generateRoomPin, parseRoomId } from './roomPin';
import { createRoom, reduceRoom, viewFor } from './game';
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });

test('Room PINs use five characters from an unambiguous 32-character alphabet', () => {
  assert.equal(PIN_ALPHABET.length, 32);
  assert.equal(new Set(PIN_ALPHABET).size, 32);
  for (let i = 0; i < 100; i++) {
    const pin = generateRoomPin();
    assert.match(pin, /^[A-HJ-NP-Z2-9]{5}$/);
    assert.equal(parseRoomId(pin), pin);
  }
});
test('PIN input accepts lowercase and surrounding whitespace but rejects invalid room IDs', () => {
  assert.equal(parseRoomId(' k7m4p '), 'K7M4P');
  for (const value of [null, '', 'ABCD', 'ABCDEF', 'AB 23', 'IO012', '<img>', '-----', 'a'.repeat(36)]) assert.equal(parseRoomId(value), null);
});
test('Existing UUID room links remain usable and keep the same signaling ID', () => {
  const legacy = '01234567-89ab-4cde-8f01-23456789abcd';
  assert.equal(parseRoomId(legacy), legacy);
  assert.equal(parseRoomId(legacy.toUpperCase()), legacy);
});
test('A short room PIN is retained through voting and the participant view', () => {
  let room = createRoom('K7M4P', 'host', 'Sprint planning', 'Host');
  room = reduceRoom(room, 'host', { type: 'add', title: 'First story' });
  const story = room.stories[0];
  room = reduceRoom(room, 'host', { type: 'vote', storyId: story.id, round: story.round, value: '5' });
  assert.equal(viewFor(room, 'guest').id, 'K7M4P');
  assert.equal(viewFor(room, 'guest').stories[0].votes.host, null);
});
