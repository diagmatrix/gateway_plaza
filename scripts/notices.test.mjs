// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from "vitest";

import { groupByPackage, isPlatformSpecific, normaliseText, renderNotices } from "./notices.mjs";

const dependency = (name, version, texts, extra = {}) => ({
    name,
    version,
    licence: "MIT",
    path: `/node_modules/${name}`,
    texts,
    ...extra,
});

describe("groupByPackage", () => {
    it("merges versions of a package, keeping distinct licences and texts", () => {
        const [notice] = groupByPackage([
            dependency("yaml", "1.0.0", ["ISC text\r\n"], { licence: "ISC" }),
            dependency("yaml", "2.0.0", ["ISC text", "NOTICE"], { licence: "ISC" }),
            dependency("yaml", "3.0.0", ["MIT text"]),
        ]);
        expect(notice).toEqual({
            name: "yaml",
            licences: ["ISC", "MIT"],
            homepage: undefined,
            texts: ["ISC text", "NOTICE", "MIT text"],
        });
    });

    it("gives the same result when only versions change", () => {
        const before = groupByPackage([dependency("zod", "4.0.0", ["MIT text"])]);
        const after = groupByPackage([dependency("zod", "4.1.3", ["MIT text"])]);
        expect(renderNotices(after)).toBe(renderNotices(before));
    });
});

describe("renderNotices", () => {
    it("says when there are no production dependencies", () => {
        expect(renderNotices([])).toContain("no third-party production dependencies yet");
    });

    it("lists each package with its licence and texts, without paths or versions", () => {
        const result = renderNotices(
            groupByPackage([
                dependency("keyrune", "3.0.0", ["SIL Open Font License", "GPL-3.0 text"], {
                    licence: "(OFL-1.1 AND GPL-3.0-only)",
                    homepage: "https://keyrune.andrewgioia.com",
                }),
            ]),
        );
        expect(result).toContain("keyrune\nLicense: (OFL-1.1 AND GPL-3.0-only)");
        expect(result).toContain("Homepage: https://keyrune.andrewgioia.com");
        expect(result).toContain("SIL Open Font License\n\nGPL-3.0 text");
        expect(result).not.toContain("/node_modules/");
        expect(result).not.toContain("3.0.0");
    });

    it("notes a package that ships no licence file", () => {
        const result = renderNotices(groupByPackage([dependency("bare", "1.0.0", [])]));
        expect(result).toContain("The package includes no licence file.");
    });

    it("ends in exactly one newline", () => {
        const result = renderNotices(groupByPackage([dependency("a", "1.0.0", ["MIT text"])]));
        expect(result.endsWith("MIT text\n")).toBe(true);
    });
});

describe("isPlatformSpecific", () => {
    it("spots packages built for one OS or CPU", () => {
        expect(isPlatformSpecific({ os: ["linux"], cpu: ["x64"] })).toBe(true);
        expect(isPlatformSpecific({ cpu: ["arm64"] })).toBe(true);
        expect(isPlatformSpecific({ name: "zod" })).toBe(false);
        expect(isPlatformSpecific({ os: [] })).toBe(false);
    });
});

describe("normaliseText", () => {
    it("uses LF, trims trailing spaces and blank edges", () => {
        expect(normaliseText("\r\nMIT License  \r\n\r\nCopyright\r\n\r\n")).toBe(
            "MIT License\n\nCopyright",
        );
    });
});
