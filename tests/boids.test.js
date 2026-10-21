import test from 'node:test';
import assert from 'node:assert/strict';
import * as m from '../src/model.js';
const request = { species: 'canada-goose', count: 12, lat: 0, lon: 0 };
const scene = () => {
  const s = m.createSimulation({ empty: true });
  s.time = Date.parse('2026-06-21T12:00Z');
  s.behavior = { separation: .6, alignment: .7, cohesion: .5 };
  return s;
};

test('spherical boids preserve shell and tangent velocity through poles and antimeridian with isolated membership', () => {
  assert.equal(typeof m.stepFlocks, 'function', 'spherical boid stepping exists');
  const solo = scene();
  const paired = scene();
  for (const s of [solo, paired]) m.spawnFlock(s, { ...request, lat: 89.99, lon: 179.99 });
  const unrelated = m.spawnFlock(paired, { ...request, species: 'barn-swallow', lat: 89.99, lon: 179.99 });
  for (let i = 0; i < 600; i++) {
    m.stepFlocks(solo, .04);
    m.stepFlocks(paired, .04);
    for (const flock of paired.flocks) for (const bird of flock.birds) {
      assert.ok(bird.p.every(Number.isFinite) && bird.v.every(Number.isFinite));
      assert.ok(Math.abs(Math.hypot(...bird.p) - 1) < 1e-10);
      assert.ok(Math.abs(m.dot(bird.p, bird.v)) < 1e-10);
      assert.ok(Math.hypot(...bird.v) > 0);
    }
  }
  assert.deepEqual(paired.flocks[0].birds, solo.flocks[0].birds);
  assert.equal(unrelated.birds.length, 12);
  assert.ok(solo.flocks[0].trail.length > 2 && solo.flocks[0].trail.length <= 64);
  for (const name of ['separation', 'alignment', 'cohesion']) {
    const a = scene();
    m.spawnFlock(a, request);
    a.flocks[0].birds[0].v = m.scale(a.flocks[0].birds[0].v, -1);
    const b = structuredClone(a);
    a.behavior[name] = 0;
    b.behavior[name] = 2;
    m.stepFlocks(a, .04);
    m.stepFlocks(b, .04);
    assert.notDeepEqual(a.flocks[0].birds, b.flocks[0].birds, `${name} changes actual steering`);
  }
});

test('exact south-pole birds remain finite and daylight plus seasonal targets change their actual motion', () => {
  const south = scene();
  m.spawnFlock(south, { ...request, lat: -90, lon: -180 });
  for (let i = 0; i < 200; i++) m.stepFlocks(south, .05);
  for (const bird of south.flocks[0].birds) {
    assert.ok(bird.p.every(Number.isFinite) && bird.v.every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...bird.p) - 1) < 1e-10);
    assert.ok(Math.abs(m.dot(bird.p, bird.v)) < 1e-10);
  }
  const day = scene();
  m.spawnFlock(day, { ...request, species: 'arctic-tern', count: 1 });
  const night = structuredClone(day);
  night.time -= 12 * 3600000;
  m.stepFlocks(day, .05);
  m.stepFlocks(night, .05);
  assert.ok(Math.hypot(...day.flocks[0].birds[0].v) > Math.hypot(...night.flocks[0].birds[0].v) * 2);
  const summer = scene();
  m.spawnFlock(summer, { ...request, species: 'arctic-tern', count: 1, lon: 90 });
  const winter = structuredClone(summer);
  winter.time = Date.parse('2026-12-21T12:00Z');
  for (let i = 0; i < 100; i++) { m.stepFlocks(summer, .05); m.stepFlocks(winter, .05); }
  assert.ok(summer.flocks[0].birds[0].p[1] > winter.flocks[0].birds[0].p[1]);
});
