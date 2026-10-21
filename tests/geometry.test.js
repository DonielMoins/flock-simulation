import test from 'node:test';
import assert from 'node:assert/strict';
const model = await import('../src/model.js').catch(() => ({}));

test('geographic vectors stay finite and round-trip across poles and the antimeridian', () => {
  assert.equal(typeof model.toVector, 'function', 'geographic conversion is implemented');
  for (const [lat, lon] of [[0, 0], [42, -71], [-89.999, 179.999], [89.999, -180], [90, 0], [-90, 180]]) {
    const p = model.toVector(lat, lon);
    assert.ok(p.every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...p) - 1) < 1e-12);
    const result = model.toLatLon(p);
    assert.ok(Math.abs(result.lat - lat) < 1e-6);
    if (Math.abs(lat) < 90) assert.ok(Math.abs(result.lon - lon) < 1e-6);
  }
});
