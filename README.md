# Coastline — City Life & Summit Range (v3)

Updated from the attached Coastline Expanded project.

## Run

Install Node.js 20 or newer, then in this folder run:

```
npm install
npm start
```

Open http://localhost:3000 in a desktop browser with WebGL enabled. Do not double-click index.html: the Node HTTP/WebSocket server must be running. Internet is required for npm installation and the browser's Three.js CDN imports. PORT defaults to 3000; DATA_DIR selects saved-player storage. Preserve your existing data directory and browser local storage when upgrading.

## Features

- Locally rendered 3D catalog previews with enlarged views for vehicles, outfits and representative home exteriors.
- Procedural textures and bump shading, prefiltered reflection environment, soft shadows, bloom and half-resolution ambient occlusion. Balanced graphics disables the expensive effects.
- Enterable public building lobbies, category-specific furnished businesses and home viewing tours before purchase.
- Subdivided ground movement, larger vehicle collision footprints and collisions with buildings, traffic and other players. Server-controlled traffic yields to pedestrians and cars; server-side swept car checks cover traffic and new businesses.
- Climbable Summit Range north of downtown with continuous terrain, trail, checkpoint signs and ranger contract. Heights are shared with the server.
- 20 named businesses/civic locations: restaurant, supermarket, gas station, cafe, bank, two offices, clinic, fire station, police station, library, gym, hotel, garage, lawn care depot, school, cinema, bakery, pharmacy and post office.
- 12 additional legal jobs (27 total): accounting, software support, administration, lawn care, chef, stocking, fuel attendant, barista, mail delivery, passenger pilot, ranger and hotel reception. Office/retail work uses timed tasks.
- City directory with navigation and paid game-cash services. Food, medicine and rest restore health as listed. Fuel and mechanic purchases are role-play only: no fuel-depletion or damage system is added.

## Controls

WASD/arrows move/drive; Shift sprints/boosts; Space brakes. Mouse drag orbits; scroll zooms. E interacts/enters; in an interior, E at the front door exits; E elsewhere in a business opens City services. Tab opens catalog/directory/jobs. H opens help/settings. M expands map; T chats; V exits vehicles. R/C climb/descend aircraft. F stuns fictional mission NPCs; Q guards.

Use Jobs to locate dispatchers and City to locate businesses. Summit Range trailhead is near x=-95,z=-353. The ranger contract marks three elevated checkpoints. Planes must land at the destination before completion.

## Limits and validation

Graphics are enhanced procedural rendering, not true photorealistic scanned assets. Catalog images are renders, not real photographs; home exteriors are representative. Interiors are portal-based templates, not seamless replicas with every floor accessible. Rooms are not separate multiplayer instances. Collisions are conservative arcade checks, not rigid-body crash physics. Original-map building collision remains client-side; server checks are not comprehensive anti-cheat.

`npm run check` and `npm test` passed while rebuilding this ZIP. Tests cover original gameplay, services, terrain, ranger payouts, traffic and swept collisions using mocked WebSocket transport. A real-browser/GPU playthrough has not been performed. Test visual quality, performance and real multiplayer transport on target hardware before deploying.

The ZIP and uncompressed application source are under 1,000,000 bytes. Installed dependencies, CDN modules, browser caches, runtime RAM and saved-player data are outside that source-package budget.
