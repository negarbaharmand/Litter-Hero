# Accessibility Documentation

This document summarizes accessibility improvements and Lighthouse results for Litter Hero.

## Accessibility goals

- Follow WCAG 2.2 AA principles
- Support keyboard-only navigation
- Improve screen-reader compatibility with semantic HTML and WAI-ARIA
- Maintain accessible contrast in both light and dark themes

## What was improved

- Added/improved semantic structure and ARIA labeling where needed
- Improved keyboard interaction and focus behavior
- Improved text/background contrast in key UI flows
- Validated critical flows (home, reports, add report, vote queue, auth, profile, leaderboard)

## Audit method

- Primary tool: Lighthouse accessibility audits
- Additional checks: manual keyboard navigation and screen-reader-aware review
- Supplemental tooling: Axe-based checks were used during development
- Environment details:
  - Test date: `TODO: Add latest audit date`
  - Browser/version: `TODO`
  - Lighthouse version: `TODO`
  - Device/profile setup: `TODO`

## Lighthouse results

### Dark mode - mobile

| Page/Route | Before | After |
| ---------- | ------ | ----- |
| `/` (Home) | 93 | 100 |
| `/reports` | 90 | 100 |
| `/add-picture` | 94 | 100 |
| `/reports?tab=vote-queue` | 94 | 100 |
| `/leaderboard` | 96 | 100 |
| Login/Register | 92 | 100 |
| Profile | 92 | 100 |
| About | 100 | 100 |

### Light mode - mobile

| Page/Route | Before | After |
| ---------- | ------ | ----- |
| `/` (Home) | 93 | 100 |
| `/reports` | 90 | 100 |
| `/add-picture` | 94 | 100 |
| `/reports?tab=vote-queue` | 94 | 100 |
| `/leaderboard` | 96 | 100 |
| Login/Register | 96 | 100 |
| Profile | 92 | 100 |
| About | 100 | 100 |

### Dark mode - desktop

| Page/Route | Before | After |
| ---------- | ------ | ----- |
| `/` (Home) | 93 | 100 |
| `/reports` | 90 | 100 |
| `/reports?tab=vote-queue` | 90 | 100 |
| `/add-picture` | 94 | 100 |
| `/leaderboard` | 96 | 100 |
| Login/Register | 96 | 100 |
| Profile | 92 | 100 |
| About | 100 | 100 |

### Light mode - desktop

| Page/Route | Before | After |
| ---------- | ------ | ----- |
| `/` (Home) | 93 | 100 |
| `/reports` | 90 | 100 |
| `/reports?tab=vote-queue` | 90 | 100 |
| `/add-picture` | 92 | 100 |
| `/leaderboard` | 96 | 100 |
| Login/Register | 96 | 100 |
| Profile | 92 | 100 |
| About | 100 | 100 |

## Remaining follow-up

- Add exact audit metadata (date, browser version, Lighthouse version)
- Add screenshots or report exports for final submission appendix
- Re-run spot checks after major UI changes to maintain the current accessibility baseline
