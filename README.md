# FLOCK — Earth in motion

Browser simulation with a controllable 3D Earth, multiple independent bird flocks, daylight/season effects and species spawning.

## Try it

Temporary public preview: https://c8d5faca19e4ce.lhr.life/
Local built preview (currently running): http://127.0.0.1:4173/

In New flock, choose Arctic tern, Canada goose, Barn swallow or Common starling, set bird count, click Earth to choose a location (or enter latitude/longitude), then Spawn flock. Spawning works while paused. Repeated species get independent flock identities/colors.

Drag/touch-drag to orbit; wheel/pinch or +/- buttons zoom. Direction buttons and keyboard arrows on the focused globe also rotate; Home resets view. Date, UTC hour, months, play/pause and speed control simulation time. Sliders control separation/alignment/cohesion. Reset restores 96 birds / three flocks, June 21, 2026 at 20:00 UTC and default settings. Reduced-motion preference starts paused.

Limits: 80 birds per flock, 480 total birds and 12 flocks. 1× advances ten simulated UTC minutes per real second; visible flight speed is illustrative.

## Run from source

Node.js and npm required. From this directory:

    npm ci
    npm run dev

Use the local address printed by Vite. Production build and full verification:

    npm run check

This runs node:test and builds dist/. Serve only dist/ for a read-only static preview:

    python -m http.server 4173 --bind 127.0.0.1 --directory dist

Current tracked preview processes: local server proc_802f96cf0925 and tunnel proc_738c096a0b54 (Hermes handles, not shell PIDs). These are temporary processes, not production hosting; if port 4173 is already occupied by the current preview, use its running instance or select another port.

## Verification and limits

Parent check: 19 tests passed and production build succeeded. npm audit reported zero vulnerabilities. Actual Chromium desktop and 390px phone-emulated browser interactions verified spawning, caps, pause/time, globe controls, reduced motion, polar daylight, WebGL failure feedback and responsive layout. Details/evidence: docs/qa/report.md and docs/qa/browser-checks.jsonl. The nonfatal Three.js bundle-size warning remains.

Stylized simulation only: no live tracking/weather/habitat/geographic-route constraints or calibrated flight speeds. All species coefficients and migration targets are illustrative; arbitrary coordinates do not imply valid habitat. Season names use meteorological months; illumination is continuously date/time-driven with an idealized geometric horizon. NASA Earth imagery is static historic imagery, not real-time or seasonally updated vegetation/ice. No backend, accounts, analytics or saved sessions. Physical-device/full screen-reader testing not performed.

## Approved design and sources

Approved v001: docs/design/mockups/globe/assets/v001/mockup.png
Approval/provenance: docs/design/mockups/globe/assets/v001/manifest.json
Original hash-anchored brief: docs/design/mockups/globe/brief.md (candidate text is historical)
Current contract: docs/implementation.md
Concept sources: docs/sources.md
NASA image source/credit/usage: public/earth-source.txt

v001 visual approval was followed by the user's species/spawn addition. Raster text/counts are non-authoritative; image/model/aspect caveats remain in provenance. No new image generation occurred during implementation.

Project location: /home/donielmoins/dev/flock. Moved out of temporary scratch into the development directory on 2026-10-21. Initialized as a local Git repository on main. Origin: https://github.com/DonielMoins/flock-simulation.git. No production deployment was created. Historical QA logs retain the original scratch paths where those checks ran.
