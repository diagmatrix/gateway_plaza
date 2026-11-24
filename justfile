# SPDX-License-Identifier: AGPL-3.0-or-later
#
# Every common task, for people, CI and agents. Run `just` to list them.
#
# Recipes wrap the package.json scripts, so `pnpm run <script>` keeps working
# and the commands themselves live in one place. Scripts for tools that aren't
# set up yet print "not set up yet".
#
# Keep recipe bodies to plain commands (`pnpm run ...`) that read the same in
# sh and PowerShell, so one justfile works on every OS.

# Unix uses just's default `sh`. Windows uses Windows PowerShell, which every
# Windows install has, so contributors don't need Git Bash or WSL.
set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

# List every recipe with its description
default:
    @{{ just_executable() }} --list --unsorted --justfile "{{ justfile() }}"

# Install dependencies and the third-party agent skills
[group('setup')]
setup:
    pnpm install
    pnpm run skills:install

# Start the app's dev server
[group('develop')]
dev *args:
    pnpm run dev {{ args }}

# Format every file in place
[group('develop')]
format *args:
    pnpm run format {{ args }}

# Check formatting without changing files
[group('check')]
format-check:
    pnpm run format:check

# Lint the code
[group('check')]
lint *args:
    pnpm run lint {{ args }}

# Type-check the code
[group('check')]
typecheck:
    pnpm run typecheck

# Fail on a dependency with an incompatible or unknown licence
[group('check')]
licence-check:
    pnpm run licence-check

# Run the unit tests (Vitest)
[group('check')]
test *args:
    pnpm run test {{ args }}

# Run the end-to-end tests (Playwright)
[group('check')]
e2e *args:
    pnpm run e2e {{ args }}

# Run every check CI runs, in the same order
[group('check')]
ci: format-check lint typecheck licence-check test e2e

# Apply database migrations (uses DATABASE_MIGRATION_URL)
[group('data')]
db-migrate:
    pnpm run db:migrate

# Download Scryfall's mana symbol SVGs into the repo
[group('data')]
symbols-sync:
    pnpm run symbols:sync

# Sync card data from Scryfall's bulk files into the database
[group('data')]
cards-sync:
    pnpm run cards:sync
