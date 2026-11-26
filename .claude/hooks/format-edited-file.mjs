// SPDX-License-Identifier: AGPL-3.0-or-later

// PostToolUse hook: formats the file Claude just edited or wrote, through the
// `format:files` package.json script, so edits match `just format-check`.
// Files outside the project are left alone. If the formatter fails (for
// example on a syntax error), its output goes back to Claude (exit 2).

import { spawnSync } from "node:child_process";
import path from "node:path";

const input = JSON.parse(await readStdin());
const filePath = input.tool_input?.file_path;
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? input.cwd;

if (!filePath || !projectDir) process.exit(0);

const relative = path.relative(projectDir, filePath);
if (relative.startsWith("..") || path.isAbsolute(relative)) process.exit(0);

const options = { cwd: projectDir, encoding: "utf8" };
const result =
    process.platform === "win32"
        ? // pnpm is a .cmd shim on Windows, which Node only runs through a shell.
          spawnSync(`pnpm run --silent format:files "${relative}"`, { ...options, shell: true })
        : spawnSync("pnpm", ["run", "--silent", "format:files", relative], options);

if (result.status !== 0) {
    process.stderr.write(
        `Formatting ${relative} failed:\n${result.stdout ?? ""}${result.stderr ?? ""}`,
    );
    process.exit(2);
}

async function readStdin() {
    let data = "";
    for await (const chunk of process.stdin) data += chunk;
    return data;
}
