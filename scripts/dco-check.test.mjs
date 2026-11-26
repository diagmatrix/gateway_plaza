// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, expect, it } from "vitest";

import { findUnsigned, parseLog } from "./dco-check.mjs";

const commit = (sha, ...signOffs) => ({ sha, subject: `commit ${sha}`, signOffs });

describe("findUnsigned", () => {
    it("passes commits with a sign-off", () => {
        expect(findUnsigned([commit("a", "Ada Lovelace <ada@example.com>")])).toEqual([]);
    });

    it("accepts Renovate's bot sign-off", () => {
        const renovate = "renovate[bot] <29139614+renovate[bot]@users.noreply.github.com>";
        expect(findUnsigned([commit("a", renovate)])).toEqual([]);
    });

    it("fails commits without a sign-off", () => {
        const result = findUnsigned([commit("a", "Ada <ada@example.com>"), commit("b")]);
        expect(result.map((c) => c.sha)).toEqual(["b"]);
    });

    it("fails a sign-off without a name or an email", () => {
        expect(findUnsigned([commit("a", "ada@example.com")])).toHaveLength(1);
        expect(findUnsigned([commit("b", "Ada")])).toHaveLength(1);
        expect(findUnsigned([commit("c", "Ada <not-an-email>")])).toHaveLength(1);
    });
});

describe("parseLog", () => {
    it("reads sha, subject and every sign-off", () => {
        const output =
            "aaa\x1fFirst\x1fAda <ada@example.com>\x1dBob <bob@example.com>\x1e\n" +
            "bbb\x1fSecond\x1f\x1e\n";
        expect(parseLog(output)).toEqual([
            {
                sha: "aaa",
                subject: "First",
                signOffs: ["Ada <ada@example.com>", "Bob <bob@example.com>"],
            },
            { sha: "bbb", subject: "Second", signOffs: [] },
        ]);
    });

    it("returns nothing for an empty range", () => {
        expect(parseLog("")).toEqual([]);
    });
});
