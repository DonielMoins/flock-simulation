# Parent verification — FLOCK

Verified at: 2026-10-21T14:47:28.560190+00:00

## Actual execution

- Parent freshly ran `npm run check`: exit 0, 19 tests / 19 passed / 0 failed, followed by production Vite build. Latest source includes all browser-found fixes and the local favicon. Nonfatal bundle warning: 577.45 kB minified JS (146.33 kB gzip).
- Parent ran `npm audit`: exit 0, 0 vulnerabilities.
- Node tests cover spherical/tangential finite trajectories, pole/antimeridian behavior, isolation, species parameters, daylight/activity and seasonal steering, input/cap rejection, UTC rollover/leap day, pause/reset and real event-handler wiring. These do not replace the browser checks below.
- Artifact/provenance verifier: exit 0; approved mockup hash anchors preserved.

## Browser execution (Chromium, production dist served over HTTP)

Evidence log: browser-checks.jsonl, six parsed independent records with unique check names. Browser tool was the primary path; no standalone Playwright substitution.

- Desktop 1536×1024: actual Earth texture, grid, terminator and individual colored chevrons rendered; no horizontal overflow. Compared composition with approved v001: dominant globe, right controls, bottom timeline preserved. NASA photograph is more naturalistic/darker than the generated sage mockup; spawning increases sidebar scroll. No claim of pixel identity.
- Reduced-motion reload started paused; clock and canvas screenshot remained unchanged. Rotate/zoom/reset buttons and keyboard ArrowRight changed/restored the actual rendered canvas. Stationary click selected coordinates; real pointer drag did not relocate selection.
- Paused date/hour/month changes updated illumination and opposing seasonal labels. December polar daylight N=0/S=24 and June N=24/S=0. Speed and play/pause advanced/froze UTC. Behavior slider outputs changed; node tests independently establish actual steering effects.
- Spawned all four species and two independent same-species flocks, keeping pause state and unique identities. Also spawned at the north pole/antimeridian. Native invalid counts blank/zero/negative/fractional/81 were rejected without count mutation. Exactly 480 birds accepted, next bird rejected; separately exactly 12 flocks/105 birds accepted, next flock rejected. Played and orbited at 480 birds successfully; this is not a formal performance benchmark.
- Mobile 390×844: document clientWidth=390, scrollWidth=390, measured controls at least 44×44 CSS px, no overlapping fields. Touch-emulated tap selected coordinates and drag did not select. Real accessibility tree exposed labelled controls; reset-view icon name fixed and rechecked after reload. Physical-device testing and full screen-reader audit not performed.
- Forced actual WebGL context loss showed readable recovery guidance. Forced initialization failure showed WebGL/browser guidance with no fake canvas. Removed fixture and reloaded: normal renderer recovered with no captured errors.
- Current public preview browser-rendered successfully at https://c8d5faca19e4ce.lhr.life/ . The original 1e9dc2d1ef70a3 hostname rotated and returned 502 while the local app remained 200; the same tunnel announced this replacement. Final instrumented reload exercised corrected ancient-year controls, starling spawn/reset, desktop/mobile layout and the Reset view accessibility name. Runtime requests were same-origin JS, CSS, Earth JPEG and local favicon.svg, with no captured JS exceptions/unhandled rejections/console.error. Earlier implicit favicon.ico 404 was resolved by the bundled SVG. Screenshot public-desktop.png and final log record identify the current build.

## Browser-found fixes (tests first)

1. `tests/ui.test.js`: default Jun 21 and meteorological boundary assertions failed (exit 1). Replaced derivative-of-approximate-declination season inference with UTC meteorological month mapping, disclosed in footer. Focused rerun exit 0.
2. `tests/globe.test.js`: repeated-flock actual material colors collapsed to white (exit 1). Changed shared HSL generation to comma syntax supported by installed Three.js and native CSS. Focused rerun exit 0. This fixes both legend/renderer at one source.
3. `tests/surface.test.js`: mobile reset-view accessible name missing (exit 1). Added explicit aria-label, focused/full rerun exit 0; browser AX confirms Reset view.
4. Final reviewer reproduced year 0099 remapping to 1999 in UTC hour/month controls. New focused regression failed (exit 1); replaced Date.UTC reconstruction with existing Date UTC setters preserving year and valid month-end. Rerun exit 0.
5. Matching solar-calendar regression failed for year 0001 (exit 1); replaced Date.UTC year-boundary construction with UTC date setters so solar and UI share Gregorian-year semantics. Final npm run check: exit 0, 19/19 tests and production build. Browser recheck preserved 0099-02-28T12:30Z and 0004-02-29T12:30Z. Numerical year handling is not astronomical accuracy across millennia.

## Boundaries

No backend, accounts, telemetry, persistence, deployment, migration corridors, weather, habitat suitability, land-collision avoidance or field-calibrated speeds. Northern-profile species are illustrative tendencies, not global population predictions. Daylight has a geometric horizon; season names use meteorological months while solar declination continuously drives actual illumination/migration targets. Earth vegetation/ice is historic static imagery, not changing seasonal texture.

Project is temporary scratch and may be pruned. Preview server/tunnel are temporary local processes. No commit. Independent actual-source review found no additional ordinary-use blocker and identified an accepted ancient-year calendar defect; parent reproduced and fixed it with the two RED→GREEN slices above. Final check passed after these changes.

## Evidence files

- desktop.png and public-desktop.png
- mobile-globe.png and mobile-controls.png
- browser-checks.jsonl
- ../build-ledger.md (builder ledger; parent fixes above supersede its original 16-test count)
