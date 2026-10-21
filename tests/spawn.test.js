import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/model.js';

test('spawning creates independent bounded flocks and rejects invalid payloads atomically', () => {
  assert.equal(typeof m.createSimulation, 'function', 'simulation boundary exists');
  const s = m.createSimulation({ empty: true });
  const request = { species: 'arctic-tern', count: 16, lat: 90, lon: 180 };
  const a = m.spawnFlock(s, request);
  const b = m.spawnFlock(s, request);
  assert.notEqual(a.id, b.id);
  assert.notEqual(a.color, b.color);
  assert.equal(s.flocks.length, 2);
  assert.equal(a.birds.length, 16);
  assert.notEqual(a.birds[0], b.birds[0]);
  for (const bad of [{ species: '__proto__' }, { species: new String('arctic-tern') }, { count: 0 }, { count: 1.5 }, { count: m.LIMITS.perFlock + 1 }, { count: '5' }, { lat: NaN }, { lat: -91 }, { lon: Infinity }, { lon: 181 }]) {
    assert.throws(() => m.spawnFlock(s, { ...request, ...bad }), RangeError);
    assert.equal(s.flocks.length, 2);
  }
  while (s.flocks.length < m.LIMITS.flocks) m.spawnFlock(s, { ...request, count: 1 });
  assert.throws(() => m.spawnFlock(s, request), /flock/i);
  const capped = m.createSimulation({ empty: true });
  while (capped.flocks.reduce((n, f) => n + f.birds.length, 0) < m.LIMITS.total) m.spawnFlock(capped, { ...request, count: m.LIMITS.perFlock });
  assert.throws(() => m.spawnFlock(capped, { ...request, count: 1 }), /bird/i);
});
