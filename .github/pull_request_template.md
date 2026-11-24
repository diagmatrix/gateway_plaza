<!-- Title: short and imperative, e.g. "Add seat validation". -->

## What and why

<!-- What this PR changes and why. Link the story: "Closes #123". -->

Closes #

## How to test

<!-- Steps a reviewer can follow, and the tests that cover this. -->

## Definition of Done

<!-- Tick what applies. Strike through (~~like this~~) items that don't apply and say why. -->

- [ ] Every mutation checks authorization on the server: membership, role and game lock.
- [ ] Inputs are validated with a Zod schema shared by the form and the server action.
- [ ] Logic is covered by Vitest tests; key flows are covered by Playwright tests.
- [ ] Works mobile-first and with the keyboard, meets WCAG AA contrast in light and dark themes, and never shows meaning by colour alone.
- [ ] New source files have the SPDX header; CI (licence check, DCO, lint, typecheck, tests) is green.
- [ ] Timestamps are stored in UTC and shown in the viewer's timezone; game dates are plain dates.
- [ ] Card art shown as an art crop credits the artist.
- [ ] Every average or rate shows the number of games or values it's based on; unfilled optional fields are left out.
- [ ] Every commit is signed off (`git commit -s`).
