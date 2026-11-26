// SPDX-License-Identifier: AGPL-3.0-or-later

// Lists the installed dependencies and their declared licences, from
// `pnpm licenses list --json`, so the checks read the same tree pnpm installed
// from the lockfile.

import { spawnSync } from "node:child_process";

/**
 * @typedef {object} Dependency
 * @property {string} name
 * @property {string} version
 * @property {string} licence the declared SPDX expression, or "Unknown"
 * @property {string} path where the package is installed
 * @property {string} [homepage]
 */

/**
 * @param {{ prod?: boolean }} [options] prod: only production dependencies
 * @returns {Dependency[]} sorted by name, then version
 */
export function listDependencies({ prod = false } = {}) {
    const args = ["licenses", "list", "--json", "--long", ...(prod ? ["--prod"] : [])];
    const output = runPnpm(args);
    return flattenPnpmLicences(JSON.parse(output));
}

/**
 * Turns pnpm's output, grouped by licence, into one entry per installed
 * package version.
 *
 * @param {Record<string, Array<{ name: string, versions: string[], paths: string[], license?: string, homepage?: string }>>} grouped
 * @returns {Dependency[]}
 */
export function flattenPnpmLicences(grouped) {
    const dependencies = [];
    for (const [groupLicence, packages] of Object.entries(grouped)) {
        for (const pkg of packages) {
            pkg.versions.forEach((version, index) => {
                dependencies.push({
                    name: pkg.name,
                    version,
                    licence: pkg.license ?? groupLicence,
                    path: pkg.paths[index] ?? pkg.paths[0],
                    homepage: pkg.homepage,
                });
            });
        }
    }
    return dependencies.sort(
        (a, b) => compare(a.name, b.name) || compare(a.version, b.version),
    );
}

/** Plain code-point order, so the result doesn't depend on the machine's locale. */
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

// pnpm's JSON for a full app tree runs to several MB, past spawnSync's 1 MB default.
const maxBuffer = 64 * 1024 * 1024;

/** @param {string[]} args */
function runPnpm(args) {
    // Under `pnpm run`, npm_execpath is the running pnpm: a native binary in
    // pnpm 12, a JS entry point in older versions. Running it directly avoids looking
    // pnpm up on PATH, where Windows only has a .cmd shim.
    const execPath = /pnpm/i.test(process.env.npm_execpath ?? "") ? process.env.npm_execpath : undefined;
    const options = { encoding: "utf8", maxBuffer };
    let result;
    if (execPath && /\.[cm]?js$/.test(execPath)) {
        result = spawnSync(process.execPath, [execPath, ...args], options);
    } else if (execPath) {
        result = spawnSync(execPath, args, options);
    } else if (process.platform === "win32") {
        // The .cmd shim only runs through a shell; the arguments are our own literals.
        result = spawnSync(`pnpm ${args.join(" ")}`, { ...options, shell: true });
    } else {
        result = spawnSync("pnpm", args, options);
    }
    if (result.status !== 0) {
        throw new Error(`pnpm ${args.join(" ")} failed:\n${result.stderr || result.error}`);
    }
    return result.stdout;
}
