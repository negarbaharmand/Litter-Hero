## Completed
- [x] Defined strict design system (PT Sans + fixed palette)
- [x] Removed Expo/mobile scaffold (web-only)
- [x] Added bottom navigation (Map / Reports / Camera / Ranks / Profile)
- [x] Created Reports page scaffold (layout + form structure + placeholders)
- [x] Applied PT Sans + strict color palette tokens

## In Progress
- [ ] Polish Reports flow vs Figma (spacing + sections)

## Backend readiness (frontend)
Reports-flödet är byggt som en tydlig **form + placeholders** och är redo att kopplas på backend.

Expected from backend (förväntat):
- **POST** `reports` / `trash-reports`: create report with
  - `image` (upload/URL), `location` (lat/lng + optional text), `category`, `amount`
- **GET** `reports` / `trash-reports`: list reports for map markers
- Optional: **PUT/PATCH** `reports/:id` to mark as picked up / update status + points

## Next Steps
- [ ] Verify Reports flow matches Figma screens 1:1 (placeholder sections)
- [ ] Add “location from map” placeholder (pick on map later)
- [ ] Prepare image upload flow (camera vs file) for later
- [ ] Replace placeholder Ranks/Profile screens when designs are ready

