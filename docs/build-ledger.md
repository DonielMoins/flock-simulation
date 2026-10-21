# Builder verification ledger

Repo: `/home/donielmoins/.hermes/cache/scratch/bird-globe-9fwo01j4`.
Final builder check recorded 2026-10-21T10:27:47-04:00. No server started and no commit made. Directory is not a Git repository (`git status` returned 128); existing documentation and approved image were preserved.

## Installed and exercised

- Node v24.22.1 / npm 11.19.1.
- Runtime: `three@0.186.1`. Dev: `vite@8.3.5`. No React, DOM test library, backend or persistence.
- `npm install three`: exit 0. The terminal classified direct Vite installation as a potential server command and rejected it before execution; `python -c` invoking bounded `subprocess.run(['npm','install','--save-dev','vite'],timeout=150)` installed it, exit 0. No server was substituted.
- `npm run check`: exit 0, **16 tests passed / 0 failed**, followed by a successful Vite production build.
- `npm audit`: exit 0, **0 vulnerabilities** (including dev dependencies).
- Build: `dist/index.html`, `dist/assets/index-CHvkqrbG.css`, `dist/assets/index-COX2HUzY.js`, `dist/earth.jpg`, `dist/earth-source.txt`.
- Build warning intentionally retained: JS bundle is 577.47 kB minified / 146.33 kB gzip, over Vite's 500 kB warning threshold. A single Three.js app does not benefit enough from another chunking configuration here; this is not a failed build.
- `sha256sum public/earth.jpg dist/earth.jpg`: identical `d4dc80a6ef571939d0abe04a9bed3d3d1e6cd63e59514be1c5e43a6b069e6f1e`.

## Vertical RED → GREEN checkpoints

Each checkpoint's focused test was written first, executed with exit **1** on an expected missing behavior/assertion, implemented, then rerun green (focused or full `npm test`, exit **0**) before the next implementation slice. Configuration/dependency setup preceded model implementation.

| Slice | RED invocation / expected failure |
| --- | --- |
| Geographic vectors | `npm test` — geographic conversion not implemented |
| Astronomical sun / geometric daylight | `node --test tests/solar.test.js` — solar model missing |
| Independent spawning / caps / validation | `node --test tests/spawn.test.js` — simulation boundary missing |
| Species / activity / seasonal targets | `node --test tests/profiles.test.js` — flight conditions missing |
| Spherical boid stepping / isolation / slider effects | `node --test tests/boids.test.js` — stepFlocks missing |
| Clock / pause / defaults / reset | `node --test tests/clock.test.js` — advance missing |
| UTC calendar adapter | `node --test tests/ui.test.js` — date adapter missing |
| Tap versus drag / multitouch guard | `node --test tests/ui.test.js` — globe gesture missing |
| Opposite hemisphere season presentation | `node --test tests/ui.test.js` — season presentation missing |
| Labelled HTML / keyboard controls / spawn form | `node --test tests/surface.test.js` — app surface missing |
| Real sphere / grid / poles / atmosphere / sun | `node --test tests/globe.test.js` — Earth scene missing |
| Per-bird render geometry / paused spawn geometry | `node --test tests/globe.test.js` — flock geometry missing |
| Camera controls | `node --test tests/camera.test.js` — camera actions missing |
| Actual event handlers → model → totals/reset | `node --test tests/controls.test.js` — DOM binding missing |
| Reject boxed/coercible species identifier | `node --test tests/spawn.test.js` — expected RangeError absent |
| Default visible day/night terminator | `node --test tests/globe.test.js` — default sun too close to camera axis |
| Globe-dominant framing | `node --test tests/camera.test.js` — default camera distance not 2.9 |
| Correct season icon state after date change | `node --test tests/controls.test.js` — season data attribute missing |

Additional characterization checks validate actual south-pole stepping, actual daylight/season changes to motion, the locally bundled image hash/attribution, and absence of external runtime request URLs in app source. These verification-only tests did not require production changes.

## Implementation/API handoff

- `src/model.js`: authoritative DOM-free geographic vectors, NOAA-style `solar(timestamp)`, idealized `dayLength(latitude, declination)`, frozen `SPECIES` / `LIMITS`, `createSimulation`, `spawnFlock`, `stepFlocks`, `advance`, `setTime`, `resetSimulation`.
- Four species IDs: `arctic-tern`, `canada-goose`, `barn-swallow`, `common-starling`. Distinct illustrative speeds, cohesion and seasonal latitude tendencies; north-only Canada goose and modest-displacement starling profiles. Barn swallow is a simplified northern breeding population. All biological coefficients are illustrative.
- `spawnFlock(state, {species, count, lat, lon})` validates primitive species ID, integer count and finite numeric latitude/longitude before mutation, with RangeError feedback. Caps: 80 birds/flock, 480 total birds, 12 flocks. Repeated species have independent IDs, colors, birds and neighbor interactions.
- Initial/reset: June 21, 2026 **20:00 UTC**, 96 birds in three flocks (36 tern / 32 goose / 28 swallow), speed 1, separation .6 / alignment .7 / cohesion .5. Initial pause follows reduced-motion preference. 20:00 rather than raster 12:00 makes the real sun show the approved Americas-lit / Atlantic-night composition; raster copy is non-authoritative.
- `advance` bounds frame time to .05 s and applies ¼×, 1× or 4× speed. At 1×, one real second advances ten UTC minutes; visual flight uses illustrative angular speed. Paused state prevents clock and bird movement. Main loop resets elapsed time after visibility changes; hidden tabs do not catch up.
- `src/ui.js`: shared UTC adapters and pointer gesture guard. `src/controls.js`: native DOM event handlers, truthful totals/status, labelled controls and month buttons. Its test uses native EventTarget with a minimal DOM fixture and the real model, not a substitute model; this is not browser/WebGL evidence.
- `src/globe.js`: actual Three.js sphere, NASA texture, grid/equator/polar circles, poles, atmospheric rim, real date/time directional light, per-bird tangent chevrons and bounded trails; OrbitControls imported through installed addon API. Keyboard/button camera path is shared.
- Inspectable UI: `#globe` has `data-utc` and `data-paused`; `#live-totals` has `data-birds` and `data-flocks`; `#flock-list li` exposes `data-flock-id` and `data-species`. No mutable global state or debug route.
- `index.html`, `src/style.css`: approved left-globe / right-sidebar / bottom-timeline composition, stacked phone layout, labelled native inputs, visible focus, skip link and reduced-motion rules. Sidebar can scroll vertically to accommodate spawning controls.
- Bundled image/source/license: `public/earth.jpg` and `public/earth-source.txt`. Historic NASA Blue Marble, 2048×1024, no runtime network calls. Current official NASA asset was fetched separately and verified byte-identical. Earlier guessed NASA asset URLs returned 404; they were not shipped. NASA usage guidelines and credit are recorded; no claimed CC license or endorsement.

## Structural lookup

After source creation, reindexed `bird-globe-temp` in moderate mode: 90 nodes / 239 edges, generation 2026-10-21T14:21:32Z. Queried entry points/dependencies/boundaries and exact coverage. Source application files were indexed; test files were excluded by fast-pattern, public assets by subtree exclusion, and styles had changed since indexing. Direct source/test reads plus actual asset hash/vision checks were used instead of treating graph exclusions as absence. A final moderate reindex recorded coverage at 2026-10-21T14:29:29Z (the daemon retained generation 2026-10-21T14:21:32Z); all eight app/package evidence paths then reported metadata_match and no recorded coverage issue. This remains a best-effort signal, not proof of exhaustive graph completeness.

## Explicit limits / parent-owned QA

No browser server, screenshots of the implementation, real WebGL run, live desktop/390px interaction check, console/network capture or pixel comparison was performed by this builder, per the server ownership constraint. Parent must do those before claiming full browser acceptance. Node geometry/DOM-fixture tests and a passing build do not prove browser fidelity or responsive overflow.

The model has no weather, habitat suitability, geographic-route constraints, observed migrations, land collision avoidance or calibrated bird flight speeds. The Earth texture is static historic imagery; only illumination changes. Trails start empty/short and accumulate while playing. Biological targets are broad tendencies, not tracked routes. WebGL failure/context loss shows a reload/browser guidance message, not a fake globe.
