# Security policy

## Supported versions

Only the latest commit on `main` (what is deployed) gets security fixes. There are no
maintained release branches.

## Reporting a vulnerability

**Please don't report security issues in public issues, discussions or pull requests.**

Report them privately through GitHub:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability**.
3. Describe the issue, how to reproduce it, and what an attacker could do with it.

This opens a private advisory that only the maintainers can see.

Useful things to include:

- The affected page, endpoint or file, and the commit if you know it.
- Steps or a proof of concept, kept to the minimum needed to show the problem.
- Whether you think other users' data could be read or changed (for example another
  playgroup's games, private profiles or account data).

If you find a leaked secret (an API key, token or database URL) in the repo or its history,
report it the same way, even if it looks expired.

## What to expect

This is a volunteer project, so the times below are targets, not guarantees:

- An acknowledgement within 7 days.
- An assessment and a plan within 14 days.
- Credit in the advisory once it's fixed, unless you'd rather stay anonymous.

Please give us a reasonable chance to fix the issue before you disclose it publicly.

## Scope

In scope: this repository's code and the hosted Gateway Plaza app.

Out of scope, please report to them directly: Scryfall, Vercel, Neon, Resend, Cloudflare,
Upstash and other third-party services we use. Also out of scope: denial of service through
volume, spam, and findings that need a compromised device or browser.

## Safe harbour

We won't take action against good-faith research that follows this policy: test only
with accounts and data you own, don't access or change other users' data, and don't
degrade the service for others.
