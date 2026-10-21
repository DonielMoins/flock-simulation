import './style.css';
import { createSimulation, advance } from './model.js';
import { mountGlobe } from './globe.js';
import { bindControls } from './controls.js';

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = createSimulation({ reducedMotion: motion.matches });
const renderStatus = document.getElementById('render-status');
let ui, view;
try {
  view = mountGlobe(document.getElementById('globe'), (lat, lon) => ui.select(lat, lon), message => { renderStatus.textContent = message; });
} catch (error) {
  renderStatus.textContent = 'This globe needs WebGL. Enable hardware acceleration or try another browser.';
  console.error('Unable to initialize Earth renderer:', error);
  view = { draw() {}, camera() {}, select() {}, reset() {} };
}
ui = bindControls(document, state, view);
view.select(20, -45);
view.draw(state);
let last = null, lastSync = 0;
function frame(now) {
  const elapsed = last === null ? 0 : (now - last) / 1000;
  last = now;
  if (!document.hidden && !state.paused) {
    advance(state, elapsed);
    view.draw(state);
    if (now - lastSync >= 200) { ui.sync(); lastSync = now; }
  }
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = null; });
motion.addEventListener('change', event => {
  state.reducedMotion = event.matches;
  if (event.matches) state.paused = true;
  ui.sync();
});
requestAnimationFrame(frame);
