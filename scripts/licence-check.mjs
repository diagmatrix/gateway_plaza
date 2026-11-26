// SPDX-License-Identifier: AGPL-3.0-or-later

// `just licence-check`: fails when any installed dependency (dev dependencies
// included) has a licence that isn't compatible with AGPL-3.0-or-later, or
// has no recognisable licence at all (SPEC §7.3). The allowed licences are in
// scripts/licences/policy.mjs.

import { listDependencies } from "./licences/dependencies.mjs";
import { allowedLicences, reviewedPackages } from "./licences/policy.mjs";
import { isAllowedExpression } from "./licences/spdx.mjs";

/**
 * @param {import("./licences/dependencies.mjs").Dependency[]} dependencies
 * @returns the dependencies the policy rejects
 */
export function findRejected(dependencies, allowed = allowedLicences, reviewed = reviewedPackages) {
    return dependencies.filter(
        (dependency) =>
            !reviewed.has(dependency.name) && !isAllowedExpression(dependency.licence, allowed),
    );
}

if (import.meta.main) {
    const dependencies = listDependencies();
    const rejected = findRejected(dependencies);

    if (rejected.length > 0) {
        console.error(
            `Licence check failed: ${rejected.length} of ${dependencies.length} dependencies ` +
                "have a licence that is incompatible with AGPL-3.0-or-later, or unknown:\n",
        );
        for (const { name, version, licence } of rejected) {
            console.error(`  ${name}@${version}: ${licence}`);
        }
        console.error(
            "\nReplace the package, or see scripts/licences/policy.mjs if the licence is in " +
                "fact compatible.",
        );
        process.exit(1);
    }

    console.log(`Licence check passed: ${dependencies.length} dependencies, all compatible.`);
}
