import { SPECIES, LIMITS, spawnFlock, resetSimulation, solar, dayLength } from './model.js';
import { changeDate, changeHour, changeMonth, seasons } from './ui.js';

export function bindControls(doc, state, view) {
  const $ = id => doc.getElementById(id);
  const node = (tag, className, text) => {
    const element = doc.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const number = id => $(id).value.trim() === '' ? NaN : Number($(id).value);
  const report = (message, kind = 'success') => { $('status').textContent = message; $('status').dataset.kind = kind; };
  let listKey = '';
  for (const [id, profile] of Object.entries(SPECIES)) {
    const option = node('option', '', profile.name);
    option.value = id;
    $('species').append(option);
  }
  const monthButtons = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ').map((name, month) => {
    const button = node('button', 'month', name);
    button.type = 'button';
    button.setAttribute('aria-label', `Set month to ${name}`);
    button.addEventListener('click', () => { changeMonth(state, month); refresh(); });
    $('months').append(button);
    return button;
  });
  function sync() {
    const date = new Date(state.time);
    const iso = date.toISOString();
    if (doc.activeElement !== $('date')) $('date').value = iso.slice(0, 10);
    if (doc.activeElement !== $('hour')) $('hour').value = String(date.getUTCHours() + date.getUTCMinutes() / 60);
    $('hour-output').textContent = iso.slice(11, 16);
    $('pause').textContent = state.paused ? '▶ Play' : 'Ⅱ Pause';
    $('pause').setAttribute('aria-pressed', String(state.paused));
    $('speed').value = String(state.speed);
    for (const name of ['separation', 'alignment', 'cohesion']) {
      $(name).value = String(state.behavior[name]);
      $(`${name}-output`).textContent = state.behavior[name].toFixed(1);
    }
    const labels = seasons(state.time);
    $('north-season').textContent = labels[0];
    $('south-season').textContent = labels[1];
    $('north-season').dataset.season = labels[0].split(' ')[1];
    $('south-season').dataset.season = labels[1].split(' ')[1];
    const declination = solar(state.time).declination;
    $('polar-light').textContent = `Daylight at 80° N: ${dayLength(80, declination).toFixed(1)} h · 80° S: ${dayLength(-80, declination).toFixed(1)} h`;
    monthButtons.forEach((button, month) => button.setAttribute('aria-current', date.getUTCMonth() === month ? 'date' : 'false'));
    const total = state.flocks.reduce((sum, flock) => sum + flock.birds.length, 0);
    $('live-totals').textContent = `${total} birds · ${state.flocks.length} flocks`;
    $('live-totals').dataset.birds = String(total);
    $('live-totals').dataset.flocks = String(state.flocks.length);
    $('flock-total').textContent = `${state.flocks.length} / ${LIMITS.flocks}`;
    $('capacity').textContent = `${total} / ${LIMITS.total} birds · ${LIMITS.perFlock} max/flock · ${LIMITS.flocks} max flocks`;
    $('globe').dataset.utc = iso;
    $('globe').dataset.paused = String(state.paused);
    const key = state.flocks.map(f => `${f.id}:${f.birds.length}`).join(',');
    if (listKey !== key) {
      listKey = key;
      $('flock-list').replaceChildren(...state.flocks.map(flock => {
        const row = node('li', 'flock-entry');
        row.dataset.flockId = String(flock.id);
        row.dataset.species = flock.species;
        row.setAttribute('title', `${SPECIES[flock.species].note}. Illustrative coefficients.`);
        const swatch = node('span', 'swatch');
        swatch.setAttribute('style', `background:${flock.color}`);
        const label = node('span', 'flock-name', `${SPECIES[flock.species].name} · ${flock.id}`);
        row.append(swatch, label, node('span', 'bird-count', `${flock.birds.length} birds`));
        return row;
      }));
    }
  }
  function refresh() { sync(); view.draw(state); }
  const attempt = action => {
    try { action(); refresh(); }
    catch (error) { report(error.message, 'error'); }
  };
  $('spawn-form').addEventListener('submit', event => {
    event.preventDefault();
    attempt(() => {
      const request = { species: $('species').value, count: number('count'), lat: number('latitude'), lon: number('longitude') };
      const flock = spawnFlock(state, request);
      view.select(request.lat, request.lon);
      report(`Added ${flock.birds.length} ${SPECIES[flock.species].name} birds as flock ${flock.id}.${state.paused ? ' Simulation remains paused.' : ''}`);
    });
  });
  $('pause').addEventListener('click', () => { state.paused = !state.paused; refresh(); });
  $('speed').addEventListener('change', () => {
    const speed = number('speed');
    if ([.25, 1, 4].includes(speed)) state.speed = speed;
    refresh();
  });
  $('date').addEventListener('change', () => attempt(() => changeDate(state, $('date').value)));
  $('hour').addEventListener('input', () => attempt(() => changeHour(state, number('hour'))));
  for (const name of ['separation', 'alignment', 'cohesion']) $(name).addEventListener('input', () => {
    const value = number(name);
    if (Number.isFinite(value) && value >= 0 && value <= 2) state.behavior[name] = value;
    refresh();
  });
  function select(lat, lon, announce = true) {
    $('latitude').value = lat.toFixed(2);
    $('longitude').value = lon.toFixed(2);
    view.select(lat, lon);
    if (announce) report(`Location selected: ${lat.toFixed(2)}° latitude, ${lon.toFixed(2)}° longitude.`);
    refresh();
  }
  for (const id of ['latitude', 'longitude']) $(id).addEventListener('change', () => {
    const lat = number('latitude'), lon = number('longitude');
    if (Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180) { view.select(lat, lon); refresh(); }
  });
  for (const [id, action] of Object.entries({ 'rotate-left': 'left', 'rotate-right': 'right', 'rotate-up': 'up', 'rotate-down': 'down', 'zoom-in': 'in', 'zoom-out': 'out', 'view-reset': 'reset' })) $(id).addEventListener('click', () => view.camera(action));
  $('globe').addEventListener('keydown', event => {
    const action = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', '+': 'in', '=': 'in', '-': 'out', Home: 'reset' }[event.key];
    if (action) { event.preventDefault(); view.camera(action); }
  });
  $('reset').addEventListener('click', () => {
    resetSimulation(state);
    listKey = '';
    for (const [id, value] of Object.entries({ species: 'arctic-tern', count: '24', latitude: '20', longitude: '-45' })) $(id).value = value;
    view.reset();
    view.select(20, -45);
    report('Simulation reset to June 21, 20:00 UTC and the original three flocks.');
    refresh();
  });
  sync();
  return { sync, select, report };
}
