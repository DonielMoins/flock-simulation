import { setTime } from './model.js';

export function seasons(time) {
  // Meteorological seasons are UTC calendar quarters, not extrema of approximate solar declination.
  const month = new Date(time).getUTCMonth();
  const north = ['winter', 'spring', 'summer', 'autumn'][Math.floor(((month + 1) % 12) / 3)];
  const south = { spring: 'autumn', summer: 'winter', autumn: 'spring', winter: 'summer' }[north];
  return [`Northern ${north}`, `Southern ${south}`];
}

export function globeGesture() {
  const pointers = new Set();
  let origin = null, dragged = false;
  return {
    start(e) {
      pointers.add(e.pointerId);
      if (pointers.size === 1) { origin = e; dragged = e.button !== 0; }
      else dragged = true;
    },
    move(e) {
      if (origin && Math.hypot(e.clientX - origin.clientX, e.clientY - origin.clientY) > 6) dragged = true;
    },
    end(e) {
      const picked = pointers.has(e.pointerId) && pointers.size === 1 && !dragged && origin && Math.hypot(e.clientX - origin.clientX, e.clientY - origin.clientY) <= 6;
      pointers.delete(e.pointerId);
      if (!pointers.size) origin = null;
      return Boolean(picked);
    },
    cancel() { pointers.clear(); origin = null; dragged = true; },
  };
}

export function changeDate(state, value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError('Choose a valid UTC date.');
  const midnight = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) throw new RangeError('Choose a valid UTC date.');
  const date = new Date(state.time);
  setTime(state, midnight + date.getUTCHours() * 3600000 + date.getUTCMinutes() * 60000);
}
export function changeHour(state, hour) {
  if (!Number.isFinite(hour) || hour < 0 || hour >= 24) throw new RangeError('UTC hour must be 0…23.99.');
  const date = new Date(state.time);
  date.setUTCHours(0, 0, 0, 0);
  setTime(state, date.getTime() + hour * 3600000);
}
export function changeMonth(state, month) {
  if (!Number.isInteger(month) || month < 0 || month > 11) throw new RangeError('Choose a valid month.');
  const date = new Date(state.time);
  const day = date.getUTCDate();
  date.setUTCMonth(month + 1, 0);
  date.setUTCDate(Math.min(day, date.getUTCDate()));
  setTime(state, date.getTime());
}
