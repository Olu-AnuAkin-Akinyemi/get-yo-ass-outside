# Get Outside

Mobile-first web app that lovingly drags you off the couch, finds nearby parks, and points you toward sunlight. Built with Vite + TypeScript, no backend required.

## Quick start
- Prereqs: Node 18+ and npm.
- Install deps: `npm install`
- Dev server: `npm run dev` (opens on port 5173 and is LAN-accessible for phone testing).
- Type check: `npm run typecheck`
- Build: `npm run build` → static assets in `dist/`
- Preview production build: `npm run preview`

## How it works (fast tour)
- Entry point `src/main.ts` wires styles and boots the UI.
- `modules/ui.ts` renders views, handles theme toggle, and orchestrates geolocation → park search → results/errors.
- Prompts come from `modules/voice.ts` (“The Voice” array of auntie-level nudges).
- On "Find Parks" click, `GeolocationService` wraps the browser API with caching and friendly errors, then hands coords to `ParkService`.
- `ParkService` talks to `OverpassProvider`, which posts a query to the public Overpass API (OpenStreetMap). Results are sorted by distance and formatted for display.
- Utilities: `utils/distance.ts` (Haversine + formatting) and `utils/device.ts` (platform detection + location-permission help text).

## Caching & storage
- LocalStorage keys (all namespaced `gyao_`):
  - `user_location` (TTL 1 hour)
  - Park query cache (5-minute TTL, keyed by rounded coords + radius)
  - Theme preference (light/dark)
- Park queries also respect a soft 30s cooldown to avoid Overpass hammering; cache hits show a small notice.

## Styling notes
- Global tokens live in `src/css/variables.css`; component styles under `src/css/components/`.
- Body background uses `public/Get_Outside_img0.png` with light/dark overlays; ensure that asset stays available for the vibe.
- CSS locks scroll and sizes to full viewport (`dvh`) for a native-like feel.

## Development tips
- Path alias `@` → `src/` (see `tsconfig.json` + `vite.config.ts`).
- TypeScript runs in strict mode; keep functions typed and handle nullables.
- Debug logs are gated to dev via `import.meta.env.DEV` (leave them—helpful on devices).
- Geolocation errors surface platform-specific help text; if you adjust user-agent detection, update both copy and logic.
- No env vars or API keys required, but the app must reach `https://overpass-api.de/api/interpreter` in production.

## Testing it manually (recommended)
- Desktop: use DevTools > Sensors to spoof a location and verify park cards render with distances.
- Mobile: hit the LAN dev server from a phone; toggle light/dark and deny/allow location to check the error view copy.
- Cache behavior: run a query twice within 5 minutes to see the cache notice, then force-refresh location by clearing site data.

## Deployment
- Static-site friendly: any static host works once `npm run build` is deployed (Netlify, Vercel, S3, etc.).
- If you add a service worker/PWA manifest later, keep Overpass calls mindful of offline states and rate limits.

## Contributing vibe
Casual is fine, but keep the code crisp: small modules, typed inputs/outputs, and prefer utilities over inline math. PRs that add tests or expand park types (e.g., trails) are especially welcome.
