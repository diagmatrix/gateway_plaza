// SPDX-License-Identifier: AGPL-3.0-or-later

// Which dependency licences the AGPL-3.0-or-later app can include (SPEC §7.3).
// `just licence-check` fails on anything else, including a missing or unknown
// licence. Add a licence here only after checking it is compatible with
// AGPL-3.0, and say why in the PR.

/** SPDX identifiers compatible with AGPL-3.0-or-later. */
export const allowedLicences = new Set([
    // Permissive
    "0BSD",
    "Apache-2.0",
    "BlueOak-1.0.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "CC0-1.0",
    "ISC",
    "MIT",
    "MIT-0",
    "Unlicense",
    "Zlib",
    // Data licences (e.g. caniuse-lite, used by the build tooling)
    "CC-BY-4.0",
    // Weak copyleft. MPL-2.0 allows combining with GPL code (its section 3.3),
    // except files marked "Incompatible With Secondary Licenses" (Exhibit B).
    // The LGPLs let the code be used under the GPL (LGPL-2.x section 3).
    "MPL-2.0",
    "LGPL-2.0-only",
    "LGPL-2.0-or-later",
    "LGPL-2.1-only",
    "LGPL-2.1-or-later",
    "LGPL-3.0-only",
    "LGPL-3.0-or-later",
    // Strong copyleft that can be combined with AGPL-3.0 (GPL-3.0 section 13).
    // GPL-2.0-only is NOT here: it can't be combined with (A)GPL-3.0.
    "GPL-2.0-or-later",
    "GPL-3.0-only",
    "GPL-3.0-or-later",
    "AGPL-3.0-only",
    "AGPL-3.0-or-later",
    // Fonts
    "OFL-1.1",
]);

/**
 * Packages allowed despite their declared licence, after a manual review.
 * Key: package name. Value: why it's fine. Keep this empty unless there's no
 * other way; a wrong or missing `license` field is better fixed upstream.
 *
 * @type {Map<string, string>}
 */
export const reviewedPackages = new Map([]);
