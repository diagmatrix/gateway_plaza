// SPDX-License-Identifier: AGPL-3.0-or-later

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        // Third-party agent skills can ship their own tests; they aren't ours to run.
        // Playwright specs (*.spec.ts) run through `just e2e`, not here.
        include: ["**/*.test.?(c|m)[jt]s?(x)"],
        exclude: [...configDefaults.exclude, ".agents/**", ".claude/**"],
    },
});
