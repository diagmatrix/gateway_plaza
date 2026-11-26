---
name: spec-change
description: Makes an agreed change to the product spec, keeping docs/SPEC.md (version, changelog, decisions log, affected sections) and docs/BACKLOG.md in step. Use whenever the spec needs to change - a new or revised decision, a resolved spec gap, or a story whose acceptance criteria no longer match the spec.
---

# Change the spec

The spec is the source of truth, so it only changes once the maintainer has agreed the change. If it hasn't been agreed yet, write up the proposed change and ask; don't edit the files.

Change everything in one go, so the spec and the backlog never disagree:

## 1. The affected sections of `docs/SPEC.md`

- Edit every section the change touches, and search for other mentions of the same thing (`§` cross-references, the data model in §5, tables, the milestones in §11) so nothing is left saying the old thing.
- If the data model changes, update `docs/data-model.dbml` to match.

## 2. The decisions log (SPEC §10)

- A new decision gets the next number in the table, a short topic and the decision in one or two sentences.
- A decision that replaces an older one: mark the old row *Superseded by #N.* rather than deleting it.
- A resolved open question moves out of §10.1.

## 3. Version and changelog (SPEC header and §0)

- Bump the minor version in the `Status:` line (`v0.26` → `v0.27`) and set the date to today.
- Add a row at the top of the §0 changelog: version, date, and what changed in a sentence or two, with the decision numbers.

## 4. `docs/BACKLOG.md`

- Update the acceptance criteria of every story the change affects, and the Definition of Done if it changes.
- Update the spec version and date the backlog says it is based on (first lines of the file).
- A resolved spec gap moves from "Still open" to "Resolved" in §5, with the decision it became.
- If a story moves milestone, update the milestone table and §2.

## 5. Check

- Read the diff once more for anything still describing the old behaviour.
- If code already relies on the old spec, list what has to change; don't change it in the same edit unless asked.

Report the new version, the decision numbers, and the sections and stories changed.
