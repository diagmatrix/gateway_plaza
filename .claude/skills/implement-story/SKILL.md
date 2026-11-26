---
name: implement-story
description: Implements a backlog story end to end in this repo - reads the story and its spec sections, plans, builds, tests, checks and prepares the PR. Use whenever asked to implement, build or work on a story from docs/BACKLOG.md (by number, title or issue).
---

# Implement a story

Work through these steps in order. Stop and ask when a step turns up a conflict with the spec.

## 1. Read

- Find the story in `docs/BACKLOG.md` (or its GitHub issue): the user story, every acceptance criterion (AC) and the spec sections it references (`§`).
- Read those sections of `docs/SPEC.md`, the related decisions in §10, and the Definition of Done in `docs/BACKLOG.md`.
- Check what the story depends on: earlier stories it builds on, and spec gaps (`→ G…`) it links to. If a dependency isn't done, say so before starting.

## 2. Plan

- List the changes: files, schema and migrations, server actions, UI, tests. Map each AC to the change that meets it.
- If an AC is ambiguous, or the story needs something the spec doesn't say or contradicts, **stop and flag it**. Don't decide it yourself; a spec change goes through the spec-change skill once agreed.
- Share the plan with the user before a large change.

## 3. Build

- Follow `AGENTS.md`: the stack, `just` recipes, the SPDX header on new files, no secrets, no Scryfall calls during requests.
- Load the matching skill before each kind of work (listed in `AGENTS.md` under "Skills"), for example sql-style-guide before writing SQL.
- Check authorization on the server for every mutation, and share one Zod schema between the form and the server action.
- Keep the change to this story. Note unrelated problems instead of fixing them.

## 4. Test

- Write Vitest tests for the logic and Playwright tests for the key flows, so every AC is covered. The test-writer agent can do this.
- Run `just ci` and fix what fails.

## 5. Check

- Run the spec-checker agent (does the change meet the ACs without contradicting the spec?) and the code-reviewer agent (Definition of Done, authorization, licensing). Fix what they find, or explain why not.

## 6. Prepare the PR

Only commit, push or open a PR when the user asks for it.

- Branch: `<type>/us-<number>-<short-slug>` off the latest `main`, as `CONTRIBUTING.md` describes.
- Commits: imperative subject line, signed off with `git commit -s`.
- PR: fill in `.github/pull_request_template.md`. Link the issue (`Closes #…`), list the spec sections touched, describe how to test, and tick the Definition of Done items that apply (strike through the ones that don't, with the reason).

Finish with a short summary: what changed, how each AC is met, and anything left open.
