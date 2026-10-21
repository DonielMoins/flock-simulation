import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { globeGesture } from './ui.js';
import { solar, toVector, toLatLon, unit, cross, scale, add } from './model.js';

export function flockVisual(flock) {
  const group = new THREE.Group();
  const birdPositions = new Float32Array(flock.birds.length * 12);
  const trailPositions = new Float32Array(64 * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(birdPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const birds = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: flock.color, toneMapped: false }));
  birds.name = `birds-flock-${flock.id}`;
  birds.frustumCulled = false;
  const trailGeometry = new THREE.BufferGeometry();
  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3).setUsage(THREE.DynamicDrawUsage));
  const trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: flock.color, transparent: true, opacity: .5, toneMapped: false }));
  trail.frustumCulled = false;
  trail.name = `trail-flock-${flock.id}`;
  group.add(birds, trail);
  function update(current) {
    current.birds.forEach((bird, i) => {
      const forward = unit(bird.v);
      const side = unit(cross(bird.p, forward));
      const tip = scale(unit(add(bird.p, scale(forward, .007))), 1.016);
      const rear = add(bird.p, scale(forward, -.005));
      const left = scale(unit(add(rear, scale(side, .006))), 1.016);
      const right = scale(unit(add(rear, scale(side, -.006))), 1.016);
      birdPositions.set([...left, ...tip, ...tip, ...right], i * 12);
    });
    geometry.attributes.position.needsUpdate = true;
    current.trail.forEach((p, i) => trailPositions.set(scale(p, 1.01), i * 3));
    trailGeometry.setDrawRange(0, current.trail.length);
    trailGeometry.attributes.position.needsUpdate = true;
  }
  update(flock);
  const dispose = () => group.children.forEach(child => { child.geometry.dispose(); child.material.dispose(); });
  return { group, update, dispose };
}

export function cameraAction(camera, action) {
  if (action === 'reset') camera.position.fromArray(toVector(18, -62)).multiplyScalar(2.9 / Math.min(1, camera.aspect));
  else {
    const spherical = new THREE.Spherical().setFromVector3(camera.position);
    if (action === 'left') spherical.theta -= .14;
    if (action === 'right') spherical.theta += .14;
    if (action === 'up') spherical.phi -= .13;
    if (action === 'down') spherical.phi += .13;
    if (action === 'in') spherical.radius *= .86;
    if (action === 'out') spherical.radius /= .86;
    spherical.phi = Math.max(.05, Math.min(Math.PI - .05, spherical.phi));
    spherical.radius = Math.max(2.05, Math.min(7, spherical.radius));
    camera.position.setFromSpherical(spherical);
  }
  camera.lookAt(0, 0, 0);
}

export function earthScene() {
  const scene = new THREE.Scene();
  const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshPhongMaterial({ color: '#9bb9c9', shininess: 8, specular: '#1b3444' }));
  earth.name = 'earth';
  scene.add(earth, new THREE.AmbientLight('#718ca7', .25));
  const sun = new THREE.DirectionalLight('#fff3da', 2.4);
  scene.add(sun);
  const grid = new THREE.Group();
  grid.name = 'graticule';
  function line(points, color, opacity, dashed = false) {
    const material = dashed ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: .022, gapSize: .016 }) : new THREE.LineBasicMaterial({ color, transparent: true, opacity });
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p).multiplyScalar(1.003))), material);
    if (dashed) path.computeLineDistances();
    grid.add(path);
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    if (!lat) continue;
    line(Array.from({ length: 181 }, (_, i) => toVector(lat, i * 2 - 180)), '#6da9c9', .23);
  }
  for (let lon = -180; lon < 180; lon += 15) line(Array.from({ length: 91 }, (_, i) => toVector(i * 2 - 90, lon)), '#5794ba', .2);
  line(Array.from({ length: 181 }, (_, i) => toVector(0, i * 2 - 180)), '#c2dce8', .72);
  for (const lat of [-66.5, 66.5]) line(Array.from({ length: 181 }, (_, i) => toVector(lat, i * 2 - 180)), '#c2dce8', .7, true);
  scene.add(grid);
  for (const [name, y] of [['north-pole', 1.008], ['south-pole', -1.008]]) {
    const pole = new THREE.Mesh(new THREE.SphereGeometry(.008, 8, 6), new THREE.MeshBasicMaterial({ color: '#c9e4f3' }));
    pole.name = name;
    pole.position.y = y;
    scene.add(pole);
  }
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.025, 64, 48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.BackSide, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 n; varying vec3 v; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
    fragmentShader: 'varying vec3 n; varying vec3 v; void main(){ float rim=pow(1.0-abs(dot(normalize(n),normalize(v))),3.2); gl_FragColor=vec4(0.18,0.52,0.88,rim*0.65); }',
  }));
  atmosphere.name = 'atmosphere';
  scene.add(atmosphere);
  const setSun = time => sun.position.fromArray(solar(time).direction).multiplyScalar(5);
  return { scene, earth, sun, setSun };
}

export function mountGlobe(element, onPick, onStatus) {
  const atlas = earthScene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  element.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 30);
  cameraAction(camera, 'reset');
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enablePan = false;
  orbit.enableDamping = false;
  orbit.minDistance = 2.05;
  orbit.maxDistance = 7;
  orbit.rotateSpeed = .65;
  const visuals = new Map();
  const marker = new THREE.Mesh(new THREE.TorusGeometry(.018, .002, 8, 32), new THREE.MeshBasicMaterial({ color: '#eaf5ed', toneMapped: false }));
  atlas.scene.add(marker);
  let currentState = null;
  function render() { renderer.render(atlas.scene, camera); }
  orbit.addEventListener('change', render);
  const labels = [
    [element.parentElement.querySelector('.arctic'), 66.5, -110],
    [element.parentElement.querySelector('.equator'), 0, -125],
    [element.parentElement.querySelector('.antarctic'), -66.5, -105],
  ];
  function projectLabels() {
    labels.forEach(([label, lat, lon]) => {
      const world = new THREE.Vector3(...toVector(lat, lon)).multiplyScalar(1.035);
      const visible = world.dot(camera.position) > 1.05;
      const screen = world.project(camera);
      label.style.left = `${(screen.x + 1) * 50}%`;
      label.style.top = `${(1 - screen.y) * 50}%`;
      label.style.opacity = visible ? '1' : '0';
    });
  }
  orbit.addEventListener('change', projectLabels);
  function resize() {
    const width = element.clientWidth, height = element.clientHeight;
    if (!width || !height) return;
    const oldFit = Math.min(1, camera.aspect);
    camera.aspect = width / height;
    camera.position.multiplyScalar(oldFit / Math.min(1, camera.aspect));
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    orbit.update();
    projectLabels();
    render();
  }
  new ResizeObserver(resize).observe(element);
  resize();
  new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}earth.jpg`, texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    atlas.earth.material.map = texture;
    atlas.earth.material.needsUpdate = true;
    onStatus('');
    render();
  }, undefined, () => onStatus('Earth imagery could not load. Reload to try again.'));
  const gesture = globeGesture();
  element.addEventListener('pointerdown', event => { element.focus({ preventScroll: true }); gesture.start(event); });
  document.addEventListener('pointermove', event => gesture.move(event));
  document.addEventListener('pointercancel', () => gesture.cancel());
  document.addEventListener('pointerup', event => {
    if (!gesture.end(event)) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObject(atlas.earth)[0];
    if (hit) { const { lat, lon } = toLatLon(hit.point.toArray()); onPick(lat, lon); }
  });
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); onStatus('Graphics context lost. Reload to restore the globe.'); });
  const clearFlocks = () => {
    visuals.forEach(visual => { atlas.scene.remove(visual.group); visual.dispose(); });
    visuals.clear();
  };
  return {
    draw(state) {
      currentState = state;
      atlas.setSun(state.time);
      for (const flock of state.flocks) {
        if (!visuals.has(flock.id)) { const visual = flockVisual(flock); visuals.set(flock.id, visual); atlas.scene.add(visual.group); }
        visuals.get(flock.id).update(flock);
      }
      render();
    },
    camera(action) { cameraAction(camera, action); orbit.update(); projectLabels(); render(); },
    select(lat, lon) {
      const normal = new THREE.Vector3(...toVector(lat, lon));
      marker.position.copy(normal).multiplyScalar(1.026);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      render();
    },
    reset() { clearFlocks(); cameraAction(camera, 'reset'); orbit.update(); projectLabels(); if (currentState) render(); },
  };
}
