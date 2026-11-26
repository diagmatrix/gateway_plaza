// SPDX-License-Identifier: AGPL-3.0-or-later

// `just dco-check`: fails when a commit in the range has no DCO sign-off, a
// `Signed-off-by: Name <email>` trailer (SPEC §7.3, CONTRIBUTING.md), merge
// commits included. CI passes the pull request's base and head commits;
// locally the range defaults to origin/main..HEAD.
//
// Usage: node scripts/dco-check.mjs [<base> <head>]

import { spawnSync } from "node:child_process";

const signOff = /^.+ <[^<>\s]+@[^<>\s]+>$/;

/**
 * @param {Array<{ sha: string, subject: string, signOffs: string[] }>} commits
 * @returns the commits without a well-formed sign-off
 */
export function findUnsigned(commits) {
    return commits.filter((commit) => !commit.signOffs.some((line) => signOff.test(line.trim())));
}

/**
 * Parses `git log` output in the format `logFormat` asks for.
 *
 * @param {string} output
 */
export function parseLog(output) {
    return output
        .split("\x1e")
        .map((record) => record.replace(/^\n/, ""))
        .filter((record) => record !== "")
        .map((record) => {
            const [sha, subject, trailers = ""] = record.split("\x1f");
            return {
                sha,
                subject,
                signOffs: trailers.split("\x1d").filter((line) => line.trim() !== ""),
            };
        });
}

// sha, subject and the Signed-off-by trailer values, separated by control characters.
const logFormat = "%H%x1f%s%x1f%(trailers:key=Signed-off-by,valueonly,separator=%x1d)%x1e";

function git(args) {
    return spawnSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

if (import.meta.main) {
    const [baseArg, headArg] = process.argv.slice(2);
    const base = baseArg ?? "origin/main";
    const head = headArg ?? "HEAD";

    if (git(["rev-parse", "--verify", "--quiet", `${base}^{commit}`]).status !== 0) {
        if (baseArg) {
            console.error(`DCO check: base commit ${base} not found. Fetch it first.`);
            process.exit(1);
        }
        // Only the local default lands here; CI always passes both commits.
        console.log(`DCO check skipped: ${base} not found. Run \`git fetch origin main\`.`);
        process.exit(0);
    }

    const log = git(["log", `--format=${logFormat}`, `${base}..${head}`]);
    if (log.status !== 0) {
        console.error(`DCO check: git log failed:\n${log.stderr}`);
        process.exit(1);
    }

    const commits = parseLog(log.stdout);
    const unsigned = findUnsigned(commits);

    if (unsigned.length > 0) {
        console.error(`DCO check failed: ${unsigned.length} commit(s) have no Signed-off-by line:\n`);
        for (const { sha, subject } of unsigned) console.error(`  ${sha.slice(0, 12)} ${subject}`);
        console.error(
            "\nSign them off with `git rebase --signoff origin/main` and force-push " +
                '(see CONTRIBUTING.md, "Sign your commits").',
        );
        process.exit(1);
    }

    console.log(`DCO check passed: ${commits.length} commit(s) signed off.`);
}
