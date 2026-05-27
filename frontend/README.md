# Litter Hero Frontend

This folder contains the React client for Litter Hero: map-based litter reporting, voting flows, gamified profile progress, and leaderboard experiences.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- TanStack React Form
- Zustand
- Leaflet + React Leaflet

## Local development

From the `frontend/` directory:

```bash
npm install
npm run dev
```

Default dev URL: [http://localhost:5173](http://localhost:5173)

## Environment variables

The API base URL is controlled via:

- `VITE_API_URL` (optional)

Behavior:
- if unset, requests use a relative base (`/api/...`)
- if set, requests target that host directly (for example local backend without reverse proxy)

Example `.env` in `frontend/`:

```bash
VITE_API_URL=http://localhost:3000
```

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - type-check and create production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build locally

## App structure (high level)

- `src/pages/` - route-level pages (home, reports, leaderboard, profile, auth, about)
- `src/components/` - reusable UI and feature components
- `src/context/` - auth/session context
- `src/hooks/` - reusable hooks (e.g. leaderboard data)
- `src/api.ts` - typed API client helpers and request functions
- `src/utils/` - utility helpers (status mapping, geocoding, etc.)

## Data and state flow

- API calls are centralized in `src/api.ts`
- auth token is persisted in `localStorage` and attached to protected requests
- React Query handles server-state fetching and synchronization
- feature/UI state is handled with React hooks and Zustand where needed

## Accessibility notes

This frontend includes dedicated accessibility improvements for keyboard users and screen-reader compatibility. See:

- Root-level audit document: [../Accessibility.md](../Accessibility.md)
- Root project context: [../README.md](../README.md)

## Troubleshooting

- **Backend not reachable**: set `VITE_API_URL=http://localhost:3000` and verify backend is running.
- **Map or geolocation issues**: ensure browser location permissions are enabled.
- **Auth issues**: clear `localStorage` token and re-authenticate.
- **Image upload fails**: verify backend Garage/S3 env vars are configured correctly.
