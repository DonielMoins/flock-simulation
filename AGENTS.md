# FLOCK project

Build the smallest complete browser-based spherical flock simulation. User approved the exact v001 image and requested spawning new flocks of different species. No commits or production deployment unless explicitly requested. No backend, accounts, analytics or persistence. Do not touch other projects or workstation configuration.

Approved reference: docs/design/mockups/globe/assets/v001/mockup.png (1536x1024). Preserve its globe-dominant midnight atlas composition, typography hierarchy, slate panels and muted mint/amber/lavender accents. Add species spawning within the sidebar; raster text/counts are non-authoritative. Image generation requirement for any new candidates: GPT Image 2; do not silently substitute models. Do not edit hash-anchored prompt, brief or image bytes. Scope/behavior contract: docs/implementation.md.

Use ponytail:ponytail, minimal vanilla browser JS, platform capabilities and installed dependencies. Three.js is appropriate for real sphere/OrbitControls; no UI framework is needed. Tests use Node's built-in test runner. npm run check must run tests and production build. New nontrivial model logic needs RED-GREEN tests before implementation. Expose authoritative simulation math through a DOM-free module, not UI-only duplicated calculations.

Repository root: /home/donielmoins/dev/flock. Codebase-memory project: flock. Reindex this root before structural review, check coverage of every relied-on file and read missed source directly. Docs, test files and assets can be excluded by the index and must be read directly. Historical QA logs retain original scratch paths; do not rewrite hash-anchored design assets or briefs for relocation.

Keep controls labelled, keyboard-operable and touch-sized; honor reduced motion with paused initial state. Validate species/count/location at the simulation boundary and cap total birds. All biological constants/flight speeds are illustrative, not measured. User-facing notice must say this is a stylized model without real migration tracking, weather, habitat or geographic-route constraints.

Builder owns application source, tests, package scripts/config and locally bundled earth data. Parent owns approval/provenance, implementation contract, README and QA evidence. Auditors are read-only. Do not start servers; parent owns server/tunnel lifecycle.
