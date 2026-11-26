// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from "vitest";

import { findRejected } from "../licence-check.mjs";
import { flattenPnpmLicences } from "./dependencies.mjs";
import { allowedLicences } from "./policy.mjs";
import { isAllowedExpression } from "./spdx.mjs";

const allowed = (expression) => isAllowedExpression(expression, allowedLicences);

describe("isAllowedExpression", () => {
    it.each(["MIT", "ISC", "Apache-2.0", "BSD-3-Clause", "OFL-1.1", "GPL-3.0-only", "MPL-2.0"])(
        "allows %s",
        (licence) => expect(allowed(licence)).toBe(true),
    );

    it.each([
        ["GPL-2.0-only", "can't be combined with GPL-3.0"],
        ["GPL-2.0", "deprecated id for GPL-2.0-only"],
        ["UNLICENSED", "proprietary"],
        ["SEE LICENSE IN LICENSE.txt", "custom terms"],
        ["Unknown", "pnpm's value for no licence"],
        ["", "empty"],
        [undefined, "missing"],
        ["SSPL-1.0", "not compatible"],
    ])("rejects %s (%s)", (licence) => expect(allowed(licence)).toBe(false));

    it("accepts deprecated ids that mean a compatible licence", () => {
        expect(allowed("GPL-3.0")).toBe(true);
        expect(allowed("GPL-2.0+")).toBe(true);
        expect(allowed("LGPL-2.1")).toBe(true);
    });

    it("matches ids case-insensitively and reads X+ as X or later", () => {
        expect(allowed("mit")).toBe(true);
        expect(allowed("Apache-2.0+")).toBe(true);
        expect(allowed("gpl-2.0")).toBe(false);
    });

    it("passes OR when either side passes", () => {
        expect(allowed("(MIT OR GPL-2.0-only)")).toBe(true);
        expect(allowed("GPL-2.0-only OR UNLICENSED")).toBe(false);
    });

    it("passes AND only when both sides pass", () => {
        expect(allowed("MIT AND ISC")).toBe(true);
        expect(allowed("MIT AND GPL-2.0-only")).toBe(false);
    });

    it("binds AND tighter than OR, and respects parentheses", () => {
        expect(allowed("GPL-2.0-only AND MIT OR ISC")).toBe(true);
        expect(allowed("GPL-2.0-only AND (MIT OR ISC)")).toBe(false);
    });

    it("judges X WITH exception on X", () => {
        expect(allowed("Apache-2.0 WITH LLVM-exception")).toBe(true);
        expect(allowed("GPL-2.0-only WITH Classpath-exception-2.0")).toBe(false);
    });

    it("rejects malformed expressions", () => {
        expect(allowed("(MIT")).toBe(false);
        expect(allowed("MIT OR")).toBe(false);
        expect(allowed("MIT ISC")).toBe(false);
        expect(allowed("MIT WITH")).toBe(false);
    });
});

describe("findRejected", () => {
    const dependency = (name, licence) => ({ name, version: "1.0.0", licence, path: "" });

    it("returns only the incompatible dependencies", () => {
        const result = findRejected([dependency("a", "MIT"), dependency("b", "GPL-2.0-only")]);
        expect(result.map((d) => d.name)).toEqual(["b"]);
    });

    it("skips packages that were reviewed by hand", () => {
        const reviewed = new Map([["b", "relicensed upstream, see issue"]]);
        const result = findRejected([dependency("b", "Unknown")], allowedLicences, reviewed);
        expect(result).toEqual([]);
    });
});

describe("flattenPnpmLicences", () => {
    it("gives one sorted entry per installed version", () => {
        const result = flattenPnpmLicences({
            MIT: [{ name: "zod", versions: ["4.0.0"], paths: ["/z"], license: "MIT" }],
            ISC: [
                {
                    name: "yaml",
                    versions: ["2.0.0", "1.0.0"],
                    paths: ["/y2", "/y1"],
                    license: "ISC",
                },
            ],
        });
        expect(result.map((d) => `${d.name}@${d.version} ${d.path}`)).toEqual([
            "yaml@1.0.0 /y1",
            "yaml@2.0.0 /y2",
            "zod@4.0.0 /z",
        ]);
    });

    it("falls back to the group's licence", () => {
        const [result] = flattenPnpmLicences({
            Unknown: [{ name: "x", versions: ["1.0.0"], paths: ["/x"] }],
        });
        expect(result.licence).toBe("Unknown");
    });
});
