import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the app surface exposes labelled simulation, spawn and keyboard camera controls with local assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8').catch(() => '');
  assert.doesNotMatch(html, /Illustrative simulation|class="badge"/, 'header simulation marker stays removed');
  assert.match(html, /<h1[^>]*>FLOCK<\/h1>/, 'approved app surface exists');
  for (const id of ['date', 'hour', 'speed', 'species', 'count', 'latitude', 'longitude', 'separation', 'alignment', 'cohesion']) {
    assert.match(html, new RegExp(`for="${id}"`), `${id} has a visible label`);
    assert.match(html, new RegExp(`id="${id}"`));
  }
  for (const action of ['pause', 'zoom-in', 'zoom-out', 'view-reset', 'rotate-left', 'rotate-right', 'rotate-up', 'rotate-down', 'reset']) assert.match(html, new RegExp(`id="${action}"`));
  assert.match(html, /id="view-reset"[^>]*aria-label="Reset view"/, 'reset view keeps its accessible name when mobile hides the text');
  assert.match(html, /id="spawn-form"/);
  assert.match(html, /id="status"[^>]*role="status"/);
  assert.match(html, /id="globe"[^>]*tabindex="0"/);
  assert.match(html, /type="module" src="\/src\/main.js"/);
  assert.doesNotMatch(html, /https?:\/\//);
});
