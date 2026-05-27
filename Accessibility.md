# Accessibility Documentation

![Header Image](https://i.imgur.com/Rq3Hjsr.png)

This document summarizes accessibility improvements and Lighthouse results for Litter Hero.

-- [Album of Images for **Desktop** during the test after applying fixes](https://imgur.com/a/html-export-home-OLU9n99) --

-- [Album of Images for **Mobile** during the test after applying fixes](https://imgur.com/a/DxufpO9) --

-- [JSON and HTML exports for _Both_ **before** applying fixes, highlighting all the issues that needed to be resolved:](https://git.chas-lab.dev/Akram/lighthouse-accessibility-scores/-/tree/main/lighthouse-html-json-tests) --

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

## Lighthouse Results Before Fixes:

# Lighthouse Accessibility Audit — Before Fixes:

**Branch:** `beforelighthouse1`  
**Date:** 2026-05-27T16:27:10.519Z  
**Lighthouse:** 13.3.0  
**Chrome:** 148.0.0.0  
**Test type:** Navigation (initial page load, single page session per URL)  
**Category:** Accessibility only

---

## Home (/)

**URL:** http://localhost:5173/

| Variant       | Score  |
| ------------- | ------ |
| Desktop Dark  | 96/100 |
| Desktop Light | 96/100 |
| Mobile Dark   | 96/100 |
| Mobile Light  | 96/100 |

**Failing audits:**

- Elements with visible text labels do not have matching accessible names.
- Touch targets do not have sufficient size or spacing.

---

## Reports (/reports)

**URL:** http://localhost:5173/reports

| Variant       | Score  |
| ------------- | ------ |
| Desktop Dark  | 92/100 |
| Desktop Light | 92/100 |
| Mobile Dark   | 92/100 |
| Mobile Light  | 92/100 |

**Failing audits:**

- Background and foreground colors do not have a sufficient contrast ratio.
- Document does not have a `<main>` landmark.

---

## Add Picture (/add-picture)

**URL:** http://localhost:5173/add-picture

| Variant       | Score  |
| ------------- | ------ |
| Desktop Dark  | 90/100 |
| Desktop Light | 90/100 |
| Mobile Dark   | 90/100 |
| Mobile Light  | 90/100 |

**Failing audits:**

- Background and foreground colors do not have a sufficient contrast ratio.
- Document does not have a `<main>` landmark.
- Touch targets do not have sufficient size or spacing.

---

## Leaderboard (/leaderboard)

**URL:** http://localhost:5173/leaderboard

| Variant       | Score  |
| ------------- | ------ |
| Desktop Dark  | 92/100 |
| Desktop Light | 92/100 |
| Mobile Dark   | 92/100 |
| Mobile Light  | 92/100 |

**Failing audits:**

- Background and foreground colors do not have a sufficient contrast ratio.
- Document does not have a `<main>` landmark.

---

## Profile (/profile)

**URL:** http://localhost:5173/profile

| Variant       | Score  |
| ------------- | ------ |
| Desktop Dark  | 89/100 |
| Desktop Light | 89/100 |
| Mobile Dark   | 89/100 |
| Mobile Light  | 89/100 |

**Failing audits:**

- Background and foreground colors do not have a sufficient contrast ratio.
- Document does not have a `<main>` landmark.
- Touch targets do not have sufficient size or spacing.

---

# The Results After:

## <mark style="background:#affad1"> Full 100 lighthouse score on every page</mark>

## Summary — Failing Audits per Page

| Issue                       | Home | Reports | Add Picture | Leaderboard | Profile |
| --------------------------- | ---- | ------- | ----------- | ----------- | ------- |
| Missing `<main>` landmark   | —    | ❌      | ❌          | ❌          | ❌      |
| Color contrast              | —    | ❌      | ❌          | ❌          | ❌      |
| Touch target size           | ❌   | —       | ❌          | —           | ❌      |
| Mismatched accessible names | ❌   | —       | —           | —           | —       |

| Issue                           | Home | Reports | Add Picture | Leaderboard | Profile |
| ------------------------------- | ---- | ------- | ----------- | ----------- | ------- |
| Fixed Missing `<main>` landmark | —    | ✅      | ✅          | ✅          | ✅      |
| Color contrast                  | —    | ✅      | ✅          | ✅          | ✅      |
| Touch target size               | ✅   | —       | ✅          | —           | ✅      |
| Mismatched accessible names     | ✅   | —       | —           | —           | —       |

- Captured at May 27, 2026, 6:20 PM GMT+2
- Emulated Desktop with Lighthouse 13.0.2
- Single page session
- Initial page load
- Custom throttling
- Using Chromium 147.0.0.0 with devtools

## Semantic HTML & heading hierarchy

- Replaced <div>-based page titles with proper <h1> elements (sr-only) throughout all pages
- Added structured heading hierarchy (h1 → h2 → h3) on every page, including UserProfile, HomePage, Reports, AddPicture, Login, and Leaderboard
- Fixed heading level skips so screen-readers can navigate logically

## WAI-ARIA & screen-reader support

- Added aria-label, aria-labelledby, and aria-describedby to navigation, buttons, cards, modals, maps, and interactive elements
- Landmark regions (<nav>, <main>, <header>, role attributes) for screen-reader navigation
- Applied aria-live regions for dynamic content to notify assistive technology of updates
- Added sr-only text for icon-only buttons and context-less elements

## Keyboard accessibility

- Made all interactive elements (buttons, links, toggles, filters, modals) reachable and operable via keyboard
- Added visible focus indicators (outline styles) that respect both light and dark themes
- Implemented keyboard trap handling in modals (AuthGateModal)
- Ensured logical tab order matches visual layout

## Color contrast

- Fixed insufficient contrast ratios on buttons, text, and UI elements across both themes
- Adjusted variables in index.css so foreground/background combos meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Ensured inactive/skeleton states, badges, and pills also pass contrast requirements

## Component-level improvements

- NavBar: semantic <nav>, aria-current for active page, keyboard-operable links
- ProfileHeader: proper heading for username, accessible avatar with alt text
- PointsCard / BadgeList / MilestoneCard: semantic section headings, accessible stat labels
- LocationPicker: keyboard-operable map controls, accessible search input
- ReportList / VoteQueue: focus management after voting, accessible card actions
- AddPicturePage: accessible form fields, camera capture, and file upload
- LoginPage/Register: accessible form validation, labeled inputs, error announcements
- AuthGateModal: focus trap, ESC to close, accessible dialog role
- HomePage: semantic sections, accessible CTA cards
- PageShell: skip-to-content link, main landmark

## Document & metadata

- Updated index.html with accessible language attribute and viewport meta
- Added useDocumentTitle hook so every page announces its purpose to screen-readers
- Created Accessibility.md documenting audit results, methodology, and before/after Lighthouse scores
  Result: 100/100 Lighthouse accessibility score on all pages in both light/dark modes, mobile and desktop
