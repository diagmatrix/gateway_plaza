# Commander Game Tracker — Backlog

Based on **SPEC.md v0.13** (2026-11-23). This file does not change the spec. Where the two differ, the spec wins until it's updated.

- **Milestones** reuse the eight in SPEC §11. Three stories move to a different milestone, and a "Later" bucket holds the post-v1 items. The reasons are in [§2](#2-changes-to-the-spec-milestones).
- **User stories** follow *As a / I want / so that*. Each one has acceptance criteria (AC) and spec references (§).
- **Spec gaps** are listed in [§5](#5-spec-gaps-and-open-questions). A story that depends on one links to it (e.g. **→ G39**). Those ACs say "per G…" and were left open on purpose. All gaps are currently resolved.

---

## 1. Milestones

| # | Milestone | Goal | Stories |
|---|---|---|---|
| M0 | **Repository & agent setup** | The GitHub repo, agent instructions (AGENTS.md, CLAUDE.md, skills, subagents), CI/CD and the `justfile` are in place before any app code | US-02, US-03, US-91 – US-99 |
| M1 | **Foundation** | A deployed, licensed, themed skeleton where people can sign in and finish onboarding | US-01, US-04 – US-14 |
| M2 | **Card data & decks** | Local Scryfall data, commander picking, decks, profile pictures and account details | US-15 – US-26, US-81 |
| M3 | **Playgroups** | Groups, invites, membership, roles, guests, archiving | US-27 – US-34, US-82, US-83, US-89 |
| M4 | **Game logging** | Logging, editing and locking games in a group, plus guest claims (including public claims) | US-35 – US-47, US-84 – US-86, US-88, US-90 |
| M5 | **Stats** | Player, deck, head-to-head and playgroup stats, playgroup commanders page | US-48 – US-54, US-87, US-101 |
| M6 | **Privacy & public pages** | Public profiles and groups, Ravnica pseudonyms | US-55 – US-62 |
| M7 | **Global pool & dashboard** | Anonymous submission, anti-spam, global dashboard, commanders browser, player leaderboard, site admin | US-63 – US-72, US-100 |
| M8 | **Account lifecycle & launch readiness** | Data export, account deletion (Spirits), final legal texts, E2E suite, performance and polish. **The app goes public at the end of M8** (decision #53). | US-73 – US-80 |
| — | **Later** (not v1) | Designed for, not built: live mode, decklist import, seasons, teams | L-01 – L-04 |

### Definition of Done (every story)
These apply to every story, so they aren't repeated in each AC list:
- Every mutation checks authorization on the server: membership, role and game lock (§9).
- Inputs are validated with a Zod schema shared by the form and the server action (§7).
- Logic is covered by Vitest tests. Key flows are covered by Playwright tests as they're built, not saved up for M8.
- Works mobile-first, can be used with the keyboard, meets WCAG AA contrast in light and dark themes, and never shows meaning by colour alone (§9).
- New source files have the SPDX header. CI (licence check, DCO, lint, typecheck, tests) is green (§7.3).
- Timestamps are stored in UTC and shown in the viewer's timezone. Game dates are plain dates (§9).
- Wherever card art is shown as an art crop, the artist is credited (§3.1).
- Every average or rate shown to users comes with the number of games or values it's based on. Unfilled optional fields are left out (decision #43).

---

## 2. Changes to the spec milestones

| Story | Spec milestone | Backlog | Why |
|---|---|---|---|
| Guest claiming (US-46, US-47) | M8 Polish | **M4** | Under §3.2, a member who has even one recorded game in a group can no longer claim a guest there. If claiming only ships in M8, everyone who joins and plays during M4–M7 loses the chance to claim their guest history for good. Claiming needs games to exist, so M4 is the earliest it can go. |
| Privacy policy (US-14) | M8 Polish | **M1** (first version), final in M8 (US-76) | §4.1 relies on telling people *before sign-up* that their results stay as "Spirit". Sign-up exists from M1, so the notice has to exist from M1 too. The legitimate interest assessment and final wording can stay in M8. |
| Repo, licence, CI (US-02, US-03) | M1 Setup | **M0** | Requested: the repository, agent infrastructure, CI/CD and task runner come before any app code. |
| "Tests" | M8 Polish | **Definition of Done** + US-78 | Leaving tests until the last milestone means the stats and validation rules go untested for six milestones. M8 keeps a hardening pass for the full E2E suite. |
| Visibility toggles | M3 (implied by "Playgroups") | **M6** | The profile and group visibility settings only ship once public pages exist, so a toggle never does nothing. |
| Live mode, decklist import, seasons | §1 "Later" | **Later** bucket | Listed so they don't get lost. Not part of v1. |

Everything else stays where SPEC §11 puts it.

Since the app only goes public after M8 (decision #53), the early privacy policy and guest claiming matter for private testing rather than for public users. Both moves are still worth keeping: claiming in M4 means testers' guest history isn't lost, and the M1 policy is a small page.

---

## 3. User stories

### M0 — Repository & agent setup

Nothing in this milestone is app code. It ends when a contributor (human or agent) can clone the repo, run `just setup`, read the agent instructions, and open a PR that CI checks.

**US-91 · Create and protect the GitHub repository** (§7.3)
As a maintainer, I want a public GitHub repository with a protected main branch, so that every change goes through review and CI.
- AC1: Public repository, default branch `main`.
- AC2: A ruleset on `main` requires a pull request, passing status checks (US-03) and up-to-date branches, and blocks force pushes and deletion.
- AC3: Milestones M0–M8 and "Later" exist, plus labels for epics, `spec-gap` and `good first issue`.
- AC4: Secret scanning and push protection are on.

**US-92 · Set up repository hygiene files**
As a contributor, I want the usual project files in place, so that I know how to contribute and my editor and tools behave the same as everyone's.
- AC1: `.editorconfig`, `.gitattributes`, `.gitignore` (including `.env*` except `.env.example`).
- AC2: Node version pinned (`.nvmrc` or `engines`) to the current LTS, checked at setup. pnpm pinned through `packageManager` (Corepack).
- AC3: `CONTRIBUTING.md` (DCO sign-off, branch and PR flow, Definition of Done), `SECURITY.md` (how to report a vulnerability), `CODE_OF_CONDUCT.md`.
- AC4: Issue templates (bug, story) and a PR template with the Definition of Done checklist and the spec sections touched.

**US-93 · Run every task through a justfile**
As a contributor, I want one `justfile` with every common task, so that the same commands work locally, in CI and for agents.
- AC1: Recipes at least for `setup`, `dev`, `lint`, `format`, `typecheck`, `test`, `e2e`, `licence-check`, `ci` (everything CI runs, in order), `db-migrate`, `symbols-sync` and `cards-sync`. Recipes for tools that don't exist yet print a clear "not set up yet" message. `setup` also installs the third-party agent skills from the manifest (US-99).
- AC2: `just --list` shows a one-line description for every recipe. The README explains how to install `just`.
- AC3: CI calls the `just` recipes instead of repeating the commands, so local and CI runs can't drift.
- AC4: Recipes wrap the `package.json` scripts rather than replacing them.

**US-94 · Keep dependencies up to date**
As a maintainer, I want automated dependency update PRs and security alerts, so that the stack stays current without manual checks.
- AC1: Dependabot or Renovate is configured (chosen after checking both are maintained and fit pnpm workspaces), with grouped minor and patch updates.
- AC2: Dependency security alerts are on. Update PRs go through the same CI, licence check included.

**US-95 · Write the agent instructions** (AGENTS.md, CLAUDE.md)
As a contributor using a coding agent, I want the agent to know the project's stack, commands and rules, so that its changes follow the spec without being told every time.
- AC1: `AGENTS.md` is the single source for any agent: stack (§7), `just` commands, repo layout, Definition of Done, licensing rules (SPDX headers, DCO sign-off, no incompatible dependencies, Fan Content Policy), no secrets in the repo, and no Scryfall calls during user requests.
- AC2: `CLAUDE.md` imports `AGENTS.md` (`@AGENTS.md`) and adds only Claude Code specifics, so the two can't drift.
- AC3: Both point to `docs/SPEC.md` and `docs/BACKLOG.md` as the source of truth, with the rule that a change that contradicts the spec is flagged rather than made.
- AC5: Lists the installed skills (US-99) and when to use each, e.g. "Whenever you write, edit or review SQL, use the sql-style-guide skill first." Agents don't always open a skill on their own, so the always-loaded file names them.
- AC6: Leaves the `<!-- BEGIN:nextjs-agent-rules -->` block alone. From Next.js 16.3, `next dev` adds and maintains that block in `AGENTS.md` to point agents at the version-matched docs in `node_modules/next/dist/docs/`, so it gets committed with M1 rather than fought.
- AC4: Kept short. Area-specific rules go in nested `AGENTS.md` / `CLAUDE.md` files once those folders exist (M1).

**US-96 · Configure Claude Code for the project** (`.claude/`)
As a contributor using Claude Code, I want shared settings, subagents and skills in the repo, so that every session starts with the same guardrails and helpers.
- AC1: `.claude/settings.json` allows the `just` recipes and common read-only commands, and denies reading `.env*` files. Personal overrides go in the git-ignored `settings.local.json`.
- AC2: Hooks: format changed files after edits, and refuse a commit without a `Signed-off-by` line.
- AC3: Subagents in `.claude/agents/`, at least: a **spec checker** (compares a change with SPEC.md and BACKLOG.md acceptance criteria), a **code reviewer** (Definition of Done, authorization checks, licence headers) and a **test writer** (Vitest and Playwright conventions).
- AC4: Our own skills in `.claude/skills/`, at least: **implement-story** (read the story and its spec sections, plan, build, test, open a PR with the template) and **spec-change** (update SPEC.md changelog, decisions and the backlog together). Project-specific skills for code that doesn't exist yet (our migration workflow, Ravnica components, card sync) are written in the milestone that creates that code. Third-party skills come from US-99.
- AC5: Everything in `.claude/` is committed and documented in `CONTRIBUTING.md`.

**US-99 · Vet and install third-party skills**
As a contributor using a coding agent, I want proven skills for our stack installed from the start, so that agents follow good practice for SQL, auth, React and testing from the first line of code.
- AC1: Each skill is reviewed before it's added (skills are instructions an agent follows, and some run scripts), pinned to a commit, and recorded in a committed manifest (e.g. `skills.json`) with its source, commit and licence. Updates go through a PR like any dependency.
- AC2: **Third-party skills are never committed to the repo.** They're part of the development kit: `just setup` (US-93) installs every skill in the manifest at its pinned commit, with the `skills` CLI for Claude Code. That keeps unlicensed skills out of our public AGPL repo, and the licensed ones follow the same path so there's one way to do it.
- AC3: The install folders are git-ignored by name, so they can't be committed by accident, while our own skills in `.claude/skills/` (US-96) stay committed. Anything else that runs agents (e.g. a CI agent job) runs `just setup` first.
- AC4: `AGENTS.md` lists the skills and when to use each (US-95 AC5), and says to run `just setup` if they're missing.
- AC5: Initial set, all checked on 2026-11-23:

| Skill | Source | Use | Licence |
|---|---|---|---|
| `sql-style-guide` | `diagmatrix/sql-style-guide` | All hand-written SQL: checks, raw queries, stats views, and reviewing migrations. Drizzle-generated migration files are left as generated. | None in the repo |
| `better-auth-best-practices`, `better-auth-security-best-practices` | `better-auth/skills` (official) | Auth setup in M1: sessions, account linking, rate limits, secrets | None in the repo |
| `neon-postgres` | `neondatabase/agent-skills` (official) | Neon branching, connections, egress. Not `neon-auth`: we run Better Auth ourselves. | Apache-2.0 |
| `vercel-react-best-practices`, `vercel-composition-patterns` | `vercel-labs/agent-skills` | React and Next.js performance and component structure | MIT |
| `web-design-guidelines` | `vercel-labs/agent-skills` | UI reviews, accessibility (§9) | MIT (repo) |
| `next-dev-loop` | `vercel/next.js` (official) | Verify changes against the running dev server | MIT (repo) |
| `playwright-cli` | `microsoft/playwright-cli` (official) | Browser automation and E2E work | Apache-2.0 |

- AC6: Deliberately not installed: a Next.js "best practices" skill (Next.js now ships that knowledge as version-matched docs referenced from `AGENTS.md`, see US-95 AC6), and Drizzle skills (none official; the community ones would be reviewed in M1 or replaced by our own migration skill). The official shadcn skill is evaluated in M1, when components are built.

**US-97 · Track the backlog as GitHub issues**
As a maintainer, I want the backlog in GitHub, so that stories, PRs and milestones link together.
- AC1: `SPEC.md` and `BACKLOG.md` are committed under `docs/`.
- AC2: Each story becomes an issue in its milestone, with its acceptance criteria as a task list and a link to the spec sections.
- AC3: `BACKLOG.md` links each story to its issue. Changes to stories happen in the issue from then on, or the file says which one is the source of truth.

**US-98 · Prepare the deployment pipeline** (§7)
As a maintainer, I want the hosting and database accounts wired to the repo before any code lands, so that the first app PR in M1 gets a preview deployment straight away.
- AC1: Vercel project connected to the repo: a preview deployment per PR, production from `main`.
- AC2: Neon project created through the Vercel Marketplace, with a separate database branch per preview deployment.
- AC3: Environment variables from §7 are created per environment (values only where they already exist). `.env.example` lists them.
- AC4: Production only deploys commits that passed CI (mechanism checked at setup).
- AC5: Database migrations run as part of deployment or as a documented CI step, decided here and used from M1 (US-04).

**US-02 · Publish the repository under AGPL** (§7.3)
As a maintainer, I want a public repository with clear licensing, so that users and contributors know their rights and AGPL obligations.
- AC1: `LICENSE` holds the AGPL-3.0 text. The README states `AGPL-3.0-or-later`.
- AC2: The README says that Magic content is used under the Fan Content Policy and Scryfall data under Scryfall's terms, that the AGPL grants no rights to either, and that forks must stay free and non-commercial.
- AC3: `.env.example` lists every variable from §7 with no values. No secrets are in the repo.
- AC4: The contribution guide explains the DCO sign-off (`git commit -s`).

**US-03 · Gate merges with CI checks** (§7.3)
As a maintainer, I want CI to check licences, sign-offs and code health on every PR, so that an incompatible dependency or unsigned commit can't slip in.
- AC1: The licence check fails the build on a dependency with an incompatible or unknown licence (e.g. GPL-2.0-only, proprietary, none).
- AC2: The DCO check fails on any commit without a `Signed-off-by` line.
- AC3: Lint, typecheck, Vitest and Playwright jobs run on every PR through the `just` recipes (US-93). Until M1 adds the app they run against the empty scaffold and pass.
- AC4: `THIRD_PARTY_NOTICES` is generated from the dependency tree (Keyrune's OFL/GPL-3.0 parts and the fonts included), and CI fails if it's out of date.
- AC5: The expected stack (Next.js, Drizzle, Better Auth, Base UI, Tailwind, Recharts, Zod, Motion) passes the licence check, verified as each is added in M1.
- AC6: The licence-check and DCO tools are chosen after confirming they're actively maintained.

### M1 — Foundation

**US-01 · Review the data model** (§5, decision #22)
As a developer, I want the §5 data model reviewed and signed off before building on it, so that later milestones don't need disruptive migrations.
- AC1: The review covers every table, unique constraint, check, app-enforced cross-row rule and the §5.1 delete rules.
- AC2: The data-model gaps in §5 below (G6, G7, G8, G16) are answered or explicitly deferred.
- AC3: The outcome is recorded in the spec (decision #22 updated, the "Pending review" banner removed).
- AC4: Table, column and constraint names follow the SQL style guide (US-99). For example: booleans take `is_`/`has_` (`flagged` → `is_flagged`, `locked` → `is_locked`, `archived` → `is_archived`, `profile_public` → `is_profile_public`), dates take `_date` (`played_on` → `played_date`), units are spelled out (`duration_min`), and every `CHECK` constraint is named.

**US-04 · Deploy the app skeleton** (§7)
As a developer, I want a Next.js (App Router, TypeScript) app on Vercel connected to Neon through Drizzle, so that every later story ships to a real environment.
- AC1: Production and preview deployments run on Vercel, with environment variables set per environment.
- AC2: drizzle-kit migrations run as part of deployment (or a documented step) against Neon.
- AC3: Preview deployments use a separate database or branch, never production.
- AC4: Two Postgres roles per environment (decision #81): migrations run as the owner role (`DATABASE_MIGRATION_URL`), the app and cron jobs as the app role (`DATABASE_URL`) with `SELECT/INSERT/UPDATE/DELETE` only, via `ALTER DEFAULT PRIVILEGES`. The running app never receives the owner credentials.

**US-05 · Enforce game integrity** (§5, §5.1, decision #79)
As a developer, I want the schema, delete rules and checks in the database, and every cross-row rule in one place in the app, so that invalid data can't be written by a buggy code path.
- AC1: Every table in the reviewed model exists, with the §5.1 `ON DELETE` behaviour.
- AC2: The game service (the only code that writes games and seats) rejects, in one transaction that locks the game row, a completed game that breaks a rule: 2–8 seats, exactly one starter (seat 1 if seats are set), exactly one winner unless it's a draw (none if it is), winner placed 1 or null, nobody placed 1 in a draw.
- AC3: The game service rejects a playgroup game whose `created_by` has no seat in it, on insert and update, and blocks deleting the creator's seat. The rule stops applying once `created_by` has been reassigned to the playgroup creator (decision #64), so the game needs a marker for that (column decided in US-01).
- AC4: The partial unique index allows only one generic deck per owner and commander(s).
- AC5: Each rule has an integration test against real Postgres, including two concurrent writes for rules that span rows.
- AC6: No database triggers (decision #79).
- AC7: The app role has no `UPDATE` on `guest_claim_votes`; an integration test shows an update is refused.

**US-06 · Build the Ravnica design tokens and base components** (§7.2)
As a player, I want the app to look and feel like the gothic city of Ravnica, so that it feels made for Magic players and not like a stock template.
- AC1: Tailwind v4 `@theme` defines colours, fonts, radii, shadows, textures and frame shapes for light and dark themes. Every pairing passes WCAG AA.
- AC2: Base UI primitives (dialog, popover, combobox, menu, tabs, etc.) are wrapped and restyled in `components/ui`. No default shadcn theme ships.
- AC3: Display and body fonts are open-licensed and loaded with `next/font`. No WotC fonts.
- AC4: The skyline, arch and filigree ornaments are original SVGs that follow the theme tokens.
- AC5: No guild symbols, guild colours or watermarks are used. Animations respect `prefers-reduced-motion`.

**US-07 · Review the theme on a style guide page** (§7.2)
As a developer or designer, I want a `/dev/ui` page showing every token and component, so that the theme can be reviewed in one place.
- AC1: Shows every token and component in both themes.
- AC2: Not reachable in production.

**US-08 · Credit and link the source in an app shell** (§7.3, §9)
As a user of the hosted app, I want a footer linking to the source code and credits, so that I can get the code I'm running (AGPL §13) and see who owns the Magic content.
- AC1: The header uses the skyline silhouette. Navigation works on mobile and desktop.
- AC2: The footer has "Source code" linking to the repository at the deployed commit SHA, plus licence, third-party notices and privacy policy links.
- AC3: The footer credits Scryfall and Wizards of the Coast (Fan Content Policy).
- AC4: A third-party notices page renders `THIRD_PARTY_NOTICES`.

**US-09 · Sign in with Google** (§3.1)
As a player, I want to sign in with my Google account, so that I don't need another password.
- AC1: Google OAuth via Better Auth. The Google profile photo is never used.
- AC2: Users can sign out from any page.
- AC3: Only the essential session cookie is set (§4).

**US-10 · Sign in with an email magic link** (§3.1)
As a player without Google, I want to sign in with a link sent to my email, so that I can use the app with any address.
- AC1: Magic link emails are sent through Resend.
- AC2: Expired or reused links show a clear error with a way to request a new one.

**US-11 · Link Google and magic-link sign-ins** (§3.1)
As a player, I want Google and magic-link sign-ins with the same verified email to reach the same account, so that I never end up with two profiles.
- AC1: Better Auth account linking is on, with Google as a trusted provider.
- AC2: Signing in by magic link first and Google later (or the other way round) reaches one account.

**US-12 · Choose a display name and handle** (§3.1)
As a new player, I want to pick my display name and a unique handle on first sign-in, so that other players can recognise me.
- AC1: First sign-in redirects to `/onboarding` until it's finished.
- AC2: Pre-filled from Google when available. Magic-link users must type them in.
- AC3: Handles are 8–20 characters, using only letters, digits, `.`, `_` and `-`, and are unique regardless of case. `spirit` in any case is rejected. A handle pre-filled from Google is checked against the same rules.
- AC4: Both can be edited later on `/me`. A handle that someone gives up can be taken by anyone else (decision #32).
- AC5: The timezone is detected from the browser and saved without asking. It can be changed in account details (US-81).

**US-13 · Show only the essential cookie** (§4)
As a visitor, I want the app to set only the auth session cookie, so that I'm not tracked and no consent banner is needed.
- AC1: No analytics or third-party cookies are set. This is checked in an E2E test.
- AC2: If analytics is added later, it's cookie-free or asks for consent (documented in the README).

**US-14 · Read the privacy policy before signing up** (§4, §4.1) *(moved from M8)*
As a prospective user, I want to read the privacy policy before I sign up, so that I know what's kept if I delete my account.
- AC1: `/privacy` exists and is linked from `/login` and the footer.
- AC2: It states that game results stay in the group's records as "Spirit" after deletion, and why.
- AC3: It describes the essential-only cookie and data export.
- AC4: Marked as a first version. Finalised in US-76.

### M2 — Card data & decks

**US-15 · Sync Oracle Cards daily** (§7.1)
As an operator, I want a daily job that loads Scryfall's Oracle Cards file into `cards`, so that commander data stays current without API calls during user requests.
- AC1: A Vercel Cron job protected by `CRON_SECRET`. A request without the secret is rejected.
- AC2: The file is streamed and parsed incrementally and written in batches. Peak memory stays within the function's limit.
- AC3: Skips the download if the file's `updated_at` in the bulk-data index hasn't changed since the last run.
- AC4: Each row stores a hash of its source object. Unchanged rows aren't written.
- AC5: Sends a descriptive User-Agent. Idempotent and safe to re-run.
- AC6: If it doesn't fit in a Vercel Function, the same script runs as a scheduled GitHub Action instead.

**US-16 · Sync Default Cards into printings** (§7.1)
As an operator, I want every English printing (tokens included) in `printings`, so that profile pictures and pseudonym art resolve locally.
- AC1: A separate step from US-15. A failure in one doesn't block the other.
- AC2: Stores only the columns in §5, no raw object. Same skip and hash rules as US-15.
- AC3: `GTC` #54 (Totally Lost) and `TGTC` #7 (Spirit token) resolve after the first sync.
- AC4: Before the first migration of `cards` and `printings`, a one-off check of both bulk files answers the three questions left open in US-01 (marked PENDING in `data-model.dbml`): does every `printings.oracle_id` exist in `cards` (FK or plain column), does every `cards.scryfall_id` exist in `printings` (image join), and is `(set_code, collector_number, lang)` unique. The model is updated with the answers.

**US-17 · Derive commanders and their pairings** (§3.3, §7.1)
As a player, I want only legal commanders, with their legal partners, offered to me, so that I can't register an illegal deck.
- AC1: `commanders` holds legendary creatures, cards that say they can be your commander, and Backgrounds.
- AC2: Each has the right pairing type(s): none, partner, partner with (+ named card), partner—[text] (+ the text, e.g. Friends forever, Father & son, Survivors, Character select), background chooser, background, doctor, doctor's companion. A card can have more than one (decision #68).
- AC3: Partner—[text] variants are detected from the card text, so a new variant needs no code change. Only cards with the same text pair, and different variants never mix.
- AC6: Unit tests cover one known card of each pairing type, a card with two pairing abilities, and a rejected cross-variant pair.
- AC4: Every legal pair is derived into `commander_pairs` in canonical order (decision #58). Pickers and validation read from it.

**US-18 · Run the first import and measure storage** (§7.1)
As an operator, I want the first sync run as a setup script and its storage measured, so that we know whether the Neon plan is enough.
- AC1: A documented script runs the full first import.
- AC2: The size of `cards` (with and without `raw`) and `printings` is recorded.
- AC3: If storage is a problem, drop `raw` first. If it's still a problem, open a story for the lazy printings cache fallback.

**US-19 · Serve mana symbols from our own domain** (§7.2.1)
As a player, I want colour identity shown with real mana symbols and text labels, so that I can read it at a glance without depending on colour alone.
- AC1: `pnpm symbols:sync` downloads Scryfall symbology SVGs into `public/symbols/mana/` with a JSON manifest (symbol → file, English name). The files are committed.
- AC2: The build fails if the UI uses a symbol that isn't in the manifest.
- AC3: Each symbol has an accessible name and is paired with a text label in colour identity chips.
- AC4: No request to Scryfall at runtime.

**US-20 · Pick a commander with autocomplete** (§3.3)
As a player, I want to find my commander by typing part of its name, and only be offered legal partners, so that picking a commander is quick and always legal.
- AC1: Autocomplete reads only from the local `commanders` table and works with the keyboard.
- AC2: A second commander field appears only for commanders that allow one, and offers only legal pairings (including the named card for "Partner with").
- AC3: The same component is used by the deck form (US-21), the game form (US-35) and the anonymous form (US-63).

**US-21 · Register a deck** (§3.3)
As a player, I want to register a deck with its commander and an optional name, link and bracket, so that I can track how each of my builds performs.
- AC1: The commander is required. The second commander, name, link (stored as-is) and bracket (1–5) are optional.
- AC4: Commander pairs are stored in canonical order: alphabetical for symmetric partners, creature before Background, Doctor before companion (decision #36). Entering them in either order gives the same deck.
- AC2: Colour identity and card art come from the local card data.
- AC3: Several named or linked decks with the same commander are allowed.

**US-22 · Keep one generic deck per commander** (§3.3)
As a player, I want a deck with neither name nor link to be my single generic deck for that commander, so that all my "just the commander" games add up in one place.
- AC1: Creating a second generic deck for the same commander(s) is blocked, and the form offers to open the existing one.
- AC2: Its label is the commander name(s).
- AC3: A deck with a name or link can never become a generic deck (decision #55).

**US-23 · Manage my decks** (§3.3, §8)
As a player, I want to view, edit and archive my decks on `/me/decks`, so that my list stays current without losing stats.
- AC1: Lists decks with their display label: the name, otherwise "<link host> deck" + commander, otherwise the commander name(s) for generic decks.
- AC2: Archiving hides a deck from pickers and suggestions and keeps its stats. Archiving is the only way to remove a deck; there's no delete (decision #55).
- AC3: The commander(s) can't be edited.
- AC4: The name and link can be changed. Once a deck has a name, the name can't be cleared, only changed. A linked deck without a name can't lose its link.

**US-24 · Show card art with its artist credit** (§3.1)
As an artist (and as Scryfall's guidelines require), I want every art crop shown in the app credited with the card name and artist, so that the artwork is attributed properly.
- AC1: One shared component renders an art crop with "Art: *card name* by *artist*". On small avatars the credit is in a tooltip.
- AC2: Double-faced cards show the front face.
- AC3: Images are hotlinked from Scryfall's image servers, not re-hosted.

**US-25 · Choose my profile picture from a printing** (§3.1, §7.2.1)
As a player, I want to pick any card printing as my profile picture by set code and collector number, so that my avatar shows art I like.
- AC1: Defaults to Totally Lost (`GTC` #54).
- AC2: Once a set code is entered, collector numbers autocomplete from `printings`. A live preview shows before saving.
- AC3: Unknown printings are rejected. Tokens are allowed. No Scryfall API call is made.
- AC4: Stores `avatar_printing_id`, so the image and artist stay current after each sync.
- AC5: Set symbols come from Keyrune, with the set code as text when a glyph is missing.

**US-26 · See my profile on /me** (§8)
As a player, I want a `/me` page with my name, handle, picture and decks, so that I can manage my identity in one place.
- AC1: Shows and edits display name, handle and profile picture.
- AC2: Links to `/me/decks`. The sections for stats (M5), privacy (M6), leaderboard (M7), export and deletion (M8) are added by later stories.

**US-81 · Change my account details** (§3.1)
As a player, I want to change my email and timezone, so that my account stays correct when things change.
- AC1: Account details on `/me` show email and timezone.
- AC2: Changing the email sends a verification link to the new address. The change only takes effect once it's verified (decision #54).
- AC3: The timezone can be picked from a list, defaulting to the one detected from the browser.
- AC4: After an email change, signing in with Google (old email) and the magic link (new email) still reaches the same account, or the conflict is explained. *(Check how Better Auth's account linking behaves here before building.)*

### M3 — Playgroups

**US-27 · Create a playgroup** (§3.2)
As a player, I want to create a playgroup with a name and optional description, so that my regular group has a shared space for its games.
- AC1: The creator becomes the first admin.
- AC2: New groups are private (the visibility setting ships in US-57).
- AC3: `/g/[id]` shows the group overview to members (leaderboard added in M5).

**US-28 · See my playgroups** (§8)
As a player in several groups, I want `/groups` to list my playgroups and let me create or join one, so that I can move between them easily.
- AC1: Lists every group I'm a member of, with my role.
- AC2: Has entry points to create a group and to join with a code.

**US-29 · Invite players with a link or code** (§3.2)
As a playgroup admin, I want to share an invite link or code and be able to regenerate or disable it, so that I control who can join.
- AC1: Admins see the current link and code on `/g/[id]/settings`.
- AC2: Regenerating invalidates the old code at once. Disabling stops all joins until a code is generated again.
- AC3: Codes don't expire and have no use limit (decision #45).
- AC4: Archiving disables the invite link (decision #62).

**US-30 · Join a playgroup by invite** (§3.2)
As an invited player, I want to open an invite link and join the group, so that I can start logging games with them.
- AC1: `/join/[code]` requires sign-in. After sign-in (and onboarding if needed) the user comes back to the invite.
- AC2: Invalid or disabled codes show a clear message. Existing members are taken to the group.
- AC3: A former member who rejoins gets their history back automatically (seats are linked by `user_id`).

**US-31 · Leave a playgroup** (§3.2)
As a member, I want to leave a group, so that I'm no longer part of it.
- AC1: After leaving, their past games stay with their name.
- AC2: If they're the last member, the group is deleted (decision #8).
- AC3: If they're the last admin and other members remain, the longest-standing remaining member is promoted automatically (decision #34).
- AC4: Their membership row is kept with `left_at` set. Rejoining clears it (decision #46).
- AC5: The group's creator must pick another member as the new creator before leaving (US-89).

**US-32 · Manage members and admins** (§2, §3.2)
As a playgroup admin, I want to remove members and promote other members to admin, so that the group stays well run.
- AC1: Admins can remove a member and promote a member to admin.
- AC2: The group always keeps at least one admin.
- AC3: Only the group's creator can demote admins. Nobody can demote or remove the creator (decision #61).
- AC5: Removing a member sets `left_at` like leaving does.

**US-33 · Restrict former members' access** (§3.2)
As a playgroup admin, I want people who left or were removed to lose access to the group's private pages, so that private group data stays with current members.
- AC1: Former members can't open the group's private pages or edit games they created. Only admins can.
- AC2: Their seats and "logged by" still show their name.
- AC3: The members list in settings shows former members separately, with the date they left (`left_at`).

**US-34 · Manage the group's guests** (§3.2, §5.1)
As a playgroup admin, I want to see, rename and remove guest players, so that the guest list stays tidy.
- AC1: `/g/[id]/settings` lists guests with their game count and claim status.
- AC2: Renaming keeps names unique in the group (case-insensitive).
- AC3: A guest with games can't be deleted, only renamed or claimed. A guest with no games can be deleted.
- AC4: No guests can be added while the group is archived.

**US-82 · Archive a playgroup** (§3.2, decision #62)
As a playgroup admin, I want to archive a group we no longer play in, so that its history stays but nothing new is added by mistake.
- AC1: Admins can archive the group from settings, with a confirmation. Who archived it and when is recorded.
- AC2: An archived group's games and stats stay readable to members (and to visitors if it's public), with an "Archived" badge.
- AC3: No games can be logged and no members or guests can be added.
- AC4: Archiving disables the invite link and rejects every pending or public guest claim, and the claimants are notified.
- AC5: Only the creator can unarchive.

**US-89 · Hand over the creator role** (§3.2, decisions #61 and #70)
As a group's creator, I want to pass the creator role to another member, so that the group keeps someone in charge when I leave.
- AC1: The creator can transfer the role to any current member at any time. The new creator becomes an admin if they weren't one.
- AC2: Leaving is blocked until the creator has picked a successor (unless they're the last member).
- AC3: A former creator who rejoins is an ordinary member.
- AC4: When the creator deletes their account, the longest-standing admin becomes creator.

**US-83 · Delete an empty playgroup** (§3.2, decision #38)
As a playgroup admin, I want to delete a group that has no games, so that test or mistaken groups don't linger.
- AC1: The delete action is only available while the group has no games. Otherwise settings explain that it can be archived instead.
- AC2: A group with no members left is deleted automatically (decision #8).
- AC2a: Before such a group is deleted, its games become anonymous games in the same transaction (decision #80): group, notes, lock and user columns cleared; seats lose user, guest and deck links; the games' notifications deleted; then the early win, same commander and short game checks run. No game is ever deleted with its group (FK is RESTRICT).

### M4 — Game logging

**US-35 · Log a finished game** (§3.4)
As a playgroup member, I want to log a game I just played on one mobile screen, so that our results are recorded while everyone's still at the table.
- AC1: The playgroup defaults to the last one used.
- AC2: The date defaults to today in my timezone and can't be in the future. Date only, no time.
- AC3: 2–8 seats. Each is a current member or a guest of the group, with a commander (and a second commander when legal). The same person can't take two seats. Several seats can play the same commander (decision #40).
- AC4: My own seat is pre-filled and can't be removed. I can't log a game I didn't play in.
- AC5: Requires a result (one winner, or "Draw / no winner") and who started.
- AC6: A 4-player game with only the required fields can be logged in under 60 seconds on a phone (timed Playwright scenario on a mobile viewport).
- AC7: Games can't be logged in an archived group. The group isn't offered in the playgroup picker.

**US-36 · Add a guest while logging** (§3.2)
As a member logging a game, I want to add a new guest name right in the form, so that I can log games with people who don't have an account.
- AC1: Any member can add a guest from the player picker.
- AC2: A name that already exists in the group (case-insensitive) offers the existing guest instead of creating a duplicate.
- AC3: Guests that have been claimed aren't offered.

**US-37 · Get deck suggestions per seat** (§3.4)
As a member logging a game, I want the seated player's matching decks suggested, so that the seat links to the right deck without searching for it.
- AC1: Once a seat's player and commander are filled in, that player's non-archived named or linked decks with the same commander (and second commander, if entered) are suggested.
- AC2: Suggestions are the seated player's decks, whoever fills in the form. Guests get none.
- AC3: Picking one links the deck and fills in its second commander and bracket. Nothing is ever auto-picked, even if there's only one.
- AC4: With no deck picked, the seat stays generic (`deck_id` empty).

**US-38 · Pre-fill the game's bracket** (§3.4, decisions #5 and #7)
As a member logging a game, I want the bracket pre-filled from the decks at the table, so that I rarely have to set it by hand.
- AC1: Pre-fills with the highest bracket among the seats' decks that have one, including generic deck rows that have a bracket.
- AC2: The logger can change or clear it.

**US-39 · Record optional game details** (§3.4, §3.4.1)
As a member who tracks more detail, I want to record turn order, turn count, duration, win condition and notes, so that we get richer stats.
- AC1: Turn order for every seat is optional. If recorded, the starter must be seat 1.
- AC2: Turn count, duration (minutes) and notes (free text) are optional.
- AC3: The win condition is picked from the fixed outcome method list: combat, commander damage, combo, alt win, poison, mill, life loss (other), conceded, other.

**US-40 · Record eliminations and placements** (§3.4)
As a member, I want to record who eliminated whom, on which turn and how, so that placements and kill stats come out right.
- AC1: Each elimination records the eliminator, the turn and an outcome method.
- AC2: Placements are filled in from eliminations and can be edited. Players eliminated together share a place and the next place is skipped, e.g. 1, 2, 2, 4 (decision #39).
- AC3: A recorded winner is placed 1 (or place is left empty). In a draw nobody is placed 1 and the players still in share the best place.

**US-41 · View a game's details** (§8)
As a member, I want a page for each game with every recorded detail, so that we can check or settle what happened.
- AC1: `/g/[id]/games/[gameId]` shows seats, commanders with art, decks, result, starter, optional details, who logged and last edited it, and when.
- AC2: Shows a lock badge with who locked it and when (US-45).
- AC3: Notes are shown to members only.

**US-42 · Browse the group's games** (§3.4)
As a member, I want a list of the group's games, newest first, so that I can find a recent or old game quickly.
- AC1: Ordered by date played, then by `created_at` for games on the same date.
- AC2: Each row shows the date, commanders and winner (or draw).

**US-43 · Edit or delete a game** (§3.4)
As the member who logged a game, or an admin, I want to fix or delete it, so that mistakes don't stay in the stats.
- AC1: The creator (while still a member) and admins can edit or delete, unless the game is locked (then admins only).
- AC2: Nobody, admins included, can remove the creator's seat. The UI explains that a game with the wrong creator should be deleted and re-logged.
- AC3: Every edit records `updated_by` and `updated_at`.
- AC4: When a game includes a former member or an archived deck, the creator and admins can keep those seats or swap the member and deck. Each such seat shows a warning: "no longer in this playgroup" or "archived deck" (decision #41).

**US-44 · Lock and unlock games** (§3.4.2, decision #14)
As a playgroup admin, I want to lock a game, so that settled results can't be changed by non-admins.
- AC1: Any admin can lock or unlock a game. Who locked it and when is recorded.
- AC2: Non-admins, the creator included, see edit and delete disabled with an explanation. The server rejects their mutations.
- AC3: Admins can still edit and delete locked games.
- AC4: System actions still apply: re-linking seats on a guest claim, moving seats to a named deck (US-88), turning a former member into a guest (US-84), reassigning `created_by` (US-90), clearing deck links on account deletion, turning seats into Spirit seats.

**US-45 · Show the lock state** (§3.4.2)
As a member, I want to see that a game is locked and by whom, so that I understand why I can't edit it.
- AC1: Lock badge on the game page and an icon in the game list, each with a text label (not colour alone).

**US-46 · Ask to claim a guest profile** (§3.2, decision #15) *(moved from M8)*
As a new member who played as a guest before joining, I want to claim that guest's history, so that my old games count as mine.
- AC1: Only available while I have no recorded game in that group. Otherwise the option explains why it's unavailable.
- AC2: I can claim at most one guest per group. A pending or public claim counts, so I can't request a second one meanwhile (decision #42).
- AC4: I can't claim a guest whose public claim I already lost.
- AC3: The request goes to the group's admins on `/g/[id]/settings`.

**US-47 · Approve or reject a guest claim** (§3.2)
As a playgroup admin, I want to approve or reject claims, so that nobody takes over someone else's history.
- AC1: Eligibility is checked again on approval. If the claimant has logged a game since, approval is blocked with an explanation.
- AC2: On approval, every one of the guest's seats is re-linked to the user in one transaction, locked games included. `claimed_by` and `reviewed_by` are set.
- AC3: Rejection records `reviewed_by`, and the claimant can see the outcome and make the claim public (US-85).

**US-88 · Turn my generic deck into a named deck** (§3.3, decision #56)
As a player, I want to give my generic deck a name, so that the games I've played with that commander become part of a proper deck.
- AC1: Only available when I have no named or linked deck with that commander (or pair). It works whether or not the generic deck row exists.
- AC2: I enter a name (and optionally a link). Every generic seat of mine with that commander, in every group and locked games included, moves to the new deck in one transaction.
- AC3: Games I log later without a deck start a new generic deck.

**US-90 · Reassign games when their creator leaves** (§3.4, decisions #64 and #71)
As a playgroup admin, I want games logged by people who left to belong to the playgroup creator, so that every game still has someone responsible for it.
- AC1: When a game's creator leaves the group or deletes their account, `created_by` on their games in that group becomes the playgroup's creator, locked games included.
- AC2: When the playgroup creator changes, games already reassigned to the old creator follow the new one.
- AC3: The creator-seat rule no longer applies to reassigned games (US-05 AC3).
- AC4: `logged_by` keeps who logged the game and never changes. The game page shows the logger's name, former members included (as on their seats), and "Spirit" for deleted accounts.

**US-84 · Turn a former member's seats into a guest** (§3.2, decision #63)
As a playgroup admin, I want to convert a former member's games into a guest, so that the history can be claimed later.
- AC1: Available in settings for former members, Spirits included, with a confirmation that lists how many games are affected.
- AC2: The admin chooses the guest's name, which must be unique in the group.
- AC3: A new guest is created and all the former member's seats in this group are re-linked to it in one transaction, locked games included. Deck links are cleared, so the seats become generic.
- AC4: "Edited by" is unchanged. Games the former member logged were already reassigned to the playgroup creator when they left (US-90).

**US-85 · Make a rejected guest claim public** (§3.2, decision #59)
As a member whose claim was rejected or ignored, I want to let all members vote on it, so that one admin can't block a fair claim.
- AC1: The claimant can make the claim public after a rejection, or once it has been pending for one month with no review.
- AC2: Every current member except the claimant is notified (US-86) and can accept or reject once. The admin who rejected it can vote. Votes are recorded.
- AC3: Voting stays open for one more month. As soon as more than half of the eligible members accept, the claim is approved and the seats are re-linked as in US-47. Eligibility is checked again.
- AC4: If there's no majority when voting closes, the claim is rejected for good: the claimant can never claim that guest again.
- AC5: The group's creator can override the result either way. The override is recorded.
- AC6: A daily job closes expired votes.

**US-86 · Get notified about group events** (§3.8, decisions #60 and #69)
As a member, I want to be told in the app when something needs my input, so that public claims get voted on.
- AC1: In-app only, no email.
- AC2: Members are notified when a claim goes public, and the claimant when it's decided or rejected by archiving.
- AC3: Notifications can be marked as read.
- AC4: A header badge shows the unread count and opens the Notifications section of `/me`.

### M5 — Stats

**US-48 · Count stats with one set of rules** (§3.6)
As a player, I want every stat calculated the same way everywhere, so that numbers on different pages agree.
- AC1: A draw counts as a game played and a win for nobody. Win rate = wins / games played.
- AC2: Every stats view can be filtered by pod size.
- AC3: Generic seats count toward the player's generic deck for that commander, whether or not the deck row exists.
- AC4: Spirits (`deleted_at` set) are left out of leaderboard rankings and head-to-head. Tested with a seeded Spirit row, since deletion only ships in M8.
- AC5: Anonymous games are never attributed to a player.
- AC6: Every average and rate comes with the count it's based on. Games where an optional field wasn't filled in are left out of that stat and its count (decision #43).
- AC7: Commander pairs are grouped in canonical order (decision #36).
- AC8: Unit tests cover draws, pod-size filters, generic grouping, partner pairs, shared placements, missing optional fields and Spirits.

**US-49 · See my stats in a playgroup** (§3.6)
As a member, I want my stats within a group, so that I know how I do with this group of players.
- AC1: Games played, wins, draws, win rate, win rate when starting vs not, most-played decks and commanders, head-to-head list.

**US-50 · See my overall stats** (§3.6)
As a player in several groups, I want my stats across all my groups on `/me`, so that I see my overall performance.
- AC1: Same metrics as US-49, over every playgroup seat I have.

**US-51 · Compare head-to-head with another player** (§3.6)
As a player, I want my record against a specific opponent, so that I know who I struggle against.
- AC1: Over games where both played: games together, A's wins, B's wins.
- AC2: "Finished higher" counts only games where both have a place. Ties count for neither.
- AC3: Spirits can't be picked and don't appear in any head-to-head list.

**US-52 · See a deck's stats** (§3.6)
As a player, I want stats for each deck, generic decks included, so that I know which builds perform.
- AC1: Games played, wins, win rate, average finishing place, average turn of win or elimination, win rate by turn-order seat, each with its count.
- AC3: The turn of a win is the game's turn count. Games without one are left out of that average.
- AC2: Generic decks show stats built from the seats even with no deck row.

**US-53 · See playgroup stats and leaderboard** (§3.6)
As a member, I want the group's leaderboard and trends on the overview, so that we can see who's on top and how we play.
- AC1: Leaderboard by wins and by win rate. Win rate ranking uses the group's minimum-games threshold (US-87).
- AC2: Games over time, most-played commanders, starting-player advantage, average game length (turns and minutes). Charts use Recharts styled with the tokens.
- AC3: Spirits keep their seats in game lists but aren't ranked.

**US-54 · See guests' stats by commander** (§3.3)
As a member, I want a guest's games grouped by commander, so that guests' results are as useful as members'.
- AC1: A guest's seats are grouped by commander(s) the same way generic decks are.

**US-101 · Browse a playgroup's commanders** (§3.6.1, §3.7.2, decisions #82 and #83)
As a member, I want to browse every commander played in my group, with who played it and when, so that we can see which commanders do well at our table.
- AC1: `/g/[id]/commanders` is for members only. Everyone else gets "not found" (until public groups ship in M6, US-58).
- AC2: Builds the shared commanders browser of §3.7.2 (summary, search, colour filter with exact / at most / at least, sort, server pagination, state in the URL), fed by the group's games only. US-100 reuses it for the global page.
- AC3: A pair is one entry in canonical order (decision #36), with the union of both colour identities. Art crops credit the artist.
- AC4: Tiers S–C are quartiles of win rate over commanders with at least the group's leaderboard threshold (US-87). The delta is win rate minus the average of 1 / pod size over its games. Shown with the label and sample count, never by colour alone.
- AC5: `/g/[id]/commanders/[slug]` shows games, wins, draws, win rate, tier and delta with counts; Scryfall and EDHREC links; the matchups table (games together, won, opponent won, neither won; sortable, paginated); players with their game counts (Spirits as "Spirit"); and a timeline of dates marked all wins, all losses or mixed, with a text label as well as colour.
- AC6: Slugs follow §3.7.2. A pair slug in the other order redirects to the canonical one. An unknown slug is "not found".
- AC7: Counting follows US-48: draws are games with no winner, the pod-size filter applies, mirror matchups (decision #40) never match a seat against itself.
- AC8: Unit tests cover tier quartiles and the threshold, the expected win rate for mixed pod sizes, draws, pairs in both orders, mirror matchups, and each colour filter mode. A Playwright test covers filtering and opening a commander.

**US-87 · Set the group's leaderboard threshold** (§3.6, decisions #44 and #66)
As a playgroup admin, I want to set how many games a player needs to be ranked by win rate, so that the leaderboard fits how often we play.
- AC1: Setting in `/g/[id]/settings`. Values below 5 are rejected.
- AC2: New groups start at 5.

### M6 — Privacy & public pages

**US-55 · Make my profile public or private** (§4)
As a player, I want to choose whether my profile is public, so that I control who sees my games.
- AC1: Toggle on `/me`. Off (private) by default.
- AC2: Turning it off also turns off the leaderboard opt-in (US-70).

**US-56 · View a public profile** (§4, §8)
As a visitor, I want to view a player's public profile, so that I can see their decks and results.
- AC1: `/u/[handle]` shows display name, picture, decks, overall stats and game history.
- AC2: Private profiles and Spirits return "not found" (no hint that the profile exists).
- AC3: Games from private groups show commander and result. The group gets a location pseudonym and opponents get character pseudonyms.
- AC4: The page renders the same for every viewer. A member of that private group who opens one of its games is redirected to their own member view of the game (decision #47).
- AC5: Head-to-head only lists opponents with public profiles. Private players are left out (decision #48).

**US-57 · Make a playgroup public or private** (§4)
As a playgroup admin, I want to set the group's visibility, so that we decide whether outsiders can see our games.
- AC1: Visibility setting on `/g/[id]/settings`, admins only. Private by default.

**US-58 · View a public playgroup** (§4)
As a visitor, I want to view a public group's leaderboard, games and stats, so that I can follow a group I'm interested in.
- AC1: Visitors see the group name, leaderboard, game list and group stats.
- AC2: Members with private profiles appear under character pseudonyms. Their commander and placement still show.
- AC3: Guests follow the group's visibility.
- AC4: Members of the group always see real names.
- AC5: Notes are never shown to non-members (decision #49).

**US-59 · Curate the Ravnica name lists** (§4)
As a developer, I want curated lists of Ravnica characters and locations, each mapped to one printing, so that pseudonyms have names and art without API calls.
- AC1: Lists live in the codebase. Each entry maps to a printing in `printings` (e.g. "Niv-Mizzet" → *Niv-Mizzet, Parun*).
- AC2: A check (test or post-sync job) fails if an entry's printing is missing.
- AC3: Each list is long enough for the largest expected context (at least 8 seats per game, and up to the group's member and guest count).

**US-60 · Derive pseudonyms per page context** (§4)
As a private player, I want my pseudonym to differ between public pages, so that nobody can track me across the site.
- AC1: Derived from a keyed hash (`PSEUDONYM_SECRET`) of (subject id, context id). The context is the public group or profile being viewed.
- AC2: Stable for the same subject within one context.
- AC3: Collisions in one context resolve deterministically (next free name).
- AC4: Spirits are always "Spirit", never a pseudonym.

**US-61 · Show pseudonyms so they can't be mistaken for real players** (§4, §9)
As a visitor, I want pseudonyms to be clearly marked, so that I never mistake one for a real player or group.
- AC1: Not clickable. Muted colour, italics and a mask icon. Tooltip "Private player" / "Private playgroup".
- AC2: The picture is the character's or location's card art with artist credit. The real profile picture is never shown.

**US-62 · Check privacy on every public page** (§4)
As a private player, I want to be sure my real name never leaks through a public page, so that the privacy setting can be trusted.
- AC1: E2E tests cover each layer combination in §4 (public group × private member, public profile × private group, guests of private groups) and check that no real name, handle or picture appears.

### M7 — Global pool & dashboard

**US-63 · Submit an anonymous game** (§3.5)
As a visitor or signed-in player, I want to submit a game without a playgroup, so that it counts in the global stats.
- AC1: `/submit`, linked from the home page. Works signed out and signed in.
- AC2: Required: 2–8 commanders, the result, who started, date played. Optional fields as in §3.4 except notes. No free text at all.
- AC3: Stored with no playgroup and `created_by` null, even when signed in. No names stored.
- AC4: Seats are shown as "Player 1" … "Player N", and eliminations pick from those seats (decision #37).

**US-64 · Block bots and floods** (§6)
As an operator, I want bot checks and rate limits on anonymous submissions, so that spam can't swamp the global stats.
- AC1: Turnstile (or Vercel BotID) on the form, verified on the server.
- AC2: Rate limit per IP hash (e.g. 5/hour and 20/day) via Upstash Redis.
- AC3: Only a salted hash of the IP (`IP_HASH_SALT`) is stored, never the raw IP.

**US-65 · Validate anonymous games strictly** (§6)
As an operator, I want anonymous games validated on the server, so that only plausible games enter the pool.
- AC1: Commanders exist in `commanders` with legal pairings. 2–8 players, exactly one starter, exactly one winner or a draw, §3.4 placement rules.
- AC2: Turn count 1–50, no future dates, no free-text fields.
- AC3: The same commander on several seats is allowed (decision #40).

**US-66 · Flag suspicious submissions** (§6, decision #57)
As an operator, I want duplicates and odd patterns flagged rather than rejected, so that real games aren't lost and spam stays out of the stats.
- AC1: A game is flagged, never rejected, for any of these reasons: **duplicate** (same commanders, winner and date from the same IP hash within 24 hours), **burst** (more than 3 submissions from one IP hash within 15 minutes), **early win** (a win on turn 1–3 that isn't a combo or alt win), **same commander** (every seat plays the same commander), **short game** (under 10 minutes with 4 or more players).
- AC2: Every reason that applies is stored in `flag_reasons`. Flagged games are left out of global stats.
- AC3: Unit tests cover each reason and a game with several.

**US-67 · Review flagged games as site admin** (§6)
As a site admin, I want to review flagged games and approve or delete them, so that the global pool stays clean.
- AC1: `/admin` is only for users with `site_role = 'admin'` (made with `just make-site-admin <email>`). Everyone else gets "not found".
- AC2: Lists flagged games with their details and the reasons each one was flagged. Approve (sets `flag_approved_at`, keeps the reasons) or delete.

**US-68 · Browse the global dashboard** (§3.7)
As a visitor, I want global commander stats, so that I can see what's popular and what wins.
- AC1: `/stats`: total games, active commanders (with at least one counted game), most-played commanders, win rate per commander (only with ≥ N games, default 10), colour identity popularity and win rate, bracket distribution, starting-player win rate, draw rate.
- AC2: Pod-size filter (default all, 4-player highlighted). "All games" / "Playgroup games only" filter.
- AC3: Never shows player names, group names or individual games. Flagged games are excluded.
- AC4: Cached and revalidated periodically (e.g. every 10 minutes).

**US-100 · Browse global commanders** (§3.7.2, decisions #82 and #83)
As a visitor, I want to browse every commander across all games, with tiers and matchups, so that I can see which commanders are played and how they fare against each other.
- AC1: `/commanders` and `/commanders/[slug]` are public. They reuse the commanders browser built in US-101, fed by the same games as `/stats`.
- AC2: Lists active commanders only (decision #50). Flagged games are excluded. The pod-size and "All games" / "Playgroup games only" filters apply, as in US-68.
- AC3: Tiers use the dashboard's N (default 10) as the minimum number of games.
- AC4: The detail page shows stats, tier, delta, Scryfall and EDHREC links and matchups. No players list and no timeline: never player names, playgroup names or individual games (§3.7).
- AC5: Cached and revalidated like the dashboard (US-68 AC4).
- AC6: A Playwright test checks that no player or group name appears on either page with seeded data.

**US-69 · Preview the dashboard on the home page** (§8)
As a visitor, I want the home page to show a taste of the global stats and a way to log a game, so that I understand the app straight away.
- AC1: `/` shows a dashboard preview, a "Log an anonymous game" call to action and sign-in.

**US-70 · Opt in to the public leaderboard** (§3.7.1, decision #19)
As a player with a public profile, I want to choose to appear on the public leaderboard, so that I can show off my record.
- AC1: Setting on `/me`, off by default, only available while my profile is public.
- AC2: Making my profile private removes me from the leaderboard.

**US-71 · Keep the leaderboard opt-in tied to a public profile** (§5)
As a developer, I want `leaderboard_public` enforced to be true only when `profile_public` is true, so that the rule holds even outside the UI.
- AC1: DB check (`users_leaderboard_needs_public_profile_check`), with a test.

**US-72 · Browse the public player leaderboard** (§3.7.1)
As a visitor, I want to see top players by win rate and by total games, so that I can see who plays the most and wins the most.
- AC1: Only opted-in players. Counted from their seats in all their playgroup games (public or private groups). Totals only.
- AC2: Win rate ranking needs at least 20 games. The pod-size filter applies.
- AC3: Each entry shows picture, display name and handle, and links to the public profile.
- AC4: Guests and Spirits never appear. Cached like the dashboard.

### M8 — Account lifecycle & launch readiness

**US-73 · Export my data** (§4)
As a player, I want to download my data as JSON, so that I can keep or move it (GDPR).
- AC1: `/me` offers a JSON download of profile, decks, memberships and every game I played in.
- AC3: Other players in those games whose profiles are private are anonymised. Guests are exported as they are (decision #67).
- AC2: Only the requesting user can download it.

**US-74 · Delete my account** (§4, decision #18)
As a player, I want to delete my account myself, so that my personal data is removed.
- AC1: Self-service from `/me`. The confirmation screen repeats what's kept as "Spirit" (§4.1).
- AC2: In one transaction: sessions, linked auth accounts, memberships, pending claims and decks are deleted, then the user row is anonymised (name "Spirit", handle cleared, picture `TGTC` #7, email and timezone cleared, `deleted_at` set, profile and leaderboard turned off).
- AC3: Seats keep commander, placement and result. Seats that used deleted decks become generic. Applies to locked games.
- AC4: If they were a group's last admin, the longest-standing member is promoted. If they were the group's creator, the longest-standing admin becomes creator. Groups with no members left are deleted.
- AC6: Games they logged are reassigned to each group's creator (US-90).
- AC5: Signing up again with the same email creates a new, unrelated account.

**US-75 · Show Spirits consistently** (§4)
As a member, I want deleted players shown as "Spirit" everywhere they appeared, so that past games stay readable without personal data.
- AC1: Seats and "edited by" show "Spirit" with the Spirit token picture and artist credit.
- AC2: Several deleted users show as several "Spirit" entries. Spirits have no public profile and appear on no leaderboard or head-to-head.
- AC3: "Logged by" shows "Spirit" for games a deleted user logged (US-90).

**US-76 · Finalise the privacy policy and legitimate interest assessment** (§4.1)
As the operator, I want the final privacy policy and a written legitimate interest assessment, so that keeping Spirit rows is documented and defensible.
- AC1: A short LIA is written and kept with the privacy policy.
- AC2: The policy is reviewed against the shipped behaviour, ideally by a professional (§4.1 is not legal advice).

**US-77 · Remove notes that mention a deleted user** (§4.1)
As a deleted user, I want to ask for notes that name me to be removed, so that my name doesn't stay in free text.
- AC1: The privacy policy explains how to ask.
- AC2: `/admin` has a tool to search notes across all groups and edit them.
- AC3: Only notes that directly call out the deleted user's handle qualify (decision #52). The note must be in a game created or last modified before the account was deleted (decision #65), since the handle may belong to someone else afterwards.

**US-78 · Cover key flows end to end** (§7)
As a maintainer, I want a full Playwright suite for the key flows, so that releases don't break them.
- AC1: Covers sign-in, onboarding, creating and joining a group, logging, editing and locking a game, claiming a guest, anonymous submission, privacy rendering and account deletion.

**US-79 · Audit performance and accessibility** (§9)
As a player on a phone, I want the app to be fast and accessible, so that logging stays under a minute and everyone can use it.
- AC1: The under-60-seconds logging scenario still passes.
- AC2: An accessibility audit (keyboard, contrast, labels, pseudonym marking) finds no blocking issues.
- AC3: Dashboard and leaderboard caching is verified in production.

**US-80 · Polish the theme** (§7.2)
As a player, I want the Ravnica theme finished across every page, so that the app feels complete.
- AC1: Every page uses the frames, ornaments and lamplight highlight treatment (focus, active, winner), checked on `/dev/ui` and on real pages in both themes.

### Later (designed for, not built in v1)

- **L-01 · Live game mode** (§1): start a game, track life totals and commander damage, save automatically when it ends. The model reserves `status = in_progress` and a future `game_events` table.
- **L-02 · Decklist import** (§1): import and parse Moxfield/Archidekt decklists.
- **L-03 · Seasons / leagues** per playgroup (§1).
- **L-04 · Team formats** (§1, out of scope in v1): an optional `team` column on `game_players`.
- **L-05 · Lazy printings cache** (§7.1): only if US-18 shows storage is a problem.

---

## 4. Coverage check

Every feature section of the spec maps to at least one story:

| Spec | Stories |
|---|---|
| §2 Roles | US-27, US-32, US-33, US-44, US-67 |
| §3.1 Auth & profile | US-09 – US-12, US-24 – US-26, US-81 |
| §3.2 Playgroups | US-27 – US-34, US-36, US-46, US-47, US-82 – US-86, US-89, US-90 |
| §3.3 Decks | US-17, US-20 – US-23, US-54, US-88 |
| §3.4 Logging | US-35 – US-45 |
| §3.5 Anonymous | US-63 – US-65 |
| §3.6 Stats | US-48 – US-54, US-87, US-101 |
| §3.7 Dashboard & leaderboard | US-68 – US-72, US-100 |
| §4 Privacy, Spirits, GDPR | US-13, US-14, US-55 – US-62, US-73 – US-77 |
| §5 Data model | US-01, US-05, US-71 |
| §6 Anti-spam | US-64 – US-67 |
| §7 Stack, sync, UI, licensing | US-02 – US-08, US-15 – US-19, US-91 – US-98 |
| §8 Pages | all of the above |
| §9 Non-functional | Definition of Done, US-35 AC6, US-68 AC4, US-79 |

---

## 5. Spec gaps and open questions

### 5.1 Still open

| # | Question | Where | Blocks |
|---|---|---|---|
| — | None right now. | | |

### 5.2 Resolved

| # | Answer | Spec |
|---|---|---|
| G26 | Pairing types researched: Partner, Partner with, Partner—[text] variants (Friends forever, Father & son, Survivors, Character select, and future ones from card text), Choose a Background, Doctor's companion. | §3.3, #68 |
| G36 | Header badge opening a Notifications section of `/me`. | §3.8, #69 |
| G37 | The longest-standing admin becomes creator. | §3.2, §4, #70 |
| G38 | Keep `logged_by`; it shows the logger's name, deleted users as "Spirit". | §3.4, §5, #71 |
| G39 | "Logged by" keeps former members' names, matching their seats. | §3.4, #71 |
| G5 | Commanders never change; a name can't be removed; decks never become generic; decks are archived, not deleted; generic decks can become named and take their games. | §3.3, #55, #56 |
| G20 | The four proposed soft checks, with reasons shown to the site admin. | §6, #57 |
| G27 | One month to go public, one month of voting, majority of members except the claimant, creator can override. | §3.2, #59 |
| G28 | Notifications are in-app only (location: G36). | §3.8, #60 |
| G29 | The admin names the guest. Allowed for Spirits. | §3.2, #63 |
| G30 | Archiving disables invites and rejects claims. Only the creator unarchives. | §3.2, #62 |
| G31 | A rejoining creator isn't the creator any more; creators hand over before leaving. | §3.2, #61 |
| G32 | Leaderboard threshold starts at 5. | §3.6, #66 |
| G33 | Only notes in games created or modified before the deletion. | §4, #65 |
| G34 | Guests aren't anonymised in exports. | §4, #67 |
| G35 | `created_by` becomes the playgroup creator when the game's creator leaves. | §3.4, #64 |
| G1 | Handles: 8–20 characters, letters, digits, `.`, `_`, `-`. A handle that's given up can be taken by anyone. | §3.1, #31, #32 |
| G2 | Timezone detected from the browser, editable in account details. | §3.1, #33 |
| G3 | If the last admin leaves, someone is promoted automatically. | §3.2, #34 |
| G4 | Only the creator (while a member) can demote admins. Once the creator is gone, any admin can. | §3.2, #35 |
| G6 | Canonical pair order. | §3.3, #36 |
| G7 | Eliminations reference seats. Anonymous players are "Player 1" … "Player N". | §3.5, #37 |
| G8 | Delete only with no games or no members. Otherwise admins archive. | §3.2, #38 |
| G9 | Simultaneous eliminations share a place, the next one is skipped. | §3.4, #39 |
| G10 | The same commander can be played on several seats. | §3.4, #40 |
| G11 | Old games: keep or swap former members and archived decks, with a warning. Admins can turn a former member into a guest. | §3.2, §3.4, #41 |
| G12 | Pending claims count. Rejected or stale claims can go public; a majority decides; a public rejection is final. | §3.2, #42 |
| G13 | Every stat shows its count. Unfilled optional fields are left out. | §3.6, #43 |
| G14 | Set by admins, minimum 5. | §3.6, #44 |
| G15 | Codes last until regenerated or disabled. | §3.2, #45 |
| G16 | Keep `left_at`. | §5, #46 |
| G17 | Members are redirected to their own view of the group. | §4, #47 |
| G18 | Head-to-head only against public players. | §4, #48 |
| G19 | Notes are members only. | §3.4, §4, #49 |
| G21 | Active = at least one game. | §3.7, #50 |
| G22 | Every game the user played in; private players anonymised. | §4, #51 |
| G23 | Site-admin notes tool; only direct callouts of the handle. | §4, §6, #52 |
| G24 | Public launch after M8. | §11, #53 |
| G25 | Email change allowed, after verification. | §3.1, #54 |
