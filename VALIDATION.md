# Validation — V4

## Automated checks performed

PASS: npm run check (server.js, game.js, world-data.js, city-data.js).
PASS: npm test (original gameplay regression and City Life / V4 suite).

Original coverage: catalog counts, courier rewards, duplicate purchases, movement speed limits, marina spawning, aircraft ownership and exit altitude, raid/escape/wanted flow, ferry payment, saved accounts, HTTP health.
Expansion coverage: 20 unique locations and 27 jobs; land-based entrances and service definitions; bounded terrain and authoritative elevation; service range, cooldown, funds and health changes; elevated multi-stop ranger payout; swept new-business/traffic/player collision; traffic publication and yielding; module serving; ground elevation retained when exiting cars on hills.

These are mocked WebSocket transport tests, not real WebSocket integration or rendered-browser/GPU tests. No target-device frame-rate or photorealism claim is made.

## Manual acceptance checklist

- npm install; npm start; join from two browser profiles.
- Open each catalog tab, wait for incremental previews, enlarge/close by mouse and keyboard. Change tabs during loading. Confirm names/prices and representative-home labels.
- Compare High/Balanced rendering, especially ambient occlusion, reflective materials, textures, soft shadows and night lighting.
- Enter public lobbies, businesses and owned/unowned houses with E. Leave at the front door. Inside a business, move away from the door and press E for City services.
- Buy a meal; confirm game money and health changes. Check insufficient funds. Fuel and mechanic purchases are labeled role-play only.
- Drive at speed toward buildings, traffic and another player. Test both short and long vehicles. Confirm traffic yields and no forward tunneling under normal networking.
- Hike Summit Range, complete the ranger route at elevation and exit a car on a hill.
- Complete office, lawn, postal and passenger-pilot tasks; pilot must land at the island apron.
- Restart with the existing save directory retained and verify ownership and money.

## Boundaries

Procedural, not photorealistic; local rendered snapshots, not real photos; representative homes; template/portal interiors; timed/waypoint jobs; role-play fuel/mechanic service; no rigid-body crash/damage physics; not full server anti-cheat. See README for dependencies and hosting needs.
