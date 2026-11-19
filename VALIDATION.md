# Validation

PASS: npm run check, covering server.js and all three application JavaScript modules.
PASS: npm test, covering original gameplay and the City Life expansion.

Regression coverage: catalog totals, courier rewards, duplicate purchases, movement-speed bounds, marina spawning, aircraft ownership/altitude exit restrictions, raid/escape/wanted flow, ferry payment, saving and HTTP health.
Expansion coverage: 20 locations and 27 jobs, valid land entrances/services, terrain bounds, authoritative height, service location/cooldown/funds checks, health restoration, elevated multi-stop ranger payout, swept business/traffic collision, traffic yielding, world traffic updates and HTTP module serving.

These suites use mocked WebSocket transport. No real browser rendering/GPU performance test or full multiplayer WebSocket integration test has been performed.

Manual checks: launch with npm install and npm start; check all preview tabs and enlargement; compare High/Balanced settings; enter buildings and home tours; purchase a meal; drive against buildings/traffic; verify yielding from two browser profiles; hike Summit Range; finish office, lawn and passenger-pilot contracts; restart with saved data retained.

Known limits: procedural, not photorealistic; representative home previews; template portal interiors; timed/waypoint jobs; role-play fuel and mechanic services; arcade collisions; not comprehensive server anti-cheat. See README.
