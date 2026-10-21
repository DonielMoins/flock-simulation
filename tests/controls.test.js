import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation } from '../src/model.js';
const controls = await import('../src/controls.js').catch(() => ({}));

// Minimal native EventTarget fixture: real model and real event handlers, no browser/WebGL.
class Element extends EventTarget {
  constructor(value = '') { super(); this.value = value; this.dataset = {}; this.children = []; this.textContent = ''; this.attributes = {}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(key, value) { this.attributes[key] = value; }
}
function documentFixture() {
  const fields = new Map();
  const defaults = { species: 'arctic-tern', count: '24', latitude: '20', longitude: '-45', speed: '1', date: '2026-06-21', hour: '16', separation: '.6', alignment: '.7', cohesion: '.5' };
  return {
    getElementById(id) { if (!fields.has(id)) fields.set(id, new Element(defaults[id] || '')); return fields.get(id); },
    createElement() { return new Element(); },
    activeElement: null,
  };
}
const fire = (element, type) => element.dispatchEvent(new Event(type, { cancelable: true }));

test('real controls spawn while paused, surface errors, update totals and reset defaults', () => {
  assert.equal(typeof controls.bindControls, 'function', 'DOM control wiring exists');
  const doc = documentFixture();
  const s = createSimulation({ reducedMotion: true });
  let renders = 0, resets = 0;
  const ui = controls.bindControls(doc, s, { draw() { renders++; }, camera() {}, select() {}, reset() { resets++; } });
  const $ = id => doc.getElementById(id);
  assert.equal($('species').children.length, 4);
  assert.equal($('months').children.length, 12);
  fire($('spawn-form'), 'submit');
  assert.equal(s.flocks.length, 4);
  assert.equal(s.paused, true);
  assert.match($('status').textContent, /24.*Arctic tern/i);
  assert.match($('live-totals').textContent, /120 birds.*4 flocks/);
  assert.ok(renders > 0);
  $('count').value = '1.5';
  fire($('spawn-form'), 'submit');
  assert.equal(s.flocks.length, 4);
  assert.match($('status').textContent, /integer/i);
  assert.equal($('status').dataset.kind, 'error');
  $('cohesion').value = '1.5';
  fire($('cohesion'), 'input');
  assert.equal(s.behavior.cohesion, 1.5);
  fire($('pause'), 'click');
  assert.equal(s.paused, false);
  $('date').value = '2026-12-25';
  fire($('date'), 'change');
  assert.match($('north-season').textContent, /winter/i);
  assert.equal($('north-season').dataset.season, 'winter');
  assert.equal($('south-season').dataset.season, 'summer');
  fire($('reset'), 'click');
  assert.equal(s.flocks.length, 3);
  assert.equal(s.behavior.cohesion, .5);
  assert.equal(s.paused, true);
  assert.equal($('count').value, '24');
  assert.equal(resets, 1);
  ui.sync();
  assert.match($('live-totals').textContent, /96 birds.*3 flocks/);
});
