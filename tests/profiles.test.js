import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/model.js';

test('species profiles drive distinct speed, cohesion, seasonal latitude and daylight activity', () => {
  assert.equal(typeof m.flightConditions, 'function', 'species flight conditions exist');
  const june = Date.parse('2026-06-21T12:00Z');
  const winter = Date.parse('2026-12-21T12:00Z');
  const conditions = Object.keys(m.SPECIES).map(id => m.flightConditions(id, m.toVector(0, 0), june));
  assert.equal(new Set(conditions.map(c => c.speed)).size, 4);
  assert.equal(new Set(Object.values(m.SPECIES).map(p => p.cohesion)).size, 4);
  const ternSummer = m.flightConditions('arctic-tern', m.toVector(80, 0), june);
  const ternWinter = m.flightConditions('arctic-tern', m.toVector(80, 0), winter);
  assert.ok(ternSummer.targetLatitude > 60);
  assert.ok(ternWinter.targetLatitude < -60);
  assert.ok(ternSummer.activity > ternWinter.activity);
  for (const id of ['canada-goose', 'common-starling']) {
    const a = m.flightConditions(id, m.toVector(0, 0), june).targetLatitude;
    const b = m.flightConditions(id, m.toVector(0, 0), winter).targetLatitude;
    assert.ok(b > 0);
    assert.ok(a > b);
    if (id === 'common-starling') assert.ok(a - b < 15);
  }
  assert.ok(m.flightConditions('barn-swallow', [1, 0, 0], winter).targetLatitude < 0);
  const noon = m.flightConditions('barn-swallow', [1, 0, 0], june);
  const midnight = m.flightConditions('barn-swallow', [1, 0, 0], june - 12 * 3600000);
  assert.ok(noon.speed > midnight.speed * 2);
});
