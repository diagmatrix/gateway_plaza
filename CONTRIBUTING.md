# Contributing to Gateway Plaza

Thanks for helping out. Gateway Plaza is a Commander (EDH) game logger, licensed under
[AGPL-3.0-or-later](LICENSE). This guide covers how to set up, how a change gets to `main`,
and what "done" means for every story.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security issues
go through [SECURITY.md](SECURITY.md), never a public issue.

## Source of truth

The product spec (`docs/SPEC.md`) and the backlog (`docs/BACKLOG.md`) decide what gets built.
Each story has acceptance criteria (AC) and points at the spec sections it implements.

- Work on a story that has an issue. If you want to change something the spec doesn't cover,
  open an issue first.
- If your change contradicts the spec, don't quietly diverge: flag it in the issue or PR and
  update the spec in the same PR once it's agreed.

## Setting up

You need:

- **Node.js 26 (current LTS)**. The exact range is in `package.json` `engines`, and
  [`.nvmrc`](.nvmrc) lets `nvm use`, `fnm use` or similar pick it up.
- **pnpm**, at the version pinned in `package.json` `packageManager`, run through
  **Corepack**. Node 25 and later no longer ship Corepack, so install it once:

  ```sh
  npm install --global corepack
  corepack enable
  ```

  Corepack then runs the pinned pnpm in this folder, whatever pnpm you have globally.

- **just**, the command runner every task goes through. The [README](README.md#development)
  lists the install command for each OS.

Then set up:

```sh
just setup
```

That runs `pnpm install` and installs the third-party agent skills. The install **fails on purpose** if your Node version doesn't match `engines`
(`engineStrict` in `pnpm-workspace.yaml`), so everyone builds with the same runtime.
Switch Node versions and run it again.

Your editor should pick up [`.editorconfig`](.editorconfig) (UTF-8, LF, 2-space indent).
Line endings are normalised to LF by [`.gitattributes`](.gitattributes) on every OS.

Never commit secrets. `.env*` files are git-ignored. Only `.env.example`, which lists the
variable names with no values, is tracked.

## Running tasks

Every task is a recipe in the [`justfile`](justfile). Run `just` to list them with a
description. The main ones:

| Recipe | What it does |
|---|---|
| `just setup` | Install dependencies and the third-party agent skills |
| `just dev` | Start the dev server |
| `just format` / `just format-check` | Format files / check formatting |
| `just lint`, `just typecheck` | Lint and type-check |
| `just test`, `just e2e` | Unit tests (Vitest) and end-to-end tests (Playwright) |
| `just licence-check` | Fail on a dependency with an incompatible licence |
| `just notices` / `just notices-check` | Regenerate `THIRD_PARTY_NOTICES` / check it's up to date |
| `just dco-check` | Fail on a commit without a sign-off (`origin/main..HEAD` by default) |
| `just ci` | Everything CI runs, in the same order. Run it before you push. |
| `just db-migrate` | Apply database migrations |
| `just symbols-sync`, `just cards-sync` | Pull mana symbols and card data from Scryfall |

Recipes pass extra arguments through, e.g. `just test --watch`.

Recipes wrap the `package.json` scripts, so the commands live there and `pnpm run <script>`
works too. CI calls the same recipes, so a check that passes locally passes in CI. When you
add a task, add the script to `package.json` and a recipe with a one-line `#` comment
above it (that comment is what `just --list` shows). Tasks whose tool isn't set up yet print
"not set up yet".

## Branches and pull requests

`main` is protected: every change lands through a pull request with passing checks and a
review, and the branch must be up to date with `main`.

1. Branch off the latest `main`. Name the branch `<type>/us-<number>-<short-slug>`, for example
   `feat/us-35-log-game` or `fix/us-41-lock-check`. Types: `feat`, `fix`, `chore`, `docs`,
   `refactor`, `test`. Use `<type>/<short-slug>` for work without a story.
2. Keep a PR to one story (or one fix). Small PRs get reviewed faster.
3. Write commit messages in the imperative ("Add seat validation"), with a short subject line,
   and sign off every commit (see below).
4. Open the PR with the template. Link the issue (`Closes #123`), list the spec sections you
   touched, and tick the Definition of Done items that apply.
5. Keep the branch up to date by rebasing on `main` (`git pull --rebase origin main`) rather
   than merging `main` into it.
6. CI must be green and a maintainer must approve before merging.

### CI checks

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull request and every
push to `main`. Each check is its own job that calls a `just` recipe, so `just ci` locally
runs the same thing. The ruleset on `main` requires these jobs as status checks, by name:

| Check | Recipe | Fails when |
|---|---|---|
| `DCO` | `just dco-check <base> <head>` | A commit in the PR has no `Signed-off-by` line (pull requests only) |
| `Licences` | `just licence-check`, `just notices-check` | A dependency's licence is incompatible or unknown, or `THIRD_PARTY_NOTICES` is out of date |
| `Format` | `just format-check` | A file isn't formatted |
| `Lint` | `just lint` | Lint errors |
| `Typecheck` | `just typecheck` | Type errors |
| `Unit tests` | `just test` | A Vitest test fails |
| `E2E tests` | `just e2e` | A Playwright test fails |

Renaming a job changes its check name, so update the ruleset in the same PR. The workflow has
no path filters on purpose: a required check that doesn't run blocks the merge.

The licence check reads every installed dependency, dev dependencies included, from
`pnpm licenses list`. The allowed SPDX licences are in
[`scripts/licences/policy.mjs`](scripts/licences/policy.mjs); an `OR` expression passes if
either side is allowed, an `AND` only if both are. When you add, remove or update a
production dependency, run `just notices` and commit the regenerated `THIRD_PARTY_NOTICES`.
The file lists packages without versions, so most Renovate PRs leave it alone. When one adds a
package or changes a licence text, `Licences` fails on it: run `just notices` on the Renovate
branch and push a signed-off commit.

## Sign your commits (DCO)

We use the [Developer Certificate of Origin](https://developercertificate.org/) (DCO) instead
of a CLA. Signing off certifies that you wrote the change, or otherwise have the right to submit
it under the project's licence. Because there's no CLA, the project can't be relicensed without
its contributors' agreement.

Add the sign-off with `-s`:

```sh
git commit -s -m "Add seat validation"
```

That appends a line with the name and email from your git config:

```text
Signed-off-by: Your Name <you@example.com>
```

CI rejects any commit without it. To fix a branch that's missing sign-offs:

```sh
git commit --amend --signoff --no-edit   # the last commit only
git rebase --signoff origin/main         # every commit on the branch
git push --force-with-lease
```

## Licensing rules

- New source files start with the SPDX header for the project licence:

  ```ts
  // SPDX-License-Identifier: AGPL-3.0-or-later
  ```

- Dependencies must have a licence compatible with AGPL-3.0 (MIT, BSD, ISC, Apache-2.0, LGPL,
  GPL-3.0, OFL for fonts). A dependency with an incompatible or unknown licence fails CI.
- Magic: The Gathering content is used under Wizards of the Coast's Fan Content Policy, and
  Scryfall data under Scryfall's terms. The AGPL grants no rights to either. Don't add WotC
  fonts (such as Beleren), guild symbols or re-hosted card images.

## Coding agents

[`AGENTS.md`](AGENTS.md) holds the instructions every coding agent reads: stack, commands,
rules and which skill to use when. [`CLAUDE.md`](CLAUDE.md) imports it and adds only what is
specific to Claude Code. Change project rules in `AGENTS.md`, never in both.

### Claude Code setup (`.claude/`)

Everything in `.claude/` is committed, except `settings.local.json` for your own overrides.

| Path | What it does |
|---|---|
| `settings.json` | Lets Claude run the `just` recipes and common read-only commands without asking, and stops it reading `.env` files. `just db-migrate` and the Scryfall syncs still ask. |
| `hooks/format-edited-file.mjs` | After every edit, formats the file through the `format:files` script. |
| `hooks/require-signoff.mjs` | Refuses a `git commit` without a DCO sign-off (`-s`). |
| `agents/spec-checker.md` | Subagent: compares a change with the spec and the story's acceptance criteria. |
| `agents/code-reviewer.md` | Subagent: reviews against the Definition of Done, authorization and licensing. |
| `agents/test-writer.md` | Subagent: writes Vitest and Playwright tests. |
| `skills/implement-story/` | Skill: read the story, plan, build, test, check and prepare the PR. |
| `skills/spec-change/` | Skill: change SPEC.md (changelog, decisions) and BACKLOG.md together. |

The `.env` rule lists the usual file names (`.env`, `.env.local`, `.env.*.local`,
`.env.development`, `.env.preview`, `.env.production`, `.env.test`) rather than `.env*`, so
agents can still read and update `.env.example`. Keep secrets in files with those names.

Skills for code that doesn't exist yet (our migration workflow, design system components,
card sync) are added in the milestone that creates that code.

### Third-party skills

Third-party skills are **never committed**: some have no licence, and this repo is public.
[`skills-lock.json`](skills-lock.json) pins each one to a commit with a content hash, and
`just setup` installs them with the [`skills`](https://github.com/vercel-labs/skills) CLI
(a dev dependency) into `.agents/skills/`, linked into `.claude/skills/`. The install never
changes the lock and fails if a skill's files don't match their hash. Those folders are
git-ignored by name. Anything else that runs an agent, such as a CI job, runs `just setup`
first.

| Skill | Source | Licence |
|---|---|---|
| `sql-style-guide` | `diagmatrix/sql-style-guide` | None stated |
| `better-auth-best-practices`, `better-auth-security-best-practices` | `better-auth/skills` | None stated |
| `neon-postgres` | `neondatabase/agent-skills` | Apache-2.0 |
| `vercel-react-best-practices`, `vercel-composition-patterns` | `vercel-labs/agent-skills` | MIT (skill metadata) |
| `web-design-guidelines` | `vercel-labs/agent-skills` | MIT (repo README) |
| `next-dev-loop` | `vercel/next.js` | MIT |
| `playwright-cli` | `microsoft/playwright-cli` | Apache-2.0 |

Skills are instructions an agent follows with your permissions, so each one is reviewed
before it's added or updated, like a dependency:

1. Install it at a full commit SHA, which also records it in the lock:

   ```sh
   pnpm exec skills add <owner/repo>@<commit> --skill <name> --agent claude-code --yes
   ```

2. Read every file it installed. Look for scripts, commands it tells the agent to run,
   network calls, tools it pre-approves (`allowed-tools`) and advice that clashes with
   `AGENTS.md` or the spec.
3. Add its folder name to `.gitignore`, its row to the table above with its licence, and a
   line to the "Skills" section of `AGENTS.md` saying when to use it.
4. Open a PR with `skills-lock.json` and those changes, saying what you reviewed.

To update a skill, run the same command with the new commit and review the diff between the
two commits.

## Dependency updates

[Renovate](https://docs.renovatebot.com/) opens update PRs, configured in
`.github/renovate.json5`:

- Minor and patch updates arrive together in one weekly PR. Each major update gets its own PR;
  read its changelog before merging.
- A new release must be 3 days old before Renovate proposes it. Security fixes skip that wait
  and the weekly schedule.
- Update PRs run the same CI as any other PR, licence check and DCO included, and are never
  auto-merged. Review them like any other change.
- The Dependency Dashboard issue lists pending and rate-limited updates.
