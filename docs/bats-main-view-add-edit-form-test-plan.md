# BATS Main View and Add/Edit Form Test Plan

## Scope

This plan covers the BATS route split:

- `/bats` renders the authenticated asset overview.
- `/bats/new` renders the BATS asset form for new records.
- `/bats/:batId/edit` renders the BATS asset form for edits.

## Automated Unit Coverage

Run:

```bash
npm.cmd run test -- src/pages/BATS.test.tsx src/pages/BATSForm.test.tsx
```

Covered expectations:

- BATS overview loads assets from `/api/bats`.
- The overview exposes a prominent `Add BATS Asset` link to `/bats/new`.
- Metrics update from the loaded asset set.
- Search filters assets by name, category, and related metadata.
- Live inventory failure falls back to local review data and displays a warning.
- New asset form requires asset name and category before save.
- New asset form disables physical-asset-only fields for consumables.
- Personal transfer toggles owner-equity defaults.
- Reset confirmation purges form state.
- Live new asset save sends `POST /api/bats` with canonical `assetData`.
- Live edit save sends `PATCH /api/bats/:batId`.
- The form button text is `SAVE BATS`.

## Automated E2E Coverage

Run:

```bash
npm.cmd run test:e2e
```

Covered expectations:

- Public home renders without manifest data.
- Direct unauthenticated `/bats` visits redirect to `/login`.
- Login lands on `/bats`.
- `Add BATS Asset` opens `/bats/new`.
- Mock form save produces a BATS ID.
- Live form save sends the canonical payload and handles success.

## Manual QA Checklist

1. Visit `/` and confirm the public landing page still renders.
2. Visit `/bats` while logged out and confirm redirect to `/login`.
3. Log in and confirm `/bats` shows the asset overview, metrics, search, and `Add BATS Asset`.
4. Search for an asset name, category, status, and manufacturer; confirm rows filter without layout shift.
5. Click `Add BATS Asset`; confirm `/bats/new` opens the existing intake form.
6. Confirm the primary action says `SAVE BATS`.
7. Fill name and category; confirm the save button enables.
8. Toggle `Consumable`; confirm serial, warranty, and power fields disable.
9. Toggle `Personal Transfer`; confirm owner-equity details populate.
10. Use purge/reset and confirm form fields clear only after confirmation.
11. Switch to `LIVE`, save a test record only in an approved test/non-production context, and confirm the payload reaches `/api/bats`.
12. From the overview, click an asset `Edit`; confirm `/bats/:batId/edit` opens the same form in edit mode.
13. In edit mode, switch to `LIVE` only in an approved test/non-production context and confirm save uses `PATCH /api/bats/:batId`.
14. Refresh `/bats`, `/bats/new`, and `/bats/:batId/edit` in production to confirm Express/React routing handles deep links.

## Production Guardrails

- Do not test live writes against production Notion records without explicit approval.
- Use browser network tools to verify `/api/bats` is called by the frontend and Notion is never called directly from React.
- Confirm serial numbers and private financial details do not appear on public routes.
