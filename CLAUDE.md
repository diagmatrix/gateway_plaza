@AGENTS.md

## Claude Code

Everything above comes from `AGENTS.md`, the one file every agent reads. Project rules go
there, not here, so the two can't drift. This file only adds what is specific to Claude Code.

- The source of truth is still [`docs/SPEC.md`](docs/SPEC.md) and
  [`docs/BACKLOG.md`](docs/BACKLOG.md). If a request contradicts the spec, flag it and ask
  before changing anything.
- Shared settings are in `.claude/settings.json`; personal ones go in the git-ignored
  `.claude/settings.local.json`. Hooks format every file you edit and refuse a `git commit`
  without `-s`.
- Subagents in `.claude/agents/`: use **spec-checker** to compare a change with the spec and
  the story's acceptance criteria, **code-reviewer** before calling a change done, and
  **test-writer** to add Vitest and Playwright tests.
- When a task matches a skill listed under "Skills" above, load it with the Skill tool before
  you start, even if it didn't trigger on its own.
