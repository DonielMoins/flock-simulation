import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/model.js';

test('UTC solstice sun produces opposite polar daylight and equinox gives twelve-hour equatorial days', () => {
  assert.equal(typeof m.solar, 'function', 'solar model exists');
  const june = m.solar(Date.parse('2026-06-21T12:00Z'));
  const december = m.solar(Date.parse('2026-12-21T12:00Z'));
  assert.ok(june.declination > 23 && june.declination < 24);
  assert.ok(december.declination < -23 && december.declination > -24);
  assert.equal(m.dayLength(80, june.declination), 24);
  assert.equal(m.dayLength(-80, june.declination), 0);
  assert.equal(m.dayLength(80, december.declination), 0);
  assert.equal(m.dayLength(-80, december.declination), 24);
  assert.ok(Math.abs(m.dayLength(0, m.solar(Date.parse('2026-03-20T12:00Z')).declination) - 12) < .01);
  assert.ok(m.dot(june.direction, m.toVector(0, 0)) > .9);
  assert.ok(m.dot(m.solar(Date.parse('2026-06-21T00:00Z')).direction, m.toVector(0, 0)) < -.9);
  assert.ok(m.dot(june.direction, m.toVector(90, 0)) > 0);
});

test('solar calendar arithmetic preserves accepted years below 100 and four-digit year limits', () => {
  for (const year of ['0001', '0004', '0099', '0100', '2026', '9999']) {
    const june = m.solar(Date.parse(`${year}-06-21T12:00Z`));
    const december = m.solar(Date.parse(`${year}-12-21T12:00Z`));
    assert.ok(june.declination > 23 && june.declination < 24, `${year} June declination`);
    assert.ok(december.declination < -23 && december.declination > -24, `${year} December declination`);
    assert.ok(june.direction.every(Number.isFinite));
  }
});
