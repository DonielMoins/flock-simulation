// Coordinates use positive-east longitude; Three.js Y is the north pole.
const RAD = Math.PI / 180;
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const scale = (v, s) => v.map(x => x * s);
export const unit = v => scale(v, 1 / (Math.hypot(...v) || 1));
export const tangent = (v, p) => add(v, scale(p, -dot(v, p)));
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export function toVector(lat, lon) {
  return [Math.cos(lat * RAD) * Math.cos(lon * RAD), Math.sin(lat * RAD), -Math.cos(lat * RAD) * Math.sin(lon * RAD)];
}
export function toLatLon(p) {
  const n = unit(p);
  return { lat: Math.asin(Math.max(-1, Math.min(1, n[1]))) / RAD, lon: Math.atan2(-n[2], n[0]) / RAD };
}

export const LIMITS = Object.freeze({ perFlock: 80, total: 480, flocks: 12 });
// Biological coefficients are illustrative visual parameters, not measurements.
export const SPECIES = Object.freeze({
  'arctic-tern': Object.freeze({ name: 'Arctic tern', color: '#ffca83', speed: .052, cohesion: .7, latitude: 0, range: 67, note: 'Summer-pole tendency' }),
  'canada-goose': Object.freeze({ name: 'Canada goose', color: '#7edebc', speed: .032, cohesion: 1.1, latitude: 45, range: 15, note: 'Northern migrant / resident tendency' }),
  'barn-swallow': Object.freeze({ name: 'Barn swallow', color: '#bfa4f4', speed: .062, cohesion: .55, latitude: 15, range: 30, note: 'Simplified northern breeding population' }),
  'common-starling': Object.freeze({ name: 'Common starling', color: '#8fc9ef', speed: .041, cohesion: 1.6, latitude: 45, range: 5, note: 'Resident / short-distance tendency' }),
});
export function flightConditions(species, position, timestamp, sun = solar(timestamp)) {
  const profile = SPECIES[species];
  const activity = .28 + .72 * Math.max(0, Math.min(1, (dot(position, sun.direction) + .12) / .35));
  return { activity, speed: profile.speed * activity, targetLatitude: profile.latitude + profile.range * Math.sin(sun.declination * RAD) / Math.sin(23.44 * RAD) };
}
export const INITIAL_TIME = Date.parse('2026-06-21T20:00:00Z');
export function createSimulation({ empty = false, reducedMotion = false } = {}) {
  const state = { flocks: [], nextId: 1, time: INITIAL_TIME, paused: reducedMotion, reducedMotion, speed: 1, behavior: { separation: .6, alignment: .7, cohesion: .5 } };
  if (!empty) {
    spawnFlock(state, { species: 'arctic-tern', count: 36, lat: 45, lon: -55 });
    spawnFlock(state, { species: 'canada-goose', count: 32, lat: 35, lon: -100 });
    spawnFlock(state, { species: 'barn-swallow', count: 28, lat: -7, lon: -42 });
  }
  return state;
}
export function resetSimulation(state) {
  Object.assign(state, createSimulation({ reducedMotion: state.reducedMotion }));
}
export function setTime(state, timestamp) {
  if (!Number.isFinite(timestamp) || !Number.isFinite(new Date(timestamp).getTime())) throw new RangeError('Choose a valid UTC date and time.');
  state.time = timestamp;
}
// At 1×: ten UTC minutes per real second; visual flight is deliberately illustrative.
export function advance(state, elapsedSeconds) {
  if (state.paused || !Number.isFinite(elapsedSeconds) || elapsedSeconds <= 0) return;
  const dt = Math.min(.05, elapsedSeconds) * state.speed;
  state.time += dt * 600000;
  const steps = Math.ceil(dt / .05);
  for (let i = 0; i < steps; i++) stepFlocks(state, dt / steps);
}
export function spawnFlock(state, { species, count, lat, lon } = {}) {
  if (typeof species !== 'string' || !Object.hasOwn(SPECIES, species)) throw new RangeError('Choose a listed species.');
  if (!Number.isInteger(count) || count < 1 || count > LIMITS.perFlock) throw new RangeError(`Bird count must be an integer from 1 to ${LIMITS.perFlock}.`);
  if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) throw new RangeError('Latitude must be −90…90 and longitude −180…180.');
  const total = state.flocks.reduce((n, f) => n + f.birds.length, 0);
  if (total + count > LIMITS.total) throw new RangeError(`The simulation is limited to ${LIMITS.total} birds.`);
  if (state.flocks.length >= LIMITS.flocks) throw new RangeError(`The simulation is limited to ${LIMITS.flocks} flocks.`);
  const id = state.nextId++;
  const center = toVector(lat, lon);
  const east = unit(cross([0, 1, 0], center));
  const side = Math.hypot(...east) > .1 ? east : [1, 0, 0];
  const north = unit(cross(center, side));
  const birds = Array.from({ length: count }, (_, i) => {
    const angle = i * 2.399963229728653 + id * .8;
    const spread = .012 * Math.sqrt(i);
    const p = unit(add(center, add(scale(side, Math.cos(angle) * spread), scale(north, Math.sin(angle) * spread))));
    return { p, v: scale(unit(tangent(add(side, scale(north, .5)), p)), .035) };
  });
  const copies = state.flocks.filter(f => f.species === species).length;
  const color = copies ? `hsl(${(id * 137.508) % 360}, 70%, 78%)` : SPECIES[species].color;
  const flock = { id, species, color, birds, trail: [center] };
  state.flocks.push(flock);
  return flock;
}

// Pairwise neighborhoods are intentionally bounded by the per-flock and total caps.
export function stepFlocks(state, seconds) {
  const dt = Math.max(0, Math.min(.05, seconds));
  if (!Number.isFinite(dt) || dt === 0) return;
  const sun = solar(state.time);
  for (const flock of state.flocks) {
    const profile = SPECIES[flock.species];
    const before = flock.birds;
    flock.birds = before.map(bird => {
      let separation = [0, 0, 0], alignment = [0, 0, 0], cohesion = [0, 0, 0];
      let neighbors = 0;
      for (const other of before) {
        if (other === bird) continue;
        const delta = add(other.p, scale(bird.p, -1));
        const d2 = dot(delta, delta);
        if (d2 > .18 ** 2 || d2 < 1e-12) continue;
        neighbors++;
        alignment = add(alignment, unit(other.v));
        cohesion = add(cohesion, delta);
        if (d2 < .045 ** 2) separation = add(separation, scale(delta, -1 / d2));
      }
      const conditions = flightConditions(flock.species, bird.p, state.time, sun);
      const north = unit(tangent([0, 1, 0], bird.p));
      const migration = scale(north, Math.tanh((Math.sin(conditions.targetLatitude * RAD) - bird.p[1]) * 3));
      let steering = scale(migration, .45);
      if (neighbors) {
        steering = add(steering, scale(unit(separation), state.behavior.separation * .9));
        steering = add(steering, scale(tangent(unit(alignment), bird.p), state.behavior.alignment * .6));
        steering = add(steering, scale(unit(tangent(cohesion, bird.p)), state.behavior.cohesion * profile.cohesion * .6));
      }
      const direction = unit(tangent(add(unit(bird.v), scale(steering, dt * 1.8)), bird.p));
      const p = unit(add(bird.p, scale(direction, conditions.speed * dt)));
      return { p, v: scale(unit(tangent(direction, p)), conditions.speed) };
    });
    flock.trailTime = (flock.trailTime || 0) + dt;
    if (flock.trailTime >= .15) {
      flock.trail.push(unit(flock.birds.reduce((p, bird) => add(p, bird.p), [0, 0, 0])));
      if (flock.trail.length > 64) flock.trail.shift();
      flock.trailTime = 0;
    }
  }
}

// NOAA fractional-year approximation; geometric horizon, no refraction correction.
export function solar(timestamp) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid UTC time.');
  const start = new Date(date);
  start.setUTCMonth(0, 1);
  start.setUTCHours(0, 0, 0, 0);
  const next = new Date(start);
  next.setUTCFullYear(date.getUTCFullYear() + 1);
  const days = (next - start) / 86400000;
  const day = Math.floor((timestamp - start) / 86400000) + 1;
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const g = 2 * Math.PI / days * (day - 1 + (hour - 12) / 24);
  const declination = (.006918 - .399912 * Math.cos(g) + .070257 * Math.sin(g) - .006758 * Math.cos(2 * g) + .000907 * Math.sin(2 * g) - .002697 * Math.cos(3 * g) + .00148 * Math.sin(3 * g)) / RAD;
  const equation = 229.18 * (.000075 + .001868 * Math.cos(g) - .032077 * Math.sin(g) - .014615 * Math.cos(2 * g) - .040849 * Math.sin(2 * g));
  const longitude = 180 - hour * 15 - equation / 4;
  return { declination, direction: toVector(declination, longitude) };
}
export function dayLength(latitude, declination) {
  const horizon = -Math.tan(latitude * RAD) * Math.tan(declination * RAD);
  return 24 * Math.acos(Math.max(-1, Math.min(1, horizon))) / Math.PI;
}
