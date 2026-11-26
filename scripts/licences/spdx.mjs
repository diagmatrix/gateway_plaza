// SPDX-License-Identifier: AGPL-3.0-or-later

// Decides whether a package's declared licence, an SPDX expression such as
// "MIT", "(MIT OR GPL-2.0-only)" or "Apache-2.0 AND BSD-3-Clause", lets us
// use it. `OR` passes if either side passes (we pick the licence that works),
// `AND` only if both do. `X WITH exception` is judged on `X`, since an
// exception only adds permissions.

/** Deprecated SPDX identifiers that packages still declare, and what they mean. */
const deprecatedIds = new Map([
    ["GPL-2.0", "GPL-2.0-only"],
    ["GPL-2.0+", "GPL-2.0-or-later"],
    ["GPL-3.0", "GPL-3.0-only"],
    ["GPL-3.0+", "GPL-3.0-or-later"],
    ["LGPL-2.0", "LGPL-2.0-only"],
    ["LGPL-2.0+", "LGPL-2.0-or-later"],
    ["LGPL-2.1", "LGPL-2.1-only"],
    ["LGPL-2.1+", "LGPL-2.1-or-later"],
    ["LGPL-3.0", "LGPL-3.0-only"],
    ["LGPL-3.0+", "LGPL-3.0-or-later"],
    ["AGPL-3.0", "AGPL-3.0-only"],
    ["AGPL-3.0+", "AGPL-3.0-or-later"],
]);

/**
 * @param {string | undefined | null} expression the package's declared licence
 * @param {Set<string>} allowed SPDX identifiers we accept
 * @returns {boolean} true when the package may be used
 */
export function isAllowedExpression(expression, allowed) {
    if (typeof expression !== "string" || expression.trim() === "") return false;
    const tokens = expression.match(/\(|\)|[^\s()]+/g) ?? [];
    let position = 0;

    const peek = () => tokens[position];
    const next = () => tokens[position++];

    // expression := and ("OR" and)*
    function parseOr() {
        let result = parseAnd();
        while (peek()?.toUpperCase() === "OR") {
            next();
            const right = parseAnd();
            result = result || right;
        }
        return result;
    }

    // and := term ("AND" term)*
    function parseAnd() {
        let result = parseTerm();
        while (peek()?.toUpperCase() === "AND") {
            next();
            const right = parseTerm();
            result = result && right;
        }
        return result;
    }

    // term := "(" expression ")" | id ("WITH" id)?
    function parseTerm() {
        const token = next();
        if (token === undefined) throw new SyntaxError("unexpected end");
        if (token === "(") {
            const result = parseOr();
            if (next() !== ")") throw new SyntaxError("missing )");
            return result;
        }
        if (token === ")" || isOperator(token)) throw new SyntaxError(`unexpected ${token}`);
        if (peek()?.toUpperCase() === "WITH") {
            next();
            const exception = next();
            if (exception === undefined || exception === "(" || exception === ")") {
                throw new SyntaxError("missing exception");
            }
        }
        return isAllowedId(token, allowed);
    }

    try {
        const result = parseOr();
        return position === tokens.length && result;
    } catch {
        return false;
    }
}

/**
 * SPDX ids are case-insensitive. `X+` means "X or any later version", so it
 * passes whenever X does.
 *
 * @param {string} id
 * @param {Set<string>} allowed
 */
function isAllowedId(id, allowed) {
    const lower = (value) => value.toLowerCase();
    const deprecated = [...deprecatedIds].find(([old]) => lower(old) === lower(id));
    const normalised = (deprecated ? deprecated[1] : id).replace(/\+$/, "");
    return [...allowed].some((allowedId) => lower(allowedId) === lower(normalised));
}

/** @param {string} token */
function isOperator(token) {
    return ["AND", "OR", "WITH"].includes(token.toUpperCase());
}
