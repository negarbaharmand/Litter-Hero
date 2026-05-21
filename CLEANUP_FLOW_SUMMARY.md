# Cleanup Flow Feature Summary

This file summarizes the cleanup-flow work implemented on branch `feature/cleanup-flow-shared-verification`.

## Core Product Flow

- Users can browse reports from both:
  - map view
  - reports list
- Users can open report details and submit cleanup proof (after-photo + optional note).
- Cleanup submissions go through community voting.
- Approved cleanup marks the report as cleaned and awards cleaner points.

## Backend: Data Model

- Extended report lifecycle statuses to include:
  - `open`
  - `cleanup_pending_vote`
  - `cleaned`
- Added report cleanup fields:
  - `cleanedByUserId`
  - `cleanedAt`
- Added `cleanup_submissions` table:
  - report/user relation
  - image proof URL
  - optional note
  - status (`pending`, `approved`, `rejected`, `expired`)
- Added `cleanup_submission_votes` table:
  - one vote per user per submission
  - vote type: `clean` or `not_clean`
- Added migration metadata and snapshots for proper Drizzle migration tracking.

## Backend: API Behavior

- `GET /api/reports` supports `?status=` filtering.
- `GET /api/reports/:id` returns report details plus approved winning submission (if any).
- `POST /api/reports/:id/cleanup-submissions` creates cleanup proof submission.
- `GET /api/reports/:id/cleanup-submissions/:submissionId` returns submission + vote summary.
- `POST /api/reports/:id/cleanup-submissions/:submissionId/votes` records votes and resolves outcome when threshold is reached.

Voting/rules implemented:

- One vote per user per submission.
- Original reporter and cleanup submitter cannot vote on that submission.
- Threshold: 3 votes.
- Majority `clean` => approved, otherwise rejected.
- First approved submission closes report as cleaned and expires remaining pending submissions.

## Points System

- Reporting points (size-based):
  - `small`: +10
  - `medium`: +15
  - `large`: +20
- Approved cleanup points (size-based):
  - `small`: +20
  - `medium`: +30
  - `large`: +40
- Rejected cleanup: 0 points.
- Weekly points now use size-based report + approved cleanup totals.

## Frontend UX Updates

- Added report detail page route:
  - `/reports/:id`
- Reports list:
  - status badges (`open`, `cleanup pending vote`, `cleaned`)
  - status filters
  - square image thumbnails + click-to-preview modal
  - improved desktop layout centering
- Map:
  - status shown in popup
  - status filters
  - removed arbitrary click-to-place marker
  - added user current location marker (red indicator)
- Cleanup submission UI:
  - clearer upload call-to-action card
  - selected file feedback

## Profile and Leaderboard Metrics

Exposed and displayed:

- `reportsCreated`
- `cleanupsApproved`
- `verificationVotes`
- `weeklyPoints` (size-aware calculation)

## Docs and Tests

- Swagger docs updated with:
  - new report/cleanup schemas
  - new cleanup endpoints
  - status filter docs
- Added backend unit tests for workflow logic:
  - vote summary
  - threshold resolution
  - size-based report/cleanup points
  - weekly points aggregation
