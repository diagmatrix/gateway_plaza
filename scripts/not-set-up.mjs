// SPDX-License-Identifier: AGPL-3.0-or-later

// Placeholder for package.json scripts whose tool isn't installed yet.
// Prints "not set up yet" and exits 0, so `just ci` keeps passing on the empty
// scaffold. Replace the package.json script, not this file, once the tool lands.
//
// Usage: node scripts/not-set-up.mjs <task>

const [task = "This task"] = process.argv.slice(2);

console.log(`${task}: not set up yet.`);
