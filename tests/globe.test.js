import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, spawnFlock, solar, INITIAL_TIME, toVector, dot } from '../src/model.js';
const globe = await import('../src/globe.js').catch(() => ({}));

test('Earth scene is a real spherical atlas with grid, poles, atmosphere and an astronomical sun', () => {
  assert.equal(typeof globe.earthScene, 'function', 'Earth scene exists');
  const atlas = globe.earthScene();
  assert.equal(atlas.earth.geometry.type, 'SphereGeometry');
  assert.equal(atlas.scene.getObjectByName('graticule').type, 'Group');
  assert.equal(atlas.scene.getObjectByName('atmosphere').type, 'Mesh');
  assert.ok(atlas.scene.getObjectByName('north-pole').position.y > 1);
  assert.ok(atlas.scene.getObjectByName('south-pole').position.y < -1);
  atlas.setSun(INITIAL_TIME);
  const actual = atlas.sun.position.clone().normalize().toArray();
  const expected = solar(INITIAL_TIME).direction;
  const cameraDirection = toVector(18, -62);
  assert.ok(dot(expected, cameraDirection) > .3 && dot(expected, cameraDirection) < .75, 'default atlas shows a visible day/night terminator');
  actual.forEach((value, i) => assert.ok(Math.abs(value - expected[i]) < 1e-10));
  atlas.setSun(INITIAL_TIME + 12 * 3600000);
  assert.ok(atlas.sun.position.clone().normalize().dot({ x: actual[0], y: actual[1], z: actual[2] }) < -.6);
});

test('every individual bird is rendered above the shell and new paused flocks have immediate geometry', () => {
  assert.equal(typeof globe.flockVisual, 'function', 'flock geometry exists');
  const s = createSimulation();
  const f = s.flocks[0];
  const visual = globe.flockVisual(f);
  const birds = visual.group.children.find(child => child.name === `birds-flock-${f.id}`);
  assert.equal(birds.geometry.attributes.position.count, f.birds.length * 4);
  for (let i = 0; i < birds.geometry.attributes.position.count; i++) {
    const a = birds.geometry.attributes.position.array;
    const radius = Math.hypot(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
    assert.ok(Math.abs(radius - 1.016) < 1e-6);
  }
  assert.equal(visual.group.children[1].geometry.drawRange.count, 1);
  f.trail.push(f.birds[0].p);
  visual.update(f);
  assert.equal(visual.group.children[1].geometry.drawRange.count, 2);
  visual.dispose();
});

test('repeated-species flocks retain distinct nonwhite colors in the actual renderer', () => {
  const state = createSimulation();
  const request = { species: 'arctic-tern', count: 2, lat: 20, lon: -45 };
  const flocks = [state.flocks[0], spawnFlock(state, request), spawnFlock(state, request)];
  const colors = flocks.map(flock => {
    const visual = globe.flockVisual(flock);
    const color = visual.group.children[0].material.color.getHexString();
    assert.equal(visual.group.children[1].material.color.getHexString(), color);
    visual.dispose();
    return color;
  });
  assert.equal(new Set(colors).size, flocks.length, 'renderer must not collapse repeated-flock colors');
  assert.ok(colors.every(color => color !== 'ffffff'), 'every flock uses its specified color');
});
