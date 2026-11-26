// SPDX-License-Identifier: AGPL-3.0-or-later

// PreToolUse hook: refuses a `git commit` without a DCO sign-off, since CI
// rejects those commits anyway. A commit passes with `-s`, `--signoff`, or a
// `Signed-off-by:` line in the message. Every other command passes untouched.

const input = JSON.parse(await readStdin());
const command = input.tool_input?.command ?? "";

// `git commit`, also with global options before it (`git -C dir commit`).
const gitCommit = /\bgit(?:\s+(?:-[cC]\s+\S+|--?[\w-]+(?:=\S+)?))*\s+commit\b/;
// `-s` alone or in a cluster such as `-sm`, or `--signoff` (not `--no-signoff`).
const signoffFlag = /(?:^|\s)(?:--signoff|-[a-zA-Z]*s[a-zA-Z]*)(?=\s|$)/;

if (
    gitCommit.test(command) &&
    !signoffFlag.test(command) &&
    !command.includes("Signed-off-by:")
) {
    process.stderr.write(
        "Commit refused: every commit needs a DCO sign-off. Run it again with `git commit -s` " +
            "(see CONTRIBUTING.md, \"Sign your commits\").",
    );
    process.exit(2);
}

async function readStdin() {
    let data = "";
    for await (const chunk of process.stdin) data += chunk;
    return data;
}
