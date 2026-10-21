import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation } from '../src/model.js';
const ui = await import('../src/ui.js').catch(() => ({}));

test('UTC date, hour and month controls preserve valid calendar boundaries', () => {
  assert.equal(typeof ui.changeDate, 'function', 'UTC control adapter exists');
  const s = createSimulation({ reducedMotion: true });
  ui.changeDate(s, '2028-01-31');
  ui.changeHour(s, 23.5);
  ui.changeMonth(s, 1);
  assert.equal(new Date(s.time).toISOString(), '2028-02-29T23:30:00.000Z');
  assert.equal(s.paused, true);
  for (const invalid of ['', '2026-02-30', 'not-a-date']) assert.throws(() => ui.changeDate(s, invalid), RangeError);
  for (const invalid of [-1, 24, NaN]) assert.throws(() => ui.changeHour(s, invalid), RangeError);
  assert.throws(() => ui.changeMonth(s, 12), RangeError);
});

test('UTC controls preserve accepted years below 100 instead of remapping them to the 1900s', () => {
  const state = createSimulation({ empty: true });
  ui.changeDate(state, '0099-12-31');
  ui.changeHour(state, 12.5);
  assert.equal(new Date(state.time).toISOString(), '0099-12-31T12:30:00.000Z');
  ui.changeMonth(state, 1);
  assert.equal(new Date(state.time).toISOString(), '0099-02-28T12:30:00.000Z');
  ui.changeDate(state, '0004-01-31');
  ui.changeMonth(state, 1);
  assert.equal(new Date(state.time).toISOString(), '0004-02-29T12:30:00.000Z');
});

test('globe picks distinguish taps from drags, out-and-back gestures and multitouch', () => {
  assert.equal(typeof ui.globeGesture, 'function', 'globe gesture guard exists');
  const g = ui.globeGesture();
  const event = (x, y, id = 1) => ({ clientX: x, clientY: y, pointerId: id, button: 0 });
  g.start(event(10, 10));
  assert.equal(g.end(event(12, 12)), true);
  g.start(event(10, 10));
  g.move(event(40, 10));
  assert.equal(g.end(event(10, 10)), false);
  g.start(event(10, 10));
  g.start(event(20, 10, 2));
  assert.equal(g.end(event(10, 10)), false);
  assert.equal(g.end(event(20, 10, 2)), false);
  g.start(event(10, 10));
  g.cancel();
  assert.equal(g.end(event(10, 10)), false);
  g.start(event(10, 10));
  assert.equal(g.end(event(50, 10)), false);
});

test('season copy follows the opposite northern and southern hemispheres', () => {
  assert.equal(typeof ui.seasons, 'function', 'season presentation exists');
  assert.deepEqual(ui.seasons(Date.parse('2026-06-21T20:00Z')), ['Northern summer', 'Southern winter']);
  assert.deepEqual(ui.seasons(Date.parse('2026-06-01T00:00Z')), ['Northern summer', 'Southern winter']);
  assert.deepEqual(ui.seasons(Date.parse('2026-03-01T00:00Z')), ['Northern spring', 'Southern autumn']);
  assert.deepEqual(ui.seasons(Date.parse('2026-09-01T00:00Z')), ['Northern autumn', 'Southern spring']);
  assert.deepEqual(ui.seasons(Date.parse('2026-12-01T00:00Z')), ['Northern winter', 'Southern summer']);
  assert.deepEqual(ui.seasons(Date.parse('2026-12-31T23:59Z')), ['Northern winter', 'Southern summer']);
  assert.deepEqual(ui.seasons(Date.parse('2026-06-25T12:00Z')), ['Northern summer', 'Southern winter']);
  assert.deepEqual(ui.seasons(Date.parse('2026-12-25T12:00Z')), ['Northern winter', 'Southern summer']);
  assert.deepEqual(ui.seasons(Date.parse('2026-04-01T12:00Z')), ['Northern spring', 'Southern autumn']);
});
