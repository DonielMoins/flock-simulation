import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import * as globe from '../src/globe.js';

test('button and keyboard camera actions orbit, zoom within bounds and restore the atlas view', () => {
  assert.equal(typeof globe.cameraAction, 'function', 'camera actions exist');
  const camera = new THREE.PerspectiveCamera(42, 1.2, .1, 30);
  globe.cameraAction(camera, 'reset');
  const initial = camera.position.clone();
  assert.ok(Math.abs(initial.length() - 2.9) < 1e-10, 'default globe fills the approved atlas composition');
  globe.cameraAction(camera, 'left');
  assert.notDeepEqual(camera.position.toArray(), initial.toArray());
  assert.ok(Math.abs(camera.position.length() - initial.length()) < 1e-10);
  globe.cameraAction(camera, 'in');
  assert.ok(camera.position.length() < initial.length());
  for (let i = 0; i < 100; i++) globe.cameraAction(camera, 'in');
  assert.ok(camera.position.length() >= 2.05 - 1e-9);
  for (let i = 0; i < 100; i++) globe.cameraAction(camera, 'up');
  assert.ok(camera.position.toArray().every(Number.isFinite));
  for (let i = 0; i < 100; i++) globe.cameraAction(camera, 'out');
  assert.ok(camera.position.length() <= 7 + 1e-9);
  globe.cameraAction(camera, 'reset');
  assert.deepEqual(camera.position.toArray(), initial.toArray());
});
