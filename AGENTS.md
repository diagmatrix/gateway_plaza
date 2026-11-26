# AGENTS.md

Instructions for any coding agent working in this repo. Gateway Plaza is a Commander (EDH)
game logger and stats tracker, licensed under AGPL-3.0-or-later. People should read
[CONTRIBUTING.md](CONTRIBUTING.md); this file is the short version for agents.

## Source of truth

- [`docs/SPEC.md`](docs/SPEC.md) decides what the product does and how it's built.
  [`docs/BACKLOG.md`](docs/BACKLOG.md) splits it into stories with acceptance criteria and
  the Definition of Done. Where the two differ, the spec wins.
- Before working on a story, read it and the spec sections it references (`§`).
- **If a change would contradict the spec, don't make it.** Stop and flag the conflict (in your
  reply, the issue or the PR) and wait for a decision. The spec is updated first, in the same
  PR, once it's agreed.

## Stack (SPEC §7)

Next.js (App Router) + TypeScript on Vercel. Postgres on Neon with Drizzle ORM and
drizzle-kit. Better Auth (Google + magic link), Resend for email. Tailwind CSS v4 tokens +
Base UI headless primitives for the Ravnica design system (§7.2), components in
`components/ui`. Recharts, Zod (one schema shared by form and server action), Cloudflare
Turnstile + Upstash rate limiting, Vercel Cron. Vitest for logic, Playwright for key flows.
Node 26 and pnpm (pinned in `package.json`, run through Corepack).

Check the spec before adding a library that overlaps one of these.

## Commands

Every task runs through [`just`](justfile). Run `just` to list the recipes. Use them rather
than calling tools directly, so you run what CI runs.

| Recipe | Use |
|---|---|
| `just setup` | Install dependencies and the third-party agent skills |
| `just dev` | Dev server |
| `just format` / `just format-check` | Format / check formatting |
| `just lint`, `just typecheck` | Lint and type-check |
| `just test`, `just e2e` | Vitest and Playwright |
| `just licence-check` | Fail on an incompatible dependency licence |
| `just ci` | Everything CI runs, in order. Run it before you call a change done. |
| `just db-migrate` | Apply migrations |
| `just symbols-sync`, `just cards-sync` | Pull mana symbols and card data from Scryfall |

Recipes pass extra arguments through (`just test --watch`). A recipe that prints "not set up
yet" has no tool behind it yet; that's expected, not a failure. A new task gets a
`package.json` script and a recipe with a one-line `#` comment.

## Repo layout

```text
docs/        SPEC.md, BACKLOG.md, data-model.dbml
scripts/     Node scripts behind package.json
.github/     issue and PR templates, Renovate config
.claude/     Claude Code settings, hooks, subagents and our own skills
justfile     every task
skills-lock.json   third-party agent skills, pinned (installed by `just setup`)
```

The app itself (Next.js `app/`, `components/ui`, `public/symbols/`, database schema) lands
in the Foundation milestone. Follow the paths the spec gives when you create them.

## Rules

- **Definition of Done** ([BACKLOG.md](docs/BACKLOG.md#definition-of-done-every-story))
  applies to every story: server-side authorization on every mutation, shared Zod schemas,
  Vitest and Playwright tests, mobile-first and accessible (WCAG AA, never colour alone),
  UTC timestamps and plain game dates, artist credit on art crops, sample sizes next to every
  average or rate. The PR template repeats it as a checklist.
- **SPDX header** at the top of every new source file, in that file's comment syntax:
  `// SPDX-License-Identifier: AGPL-3.0-or-later`.
- **DCO**: every commit is signed off (`git commit -s`). CI rejects commits without
  `Signed-off-by`.
- **Dependencies** must have a licence compatible with AGPL-3.0 (MIT, BSD, ISC, Apache-2.0,
  LGPL, GPL-3.0, OFL for fonts). No GPL-2.0-only, proprietary or unlicensed packages;
  `just licence-check` fails on them.
- **Fan Content Policy**: Magic content is WotC's and Scryfall data is under Scryfall's terms.
  No WotC fonts (such as Beleren), no guild symbols or colours, no re-hosted card images
  (link Scryfall's), and nothing that makes the app commercial.
- **No secrets in the repo.** They live in environment variables (§7). `.env*` is git-ignored;
  only `.env.example`, with names and no values, is tracked. Don't read or print `.env` files.
- **No Scryfall calls during user requests.** The app reads card data only from local tables,
  filled by the sync jobs from bulk files (§7.1). Mana symbols are served from our own
  files (§7.2.1).

## Skills

Skills don't always load on their own, so load the matching one **before** you start that
kind of work. If a listed skill is missing, run `just setup`.

Ours, committed in `.claude/skills/`:

- **implement-story**: whenever you implement or work on a story from the backlog.
- **spec-change**: whenever the spec changes (a decision, a resolved gap, changed
  acceptance criteria), so SPEC.md and BACKLOG.md change together.

Third-party, pinned in `skills-lock.json` and installed by `just setup`:

- **sql-style-guide**: whenever you write, edit or review hand-written SQL (checks, raw
  queries, stats views, migrations) or name tables and columns. Leave Drizzle-generated
  migration files as generated.
- **better-auth-best-practices**: setting up or changing Better Auth (sessions, providers,
  plugins, the admin plugin).
- **better-auth-security-best-practices**: anything touching auth security: rate limits,
  secrets, cookies, trusted origins.
- **neon-postgres**: Neon connections, pooling, database branches and egress.
- **vercel-react-best-practices**: writing or reviewing React and Next.js components and data
  fetching.
- **vercel-composition-patterns**: designing component APIs and structure, such as the
  design system in `components/ui`.
- **web-design-guidelines**: reviewing UI for accessibility and interface quality (SPEC §9).
- **next-dev-loop**: checking a change in the running dev server, not just that it builds.
- **playwright-cli**: driving a browser, and writing or debugging Playwright tests.

Third-party skills are advice; this file and the spec win where they disagree. Use pnpm and
the `just` recipes, keep our migration workflow (drizzle-kit, never `push` against a shared
database), and don't install other skills, global tools or packages a skill suggests without
asking.

## Nested instructions

Keep this file short. Rules that only apply to one area go in an `AGENTS.md` in that folder
(with a `CLAUDE.md` next to it that imports it), once the folder exists.

## Next.js agent rules

`next dev` appends a block managed by Next.js to the end of this file, pointing at the
version-matched docs in `node_modules/next/dist/docs/`. Don't edit or remove it; commit it
when it changes. Read those docs before writing Next.js code.
