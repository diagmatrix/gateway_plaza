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

Then install:

```sh
pnpm install
```

The install **fails on purpose** if your Node version doesn't match `engines`
(`engineStrict` in `pnpm-workspace.yaml`), so everyone builds with the same runtime.
Switch Node versions and run it again.

Your editor should pick up [`.editorconfig`](.editorconfig) (UTF-8, LF, 2-space indent).
Line endings are normalised to LF by [`.gitattributes`](.gitattributes) on every OS.

Never commit secrets. `.env*` files are git-ignored. Only `.env.example`, which lists the
variable names with no values, is tracked.

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
