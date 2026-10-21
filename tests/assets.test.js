import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test('Earth imagery is bundled with attribution and app code has no external runtime requests', async () => {
  const image = await readFile(new URL('../public/earth.jpg', import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), 'd4dc80a6ef571939d0abe04a9bed3d3d1e6cd63e59514be1c5e43a6b069e6f1e');
  const source = await readFile(new URL('../public/earth-source.txt', import.meta.url), 'utf8');
  assert.match(source, /NASA Images and Media Usage Guidelines/);
  assert.match(source, /Reto Stöckli/);
  for (const file of ['src/main.js', 'src/controls.js', 'src/globe.js', 'src/style.css', 'index.html']) {
    const content = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(content, /https?:\/\/|\bfetch\s*\(|\bXMLHttpRequest\b/, `${file} only uses local application assets`);
  }
});
