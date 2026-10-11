# THEIA 1.0.1 source

Classic scripts are assembled by ../build_local.py into ../dist/THEIA-1.0.1.html. The local artifact has no external script, module, stylesheet or font dependency and includes no game or Core.

- index.html / style.css: approved three-step, adaptive layout; templates only.
- ../assets/brand/theia-header.svg: user-provided outlined header embedded by the build; title/subtitle scale together without cropping.
- app.js / versions.js: session, UI, release discovery, selection, fetch limits and export.
- inject.js: exact text projection preserving the existing Python injector semantics.
- package.js: strict adapter manifest, ZIP directory/actual inflation bounds, CRC/hash and public paired Core checks.
- worker.js: selected-game/package state and local hash/decompression/injection.

Do not open the source template as the product. Build the self-contained dist HTML. Future public SYNODIC packaging remains a coordinated integration task; current private fixture is internal b6.9, not a public 1.0.0 Core.
