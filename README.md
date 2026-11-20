# COASTLINE V4 — City Life & Summit Range

This is a rebuilt update of the supplied Coastline Expanded project. It is not the original source renamed: version 4.0.0 includes the city expansion and V4 fixes below. Earlier generated v3 archives were not available for binary comparison, so this package was rebuilt from the original attached source and the requested feature list.

## Run the complete project

Requires Node.js 20 or newer, a desktop browser with WebGL enabled, and internet access to install ws and load the Three.js CDN modules.

1. Extract the ZIP.
2. Open a terminal in the extracted project folder (the folder containing package.json).
3. Run:

```
npm install
npm start
```

4. Open http://localhost:3000 in a desktop browser.

Do not open index.html directly. The HTTP and WebSocket server must run. PORT defaults to 3000. DATA_DIR selects the saved-account directory. Back up and preserve that directory, and preserve browser local storage, when updating an existing installation. The existing catalog IDs and anonymous profile-key format are retained. This is a source ZIP, not a Windows executable or fully offline standalone HTML file.

## Expansion included

- Rendered purchase previews for cars, boats, aircraft, outfits and representative home exteriors. Click or keyboard-activate an image to enlarge it. Vehicles use their actual in-game model generator.
- Procedural surface textures and bump shading, a prefiltered reflection environment, soft shadows, bloom and half-resolution screen-space ambient occlusion on High. Balanced disables the expensive effects.
- Public generated-building lobbies, furnished business interiors and free unowned-home viewing tours. Enter using E at the entrance marker. Interiors are portal-based room templates, not unique seamless replicas of every building floor.
- Subdivided player ground movement and vehicle-size-aware collision footprints. Cars block against scenery, traffic and other players. Live server-controlled traffic yields to nearby cars and pedestrians. Server swept checks cover the new businesses, traffic and other players; original-map scenery collision remains client-side.
- Summit Range north of downtown: continuous walkable terrain, trail, checkpoint signs and a ranger contract. Terrain elevation is shared with the server.
- 20 signed city businesses/civic locations: restaurant, supermarket, gas station, cafe, bank, two office buildings, clinic, fire station, police station, library, gym, hotel, garage, lawn care depot, school, cinema, bakery, pharmacy and post office.
- 12 additional legal jobs, 27 total: accounting, software support, administration, lawn care, chef, stocking, fuel attendant, barista, mail delivery, passenger pilot, ranger and hotel reception. Existing cargo-pilot/helicopter jobs remain. Office and retail jobs use timed contracts, not dedicated work minigames.
- City directory with entrance navigation and paid game-cash services. Food, medicine and rest restore health as listed, capped at 100. Fuel and tune-up purchases are explicitly role-play services: no fuel depletion or vehicle-damage meter is implemented.

## V4 refinements

- Catalog previews render incrementally rather than all synchronously at once. Closing/changing a catalog stops its detached-image queue. Render-target state is restored if rendering throws.
- Named businesses remove their temporary generic entrance rings, avoiding duplicate/ghost markers.
- The City tab has its own title and lists service healing amounts or role-play labels.
- Client and server share the same vehicle-radius helper. Server checks use swept bounds for other players, not just endpoint overlap.
- Server traffic yielding accounts for larger vehicle footprints and ground elevation.
- Leaving a car on a hill preserves authoritative ground height instead of treating it as an airborne aircraft.
- Regression tests cover elevated car exits and swept player collision.

## Controls

WASD/arrows move/drive; Shift sprints/boosts; Space brakes. Drag mouse to orbit and scroll to zoom. E interacts/enters; inside, E near the front door exits; elsewhere in a public business E opens City services. Tab opens collection/catalog/jobs/directory. H opens help/settings. M expands map; T chats; V leaves vehicles. R/C climb/descend aircraft. F stuns fictional mission NPCs; Q guards.

Use City to locate businesses and Jobs to locate dispatchers. Summit Range trailhead is near x=-95,z=-353. The ranger contract marks three elevated checkpoints. Passenger flights require landing at Aurelia's apron before waiting for completion.

## Size and honest limitations

Both the compressed ZIP and total uncompressed application source are below 1,000,000 bytes at packaging. Installed npm dependencies, CDN modules, browser caches, runtime RAM and saved-player data are not included in that source-package budget.

Graphics are enhanced procedural rendering, not true photorealistic scanned assets. Purchase images are local renders, not real photographs; home images are representative. Interiors use reusable templates above the outdoor world, not seamless floor-by-floor geometry, and are not separate multiplayer instances. Collision is conservative arcade handling, not a rigid-body crash simulation. Civic buildings are exploratory lobbies, not complete banking/education/emergency-service simulations. Anonymous profiles and partial server collision checks are not production-grade identity or comprehensive anti-cheat.

## Checks

```
npm run check
npm test
```

Syntax checks and both mocked-transport suites passed during packaging. Tests cover original gameplay and the new city services, terrain, ranger payouts, collisions, yielding traffic and hill-exit regression. Production requires the real ws dependency; tests replace it using a mock loader.

No rendered-browser/GPU playthrough or real-WebSocket multiplayer integration test was performed in the build environment. Check visuals, performance, interactions, collisions and multiplayer behavior on target hardware before public deployment. See VALIDATION.md.
