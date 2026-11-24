// SPDX-License-Identifier: AGPL-3.0-or-later

// Placeholder for package.json scripts whose tool isn't installed yet.
// Prints which story sets the tool up and exits 0, so `just ci` keeps passing
// on the empty scaffold. Replace the package.json script, not this file, once
// the tool lands.
//
// Usage: node scripts/not-set-up.mjs <task> <story>

const [task = "This task", story] = process.argv.slice(2);
const when = story ? ` It is added in ${story} (see the backlog).` : "";

console.log(`${task}: not set up yet.${when}`);
