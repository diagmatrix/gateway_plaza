// SPDX-License-Identifier: AGPL-3.0-or-later

// `just notices` writes THIRD_PARTY_NOTICES from the production dependency
// tree: every package the app ships, its licence and its licence text
// (SPEC §7.3). `just notices-check` fails when the committed file is out of
// date, so a dependency change must come with the regenerated file.
//
// Entries are per package, not per version: a routine version bump (most
// Renovate PRs) leaves the file as it is, and only a new or removed package,
// or a changed licence or licence text, needs `just notices`.
//
// Usage: node scripts/notices.mjs [--check]

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { listDependencies } from "./licences/dependencies.mjs";

export const noticesFile = "THIRD_PARTY_NOTICES";

const licenceFile = /^(licen[cs]e|copying|notice)([.\-_].*)?$/i;

/**
 * @typedef {object} Notice
 * @property {string} name
 * @property {string[]} licences declared licences, one per distinct value
 * @property {string} [homepage]
 * @property {string[]} texts contents of the package's licence files
 */

/**
 * Merges the installed versions of each package into one notice.
 *
 * @param {Array<import("./licences/dependencies.mjs").Dependency & { texts: string[] }>} dependencies
 *   sorted by name
 * @returns {Notice[]}
 */
export function groupByPackage(dependencies) {
    /** @type {Map<string, Notice>} */
    const notices = new Map();
    for (const dependency of dependencies) {
        const notice = notices.get(dependency.name) ?? {
            name: dependency.name,
            licences: [],
            homepage: dependency.homepage,
            texts: [],
        };
        if (!notice.licences.includes(dependency.licence)) notice.licences.push(dependency.licence);
        for (const text of dependency.texts.map(normaliseText)) {
            if (text !== "" && !notice.texts.includes(text)) notice.texts.push(text);
        }
        notices.set(dependency.name, notice);
    }
    return [...notices.values()];
}

/**
 * @param {Notice[]} notices
 * @returns {string} the whole notices file
 */
export function renderNotices(notices) {
    const header = [
        "THIRD-PARTY NOTICES",
        "",
        "Gateway Plaza is licensed under AGPL-3.0-or-later (see LICENSE). It includes the",
        "third-party packages below, each under its own licence.",
        "",
        "Magic: The Gathering content is not covered by any of these licences: it belongs to",
        "Wizards of the Coast and is used under its Fan Content Policy.",
        "",
        "This file is generated from the production dependency tree by `just notices`.",
        "Don't edit it by hand.",
    ].join("\n");

    if (notices.length === 0) {
        return `${header}\n\nThe app has no third-party production dependencies yet.\n`;
    }

    const rule = "-".repeat(80);
    const entries = notices.map((notice) => {
        const lines = [notice.name, `License: ${notice.licences.join(", ")}`];
        if (notice.homepage) lines.push(`Homepage: ${notice.homepage}`);
        const texts =
            notice.texts.length > 0 ? notice.texts : ["The package includes no licence file."];
        return [lines.join("\n"), ...texts].join("\n\n");
    });
    return `${header}\n\n${entries.map((entry) => `${rule}\n\n${entry}\n`).join("\n")}`;
}

/** LF line endings, no trailing spaces, no blank lines at either end. */
export function normaliseText(text) {
    return text
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .replace(/^\n+|\n+$/g, "");
}

/**
 * Prebuilt binaries for one OS or CPU (e.g. `@rolldown/binding-linux-x64-gnu`)
 * are only installed on that platform, so listing them would make the file
 * differ between a contributor's machine and CI. They're left out; the
 * licence check still checks whichever ones are installed.
 *
 * @param {{ os?: string[], cpu?: string[] }} manifest the package's package.json
 */
export function isPlatformSpecific(manifest) {
    return Boolean(manifest.os?.length || manifest.cpu?.length);
}

/** @param {string} directory a package's install folder */
function readManifest(directory) {
    return JSON.parse(readFileSync(path.join(directory, "package.json"), "utf8"));
}

/** @param {string} directory a package's install folder */
function readLicenceTexts(directory) {
    return readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isFile() && licenceFile.test(entry.name))
        .map((entry) => entry.name)
        .sort()
        .map((name) => readFileSync(path.join(directory, name), "utf8"));
}

if (import.meta.main) {
    const check = process.argv.includes("--check");
    const dependencies = listDependencies({ prod: true })
        // An optional package skipped on this platform has no folder.
        .filter((dependency) => existsSync(path.join(dependency.path, "package.json")))
        .filter((dependency) => !isPlatformSpecific(readManifest(dependency.path)))
        .map((dependency) => ({ ...dependency, texts: readLicenceTexts(dependency.path) }));
    const notices = groupByPackage(dependencies);
    const expected = renderNotices(notices);

    if (check) {
        let current = "";
        try {
            current = readFileSync(noticesFile, "utf8").replace(/\r\n/g, "\n");
        } catch {
            // A missing file is out of date too.
        }
        if (current !== expected) {
            console.error(
                `${noticesFile} is out of date with the dependency tree. ` +
                    "Run `just notices` and commit the result.",
            );
            process.exit(1);
        }
        console.log(`${noticesFile} is up to date (${notices.length} packages).`);
    } else {
        writeFileSync(noticesFile, expected);
        console.log(`Wrote ${noticesFile} (${notices.length} packages).`);
    }
}
