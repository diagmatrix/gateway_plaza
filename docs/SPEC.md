# Commander Game Tracker — Specification

Status: **Draft v0.26** · Last updated: 2026-11-24

A web app for Magic: The Gathering Commander players to log games, track stats per player, deck and playgroup, and browse a public global dashboard of commander statistics. Deployed on Vercel. The look and feel is themed on the plane of **Ravnica**: a vast gothic city.

---

## 0. Changelog

| Version | Date | Changes |
|---|---|---|
| v0.26 | 2026-11-24 | Two Postgres roles (decision #81): an owner role for migrations and an app role with DML only, which can't update votes. New `DATABASE_MIGRATION_URL`. |
| v0.25 | 2026-11-24 | Data model review (US-01) complete: `game_players` agreed (partial unique indexes for one starter and one winner, composite FKs for deck ownership, eliminations and legal pairs), approved flagged games keep their reasons (`flag_approved_at`), §5.1 delete rules rewritten for every table, "Pending review" removed, decision #22 updated. |
| v0.24 | 2026-11-24 | Data model review (US-01): `decks` and `games` agreed. Games drop `source` and `flagged` (flagged = non-empty `flag_reasons`), `win_condition` becomes `win_method`, locks get `locked_at`. Games of a deleted playgroup become anonymous games and go through the soft checks (decision #80). |
| v0.23 | 2026-11-24 | Data model review (US-01): `cards` trimmed (images, artist and set come from `printings`; legalities reduced to `commander_legality`; trigram + unaccent name index), no checks on raw Scryfall tables; `commanders` gets one column per pairing ability; commanders are never deleted. A Scryfall data check is deferred to US-16. |
| v0.22 | 2026-11-24 | **No database triggers** (decision #79): rules across rows move to the app, in locking transactions. Notifications agreed: typed subject columns instead of a JSON payload, new types for new claims and logged games, kept forever. |
| v0.21 | 2026-11-24 | Data model review (US-01), guest claims and votes agreed: four statuses plus a decision method, several members can claim one guest (approving one rejects the rest), one month to make a rejected claim public, archived claims reopen on unarchive, votes can't be changed and leavers' votes are dropped. |
| v0.20 | 2026-11-24 | Data model review (US-01), `guest_players` agreed: names allow accented letters (playgroup names too), claimed guests are kept and free their name, `created_by` records who added a guest. |
| v0.19 | 2026-11-24 | Data model review (US-01), `playgroup_members` agreed: `joined_at` resets on rejoin (it drives "longest-standing"), `created_at`/`updated_at` added, former members lose admin. Playgroup names allow spaces. |
| v0.18 | 2026-11-24 | Data model review (US-01), `playgroups` agreed: one `creator_id` column (no separate founder), name rules, invite code format, `archived_by` handed to the longest-standing member on account deletion. Banning moves to "Later" (the admin plugin's ban columns exist but are unused in v1). |
| v0.17 | 2026-11-23 | Data model review (US-01), `users` agreed: UUID keys, a `site_role` column and banning from Better Auth's admin plugin (replaces `SITE_ADMIN_EMAILS`), a placeholder email for Spirits, and hard deletion of accounts that nothing else references. (Banning moved to "Later" in v0.18.) The agreed model lives in `data-model.dbml`. |
| v0.16 | 2026-11-23 | Third-party agent skills are not committed: the development kit (`just setup`) installs them from a pinned manifest. |
| v0.15 | 2026-11-23 | Milestone 0 also installs vetted third-party agent skills, including diagmatrix's SQL style guide for all hand-written SQL. |
| v0.14 | 2026-11-23 | New **milestone 0** (repository and agent setup) before any app code; the repo, licence and CI checks move there from milestone 1. |
| v0.13 | 2026-11-23 | "Logged by" keeps a former member's name, like their seats do. |
| v0.12 | 2026-11-23 | Third round of answers: the full list of partner variants as of the November 2026 rules (including **Partner—[text]** variants such as Friends forever, Father & son, Survivors and Character select), notifications behind a header badge on `/me`, the longest-standing admin becomes creator when the creator deletes their account, and a fixed `logged_by` with display rules for people who left. |
| v0.11 | 2026-11-23 | Second round of gap answers: deck commanders can't change and a deck can never become generic again, generic → named deck conversion, decks are archived instead of deleted, the four soft checks with visible flag reasons, precomputed commander pairs, public claim timings and voting, in-app notifications, a transferable **creator** role, archive and unarchive rules, game creators reassigned to the playgroup creator, notes removal window, guests not anonymised in exports. |
| v0.10 | 2026-11-23 | Answers to the backlog's spec gaps: freed handles can be reused, timezone detected from the browser, email change, automatic admin promotion, admin demotion rules, playgroup **archiving** and deletion rules, `left_at` for former members, editing old games and turning a former member's seats into a guest, **public guest claims** with a member vote, canonical commander pair order, competition-style placements, sample sizes on every stat, admin-set leaderboard threshold, notes always members-only, head-to-head only against public players, data export scope, a site-admin notes tool, public launch after the last milestone. New open questions in §10.1. |
| v0.9 | 2026-11-23 | Handle rules (§3.1): 8–20 characters, letters, digits, `.`, `_` and `-`. |
| v0.8 | 2026-11-23 | The app is licensed under **AGPL-3.0-or-later** (§7.3): public repository, a "Source code" link for users of the hosted app, and a CI licence check. Keyrune can now be used as published (font, CSS and SVGs). |
| v0.7 | 2026-11-23 | Mana symbols from Scryfall's symbology SVGs, downloaded by a script and served as static assets. Set symbols, if needed, from the Keyrune font (font files only, because of its GPL-3.0 parts). |
| v0.6 | 2026-11-23 | Answers to the v0.5 open questions. Scryfall's **Default Cards** file (every English printing) is also synced, into a `printings` table, so profile pictures are resolved locally and the app makes **no Scryfall API calls during user requests**. Private playgroups show the card art of their **Ravnica location** pseudonym. Every playgroup game must include its creator's seat; nobody, admins included, can remove it. Sync writes only changed rows; storage estimate added, with a lazy printings cache as the fallback if storage becomes a problem. |
| v0.5 | 2026-11-23 | Answers to the v0.4 open questions. Spirit picture: Spirit token TGTC #7. Leaderboard opt-in confirmed as a separate toggle. Members can only log games they play in (so the guest-claim rule is "no games logged in the group"). An unnamed, unlinked deck is the player's unique **generic deck** for that commander and collects every generic seat. Spirits removed from head-to-head. Context-only pseudonyms confirmed. GDPR assessment of Spirit rows added (§4.1). Card sync processes the full Oracle Cards file into a `cards` table and derives `commanders` from it. Private players show their pseudonym character's card art as their picture. UI direction rewritten around the gothic city, with no guild symbols. |
| v0.4 | 2026-11-22 | Review feedback applied. Decks: name and link both optional, several decks per commander allowed, and seats can be "generic" (commander only, no deck); deck suggestions while logging. Admins can **lock** games. Profile pictures from a Scryfall printing (default: Totally Lost, GTC). Guest claims only allowed for users with no games in the group (replaces the conflict rule). Games log a **date only**. Opt-in public **player leaderboard** on the global dashboard. Private players and playgroups shown as **Ravnica characters and locations**. Deleted users kept as **"Spirit"** rows. Data model marked as pending review. UI: custom Ravnica design system instead of stock shadcn/ui. |
| v0.3 | 2026-11-22 | Previous draft. |

---

## 1. Goals & scope

### v1 (MVP)
- Accounts (Google + email magic link).
- Playgroups: create, join by invite, belong to several.
- Decks: users register decks (commander from Scryfall, plus an optional name and link).
- Log games after they finish (mobile-first form). Seats can use a registered deck or just a commander ("generic").
- Guest players in games, claimable later by real accounts.
- Anonymous game submission without an account (global pool only), with anti-spam.
- Stats: per player, per deck, per playgroup.
- Public global dashboard (aggregated, anonymous), plus an opt-in public player leaderboard.
- Privacy controls for player profiles and playgroups.
- Ravnica-themed custom UI.

### Later (designed for, not built in v1)
- **Live game mode**: start a game, track life totals and commander damage, and save automatically when it ends. The data model already supports games with `in_progress` status.
- Decklist import and parsing (Moxfield/Archidekt).
- Seasons / leagues per playgroup.
- **Banning users**: site admins can ban a signed-in user, optionally until a date. Better Auth's admin plugin already provides it, and its columns (`is_banned`, `ban_reason`, `ban_expires_at`) exist from v1.

### Out of scope
- Card-level stats, deck building, trading, rules enforcement.
- Team formats (Two-Headed Giant, etc.). Every game is free-for-all. Teams could be added later with an optional `team` column on `game_players`.

---

## 2. Users & roles

| Role | Description |
|---|---|
| **Visitor** | Not signed in. Can view the global dashboard and any public profiles/playgroups. Can submit an anonymous game to the global pool. |
| **User** | Signed in. Owns a profile and decks. Can create/join playgroups. Can also submit anonymous games to the global pool (§3.5). |
| **Playgroup member** | Can view everything in the group and log games they played in. Can edit/delete games they created, unless an admin has **locked** the game (§3.4.2). |
| **Playgroup admin** | Creator is the first admin. Can edit/delete any game in the group (locked or not), lock and unlock games, manage members, guests, invites and the group's visibility, and promote other admins. |
| **Guest player** | A name inside a playgroup with no account (e.g. "Pablo"). Appears in games and stats. Can be claimed by a user (§3.2). |
| **Spirit** | What remains of a deleted account (§4). Keeps its seats in past games, holds no personal data, and can't sign in. |

A user can be in any number of playgroups.

---

## 3. Features

### 3.1 Authentication & profile
- **Better Auth** with:
  - Google OAuth
  - Email magic link (transactional email via **Resend**)
- **Account linking**: Google and magic link sign-ins with the same verified email resolve to the same account (Better Auth account linking enabled, trusted provider: Google).
- **Onboarding**: on first sign-in the user picks a display name and a unique handle (pre-filled from Google when available; magic link users must enter one). Both are editable later. The handle `spirit` (any case) is reserved. The user's **timezone** is detected from the browser at onboarding and can be changed in the account details on `/me`.
- **Handle rules**: 8 to 20 characters. Allowed characters are letters and digits (`A–Z`, `a–z`, `0–9`) plus `.`, `_` and `-`. Handles are unique regardless of case. A handle pre-filled from Google is only a suggestion and must pass the same rules before it can be saved. A handle that is given up (changed, or cleared by account deletion) can be taken by anyone; old links to `/u/[handle]` then lead to the new owner.
- **Email change**: users can change their account email from the account details on `/me`. The new address must be verified before it takes effect.
- **Profile picture**: a card art from Scryfall, chosen by **printing**: the user enters a set code and a collector number (e.g. `GTC` + `54`).
  - **Default**: *Totally Lost* from Gatecrash (`GTC` #54). The Google profile photo is not used.
  - The **art crop** of the printing is shown (for double-faced cards, the front face). Scryfall's guidelines require the artist and copyright to be credited wherever an art crop is shown without the full card, so the profile page shows "Art: *card name* by *artist*" next to the picture, and a tooltip does the same on small avatars.
  - The printing is looked up in the local `printings` table (§7.1); unknown printings are rejected. No Scryfall API call is made. The user row stores a reference to the printing (`avatar_printing_id`), so the image URL and artist stay current after each sync. The image itself is hotlinked from Scryfall's image servers, not re-hosted.
  - The picker autocompletes collector numbers once a set code is entered, and shows a live preview before saving.
  - Tokens are allowed (the Spirit picture, §4, is a token printing).

### 3.2 Playgroups
- Create a group with a name, an optional description, and its visibility. **Name rules**: 4 to 50 characters: letters (accented ones included), digits, spaces, `.`, `_` and `-`, with no leading, trailing or double spaces.
- Invite via **link / code** (admin can regenerate or disable it). A code is 10 random URL-safe characters generated by the app. Codes don't expire and have no use limit: they last until regenerated or disabled. Joining requires being signed in.
- Members can leave a group. Admins can remove members and promote members to admin. A group always keeps at least one admin: if the last admin leaves, the longest-standing remaining member is promoted automatically.
- **Creator**: each group has exactly one **creator**, at first the person who made it. The creator is always an admin and can't be demoted or removed. When the creator leaves the group, they must first pick another member as the new creator. A former creator who rejoins is an ordinary member. If the creator deletes their account, the **longest-standing admin** becomes the creator (after the last-admin rule in §4 has run, so there is always one).
- **Demoting admins**: only the creator can demote other admins.
- **Archiving**: an admin can archive a group. An archived group keeps its games and stats and stays readable, but no games can be logged and no members or guests can be added. Archiving disables the invite link and rejects every pending or public guest claim. Only the creator can unarchive it. The group records who archived it; if that person deletes their account, it passes to the longest-standing remaining admin, or member if there is no admin.
- **Deleting**: a group can only be deleted when it has **no games** (by an admin) or **no members** (automatically, decision #8). A group with games is archived instead. When a group with games is deleted because no members are left, its games are **not** deleted: they become anonymous games in the global pool (no group, no players' names, no notes; commanders and results kept) and go through the soft checks of §6 that don't need an IP hash (decision #80).
- **Former members** (who left or were removed): their membership row is kept with `left_at` set. Their past games stay and keep their name. They lose access to the group's private pages and can no longer edit games they created; only admins can. If they rejoin, `left_at` is cleared and they get their history back automatically, because seats are linked by `user_id`.
- **Turning a former member into a guest**: an admin can convert all of a former member's seats in the group into seats of a new guest, so the history can be claimed later (by the same person if they rejoin, or by someone else). The admin chooses the guest's name (unique in the group). This also works for a Spirit (a deleted user).
- **Guest players**: any member can add a guest name to the group while logging a game. Guest names are 1 to 30 characters (letters, accented ones included, digits, spaces, `.`, `'` and `-`) and unique among the group's unclaimed guests (case-insensitive). A claimed guest is kept as a record of the claim, and its name can be reused.
- **Claiming a guest**: a member of the group asks to claim a guest profile, and an admin approves. Once approved, all of the guest's seats are re-linked to the user's account.
  - **Public claims**: if an admin rejects the claim, or nobody reviews it within **one month**, the claimant can make it **public**. Every current member except the claimant is notified (§3.8) and can vote, including the admin who rejected it. Voting stays open for **one more month**. The claim is approved as soon as more than half of those members accept; if that hasn't happened when voting closes, it is rejected. A rejected public claim is final: the claimant can never claim that guest again. The group's **creator** can override the result either way. A claim rejected by an admin can be made public within **one month** of the rejection. Votes can't be changed; a member who leaves the group loses their votes on open claims.
  - **Several claims on one guest**: different members can claim the same guest at the same time. When one claim is approved, the others for that guest are rejected.
  - **Archiving**: open claims are rejected when the group is archived. When it is unarchived, they go back to pending if the claimant is still a member.
  - **Eligibility rule**: a member can claim a guest **only if they have no game recorded in that playgroup**. Since members can only log games they play in (§3.4), "no game recorded" and "no seat in any game of the group" are the same thing. Once a member has played even one recorded game in the group, they can no longer claim a guest there. The rule is checked when the claim is requested and again when an admin approves it (a game may have been logged in between). A user can claim at most one guest per playgroup, and a **pending** (or public) claim counts towards that limit.
  - Because the claimant has no games in the group, the user and the guest can never share a game, so the v0.3 conflict check is no longer needed.

### 3.3 Decks
- A deck belongs to a user and has:
  - **Commander** (required), picked with autocomplete from the local `commanders` table (§7.1). Only cards that can legally be a commander are offered.
  - Optional **second commander**, only when the pairing is legal (Comprehensive Rules 702.124, as of November 2026):
    - **Partner**: any two cards with plain Partner.
    - **Partner with [name]**: only the named card, and only if it names this one back.
    - **Partner—[text]**: only another card with the **same** text. Known variants: *Friends forever* (Stranger Things Secret Lair; re-templated from "Friends forever" in January 2026), *Father & son* (God of War Secret Lair), *Survivors* (The Last of Us Secret Lair), *Character select* (Teenage Mutant Ninja Turtles Commander). New variants are recognised from the card text, with no code change.
    - **Choose a Background**: a creature with it plus a legendary Background enchantment. A Background can't be a commander on its own.
    - **Doctor's companion**: a card with it plus a legendary Time Lord Doctor creature with no other creature types.
    - Different variants never mix (plain Partner can't pair with Partner—Survivors, for example). A card with two pairing abilities (e.g. Amy Pond: Partner with Rory Williams and Doctor's companion) uses one of them per pair.
  - **Canonical pair order**: a pair is always stored and compared in one order, so the same two commanders are the same pair everywhere (generic decks, seats, stats). Partner, Partner with and every Partner—[text] variant: alphabetical by card name. Background pairs: the creature first, then the Background. Doctor's companion pairs: the Doctor first, then the companion.
  - **Precomputed pairs**: every legal pair is derived from the card data during the sync (§7.1) and stored in canonical order in `commander_pairs`. Pickers and validation read from that table, so the rules live in one place.
  - Optional **name** and optional **link** (Moxfield, Archidekt, etc.). Both can be empty. The link is stored as-is and not parsed.
  - Color identity and card art come from Scryfall.
  - Optional bracket (1–5). This pre-fills the game's bracket (§3.4).
- A user can have **several named or linked decks with the same commander** (e.g. two Atraxa builds).
- **Generic deck**: a deck with **neither a name nor a link** is the player's *generic deck* for that commander (or commander pair). It is **unique per player and commander(s)**: a player can't create a second one, and the form offers to open the existing one instead.
  - It collects **every generic seat** of that player with that commander: every game where the player played the commander without picking a named/linked deck, whether or not the generic deck row exists yet.
  - Creating the row is optional. It exists so the player can set a bracket for their generic games, archive it, or see it in their deck list. Without a row, the generic deck is still shown in the player's stats, built from the seats.
  - Its display label is the commander name(s).
- **Display label** for other decks: the deck's name if it has one, otherwise the host of the link (e.g. "Moxfield deck") followed by the commander name.
- Decks can be archived (hidden from pickers and suggestions, stats kept). Players **can't delete** decks; archiving is how a deck is removed. (Decks are only deleted with the account, §4.)
- **Editing a deck**: the commander(s) can never be changed. The name and link can be changed, but once a deck has a name, the name can't be removed, only changed. A deck that has a name or link can never become a generic deck.
- **Turning a generic deck into a named deck**: when a player has no named or linked deck for a commander, they can give their generic deck for it a name (and link). Every generic seat of theirs with that commander moves to the new named deck. Later games without a deck start a new generic deck.
- **Generic seat**: a seat with a commander but no named/linked deck (`deck_id` empty). Members play a generic seat whenever no deck is picked (§3.4). Generic seats count towards the player's generic deck for that commander, the player's stats and the commander's stats.
- Guests don't have decks, but the same idea applies in stats: a guest's games with a commander are grouped together.

### 3.4 Logging a game (playgroup)
Mobile-first form, one screen where possible. Games can't be logged in an archived group (§3.2).

**Required**
- Playgroup (defaults to the last one used)
- **Date played** (date only, no time). Defaults to today in the logging user's timezone and can't be in the future.
- Players (2–8; free-for-all): a current member or guest, and for each one a **commander** (plus partner/background when legal). The same person can't take two seats. Several players **can** play the same commander in one game.
- **The logging member must be one of the players.** The form pre-fills their own seat and doesn't let them remove it. A member can't log a game they didn't play in. This applies to playgroup games only; anonymous submissions (§3.5) are linked to nobody.
- **Result**: either one **winner** or **Draw / no winner**
- **Who started** (the player who took the first turn)

**Deck suggestion (members only)**
- After a seat's player and commander are filled in, if that player has any **non-archived named or linked** deck with the same commander (and the same second commander, if one is entered), those decks are offered as suggestions under the commander field.
- Picking a suggestion links the deck to the seat and fills in its second commander and bracket. Suggestions are never auto-picked, even if there is only one.
- If no deck is picked, the seat stays **generic** and counts towards the player's generic deck for that commander. If that generic deck row exists and has a bracket, it pre-fills the game bracket like any other deck.
- The suggestions are the seated player's decks, whoever is filling in the form.

**Optional**
- Turn order for every seat. If recorded, the starting player must be seat 1.
- Turn count
- Eliminations: who eliminated whom, on which turn, and how (**outcome method**, §3.4.1)
- Finishing place for each player (filled in from eliminations when they're recorded). If a winner is recorded, they're place 1, or place is left empty. In a draw, nobody gets place 1; the players still in at the end share the best place. Players eliminated at the same time share a place and the next place is skipped (standard competition ranking: e.g. 1, 2, 3, 3 in a 4-player game, or 1, 2, 2, 4 if two are eliminated together while two remain).
- Win condition (**outcome method**, §3.4.1)
- Game bracket (1–5). Pre-filled from the seats' decks: the highest bracket among the decks (named, linked or generic) that have one. The player can change it.
- Duration (minutes)
- Notes (free text). Notes are only ever shown to members of the group, even when the group is public.

**Ordering**: games on the same date are ordered by when they were logged (`created_at`).

**Editing:** the game's creator and group admins can edit or delete it, unless the game is locked (§3.4.2). While the game's creator is the person who logged it, their seat can't be removed by anyone, admins included, so every game includes the person who logged it. If the creator was entered by mistake, an admin deletes the game and it is logged again by someone who played.

**When the game's creator leaves:** if the person who logged a game leaves the group or deletes their account, the game's `created_by` becomes the playgroup's creator. From then on the creator-seat rule no longer applies to that game, because the playgroup creator may not have played in it. This also applies to games already reassigned when the playgroup creator changes. Every edit records an `updated_by` / `updated_at`.

**Who logged the game:** every game also keeps `logged_by`, the person who logged it, which never changes. The game page shows "logged by" from it:
- a current or former member: their name (the same as on their seats, §3.2);
- a deleted account: "Spirit".

**Editing games with former members or archived decks:** when a game includes a former member or an archived deck, the creator and admins can keep those seats as they are or swap the member and deck. The form shows a warning on each such seat ("no longer in this playgroup", "archived deck").

#### 3.4.1 Outcome methods
One fixed list, used for both the win condition and elimination methods (no free text):
`combat`, `commander_damage`, `combo`, `alt_win`, `poison`, `mill`, `life_loss_other` (burn/drain), `conceded`, `other`.

#### 3.4.2 Locked games
- A playgroup admin can **lock** a game, and any admin can unlock it.
- A locked game can't be edited or deleted by any non-admin, **including its creator**. Admins can still edit and delete it.
- The game page shows a lock badge with who locked it and when. Non-admins see the edit/delete actions disabled with an explanation.
- System actions still apply to locked games: re-linking seats when a guest claim is approved, moving seats when a generic deck becomes a named deck, turning a former member's seats into a guest, reassigning `created_by` when a game's creator leaves, clearing deck links when an account is deleted, and turning a deleted user's seats into Spirit seats (§4).

### 3.5 Anonymous game submission (global pool)
- Available from the home page to visitors **and signed-in users**.
- The game belongs to no playgroup and is linked to no user, even when a signed-in user submits it (`created_by` stays null). Players are entered **only as commanders** (no names are stored) and are shown as "Player 1", "Player 2", … "Player N". Eliminations refer to these seats.
- Required: the commanders (2–8), the result (winner or draw), who started, and the date played. Optional fields are the same as in 3.4, except there are **no notes**: anonymous submissions never store free text.
- These games feed the **global dashboard only**.
- **Anti-spam** (see §6).

### 3.6 Stats
**Counting rules:** a draw counts as a game played but as a win for nobody. Win rate = wins / games played, so draws lower it. Stats can be filtered by pod size, so 4-player numbers stay comparable. Generic seats count for the player's generic deck with that commander (§3.3).

**Sample sizes:** every average and rate is shown with the number of games (or recorded values) it is based on, so users can judge how reliable it is. Optional fields that weren't filled in are left out of the calculation and the count. The turn of a win is the game's turn count.

**Player (within a playgroup and overall):** games played, wins, draws, win rate, win rate when starting vs not, most-played decks/commanders, head-to-head record against other players.

**Head-to-head (A vs B)**, over games where both played. Spirits are left out: they can't be picked as A or B, and don't appear in anyone's head-to-head list.
- Games together, A's wins, B's wins.
- **Finished higher**: how often A placed better than B. Only games where both have a place count; ties count for neither.

**Deck** (named, linked or generic): games played, wins, win rate, average finishing place, average turn of win or elimination, win rate by turn-order seat.

**Playgroup:** leaderboard (wins, win rate with a minimum-games threshold set by the group's admins, never below 5), games over time, most-played commanders, starting-player advantage, average game length (turns/minutes). Spirits keep their seats in game lists, but are left out of the leaderboard ranking and head-to-head.

### 3.7 Global dashboard (public)
Commander totals, built from **all games**: playgroup games plus anonymous ones.
- Total games, number of active commanders (commanders with at least one counted game)
- Most-played commanders, and win rate per commander (shown once a commander has at least N games, default 10)
- Color identity popularity and win rate
- Bracket distribution (from the game's bracket)
- Starting-player win rate, and draw rate
- Pod-size filter (default: all; 4-player highlighted)
- Filter: **"All games" / "Playgroup games only"**. Anonymous games are the less trusted source, so this lets visitors exclude them.

The commander totals never show player names, playgroup names, or individual games. Players and playgroups **cannot opt out** of being counted in them, because the data is anonymous totals.

#### 3.7.1 Public player leaderboard (opt-in)
- A separate section of the dashboard listing **top players by win rate** and **top players by total games**.
- Only players who **opt in** appear. The opt-in is a setting on `/me`, off by default, and only available while the player's profile is public (§4). Making the profile private again removes them from the leaderboard.
- Counted from the player's seats in playgroup games (all their groups, public or private). Anonymous games are never attributed to a player. Only totals are shown, never group names or individual games.
- Win rate ranking needs a minimum number of games (default 20). The pod-size filter applies.
- Each entry shows the player's profile picture, display name and handle, and links to their public profile.
- Guests and Spirits never appear.

### 3.8 Notifications
- **In-app only** (no email). Notifications are kept forever. Types:
  - A guest claim is made: the group's admins.
  - A claim goes public: every current member except the claimant.
  - A claim is decided, including an admin's rejection (with the deadline to make it public): the claimant.
  - A playgroup game is logged: every player in it except the person who logged it.
- A **badge in the header** shows the number of unread notifications and opens the **Notifications** section of `/me`.

---

## 4. Privacy model

| Layer | Default | Who can change it | What becomes public |
|---|---|---|---|
| Global dashboard (commander totals) | Always public | Nobody | Totals only (§3.7) |
| Public player leaderboard | **Off** | The player (requires a public profile) | Player's name, handle, picture, games and win rate (§3.7.1) |
| Player profile | **Private** | The player | Display name, picture, decks, overall stats, game history |
| Playgroup | **Private** | Group admins | Group name, leaderboard, game list, group stats |

**Ravnica pseudonyms for private players and playgroups:**
Where a private player or playgroup would show up on a public page, it is shown under a **Ravnica pseudonym** instead of its real name:
- Private **players** (and guests of private groups) get the name of a **Ravnica character** (e.g. "Niv-Mizzet", "Lavinia", "Krenko").
- Private **playgroups** get the name of a **Ravnica location** (e.g. "Tenth District", "Nivix", "Rix Maadi"). Their picture is the **card art of that location** (a card depicting it, such as a land or a spell set there), credited like any art crop.
- **Player picture**: a private player's picture is the **card art of their pseudonym character** (the art crop of that character's card, e.g. *Niv-Mizzet, Parun* for "Niv-Mizzet"), with the artist credited in the tooltip like any art crop (§3.1). Their real profile picture is never shown. Each entry in the character and location lists is mapped to one printing in the local `printings` table (§7.1), so no API calls are needed.
- A pseudonym must never be mistaken for a real player or group: it is **not clickable**, uses a distinct muted colour **and** italics plus a mask icon (not colour alone, §9), and has a tooltip "Private player" / "Private playgroup".
- **Stable per page context, not across the site**: the pseudonym is derived from a keyed hash of (subject id, context id), where the context is the public playgroup or public profile being viewed. The same private player keeps the same pseudonym everywhere on one public group's pages (so a leaderboard and game list stay readable), but gets a different one on another group or profile, so pseudonyms can't be used to track someone across the site. Collisions within one context are resolved deterministically (next free name in the list).
- The character and location lists are curated in the codebase (Fan Content Policy applies, §9).
- Spirits are always shown as "Spirit", never with a pseudonym.

**How the layers combine:**
- On a **public playgroup's** pages, a member with a **private profile** appears under a Ravnica character pseudonym. Their commander and placement are still shown. Members of the group always see real names.
- On a **public profile**, games from **private playgroups** show the commander and result. The group appears under a Ravnica location pseudonym, and the opponents under character pseudonyms.
- Guests follow their playgroup's visibility.
- Everyone signed in can see everything inside the playgroups they belong to. Public pages render the same for every viewer: when a member of a private group opens one of that group's games from someone else's public profile, they are redirected to their own member view of the group instead.
- **Head-to-head on public profiles** only lists opponents whose profiles are public. Private players are left out, not pseudonymised.
- **Notes** are never shown outside the group's members (§3.4).

**Account deletion ("Spirit"):**
- If nothing outside the user's own data points at the user row (no seats, no games they created, logged, edited or locked, no groups they founded, no claims they reviewed), the row is **hard-deleted** along with their own data, and nothing below applies.
- Otherwise the user row is **kept**, so the user's seats, created games and edits keep pointing at it. It is anonymized:
  - Display name becomes **"Spirit"**. The handle is cleared (handles are unique, so it can't be set to "spirit" for everyone; the reserved handle is never assigned).
  - Profile picture becomes the **Spirit token from Gatecrash Tokens** (`TGTC` #7), shown like any art crop with its artist credit.
  - Email is overwritten with a non-routable placeholder (`spirit-<id>@deleted.invalid`); timezone and all other personal fields are cleared; `deleted_at` is set; profile and leaderboard opt-in are turned off.
- Sessions, linked auth accounts (Google, magic link), memberships and pending guest claims are deleted. The person can't sign in to the Spirit; signing up again with the same email creates a new, unrelated account.
- **Decks are deleted.** Seats that used them keep their commander and become generic.
- Seats keep their commander, placement and result, so group and global stats stay correct. Wherever the user's name appeared on seats and as "edited by", "Spirit" is shown with the Spirit token picture. Games they logged are reassigned to the playgroup's creator (§3.4). A group with several deleted users shows several "Spirit" entries.
- If they were a group's last admin, the longest-standing member is promoted. If they were its creator, the longest-standing admin becomes creator. If they archived it, `archived_by` passes to the longest-standing remaining admin, else member. If no members remain, the group is deleted.
- Game notes written by the user are part of the group's records and are kept.
- A deleted user can ask the site admin to remove notes that **directly call out their handle**, in games created or last modified **before** their account was deleted (a reused handle may belong to someone else afterwards). The site admin page has a tool to search and edit notes (§6).

### 4.1 GDPR assessment of Spirit rows
*Not legal advice; a reasoned reading of the rules to check with a professional before launch.*

- **Is a Spirit still personal data?** Probably yes. Under GDPR Recital 26, data is anonymous only if nobody can identify the person by means "reasonably likely to be used". The EU Court of Justice (*EDPS v SRB*, C-413/23 P, 4 Sept 2025) said this depends on context and on who could realistically re-identify. Here, other members of the group know who sat in those games, and the Spirit row links all of the person's seats together. So, at least for the app operator, Spirit seats are best treated as **pseudonymised personal data**, not anonymous data. (The v0.3 design, with seats unlinked, had the same issue in a weaker form, because group members can still recognise individual games.)
- **Can we keep it after an erasure request?** Erasure (Art. 17) isn't absolute. Keeping a minimal record that other members rely on (their own game history and stats) can be justified as a **legitimate interest** (Art. 6(1)(f)), as long as what is kept is minimal and the person was told in advance. What's kept is minimal: commander, seat, placement, result and date, with no name, email, handle, picture or decks.
- **What the spec does to support this:**
  1. Everything that identifies the person directly is deleted or overwritten (§4, account deletion).
  2. The privacy policy states before sign-up that game results stay in the group's records as "Spirit" after deletion, and why.
  3. A short written **legitimate interest assessment** is kept with the privacy policy.
  4. Spirits never appear outside the groups they played in: no public profile, no leaderboard, no head-to-head.
  5. Free-text game notes can mention people by name. They are only visible to group members. Admins can edit notes, and a deleted user can ask the site admin to remove notes that directly call out their handle.
  6. The Spirit row keeps no link to the old email or auth accounts, so the operator can't tie a Spirit back to a real account either.
- **Remaining risk**: a regulator could still take the view that the person should have been fully erased. If that becomes a concern, the fallback is to turn the person's seats into unlinked seats (no `user_id`) and drop the Spirit row; stats stay correct either way.

**Data protection (GDPR):**
- Privacy policy page, linked from sign-in and the footer.
- Only essential cookies (the auth session). No analytics cookies, so no consent banner is needed. If analytics is added later, it must be cookie-free (e.g. Vercel Web Analytics) or ask for consent.
- **Data export**: `/me` offers a JSON download of the user's profile, decks, memberships and **every game they played in**. Other players in those games whose profiles are private are anonymised. Guests are exported as they are.
- **Account deletion**: self-service from `/me`, as described above. The confirmation screen repeats what is kept as "Spirit" (§4.1).

---

## 5. Data model (Postgres)

> **Reviewed (US-01, 2026-11-24).** The full definition (types, keys, indexes and every named CHECK) is in `data-model.dbml` in the repository docs, which is the source of truth for names and types. The summary below follows it. There are no database triggers (decision #79): rules that span rows are enforced by the app and listed in the `.dbml` notes.

```
users              id (uuid), email (unique; Spirit: 'spirit-<id>@deleted.invalid'), email_verified,
                   display_name, image (always null), handle (unique on lower(handle), nullable),
                   avatar_printing_id → printings (nullable = default picture, Totally Lost GTC #54),
                   is_profile_public, is_leaderboard_public (only true if is_profile_public),
                   timezone, site_role ('user'|'admin'), is_banned, ban_reason, ban_expires_at,
                   created_at, updated_at, deleted_at (nullable; set = Spirit)
                   -- agreed in US-01; full definition and checks in data-model.dbml
  (+ Better Auth tables: sessions, accounts, verifications)

playgroups         id (uuid), name (4–50 chars: Unicode letters, digits, spaces, . _ -), description (nullable),
                   is_public, invite_code (unique, nullable; 10 URL-safe chars, null when disabled or archived),
                   creator_id → users (current creator; first the person who made it, transferable),
                   leaderboard_min_games (int, >= 5, default 5), archived_at (nullable), archived_by → users (nullable),
                   created_at, updated_at
                   -- agreed in US-01; full definition and checks in data-model.dbml

playgroup_members  playgroup_id → playgroups, user_id → users, role ('admin'|'member'),
                   joined_at (latest join; reset on rejoin), left_at (nullable; set = former member, cleared on rejoin),
                   created_at (first join), updated_at
                   PK (playgroup_id, user_id)
                   -- agreed in US-01; full definition and checks in data-model.dbml

guest_players      id (uuid), playgroup_id → playgroups, name (1–30 chars), claimed_by → users (nullable),
                   claimed_at (nullable), created_by → users (nullable; who added it), created_at, updated_at
                   UNIQUE (playgroup_id, lower(name)) WHERE claimed_by IS NULL
                   -- agreed in US-01; full definition and checks in data-model.dbml

guest_claims       id (uuid), playgroup_id, guest_id → guest_players (composite FK with playgroup_id), user_id → users,
                   status ('pending'|'public'|'approved'|'rejected'), reviewed_by, reviewed_at,
                   made_public_at, voting_ends_at, decided_at, decided_by,
                   decision_method ('admin'|'vote'|'override'|'voting_closed'|'archived'|'guest_claimed'),
                   created_at, updated_at
                   UNIQUE (guest_id, user_id); UNIQUE (playgroup_id, user_id) WHERE status IN ('pending','public','approved')
                   -- agreed in US-01; full definition and checks in data-model.dbml

notifications      id (uuid), user_id → users, type ('claim_created'|'claim_made_public'|'claim_decided'|'game_logged'),
                   guest_claim_id → guest_claims (nullable), game_id → games (nullable; exactly one subject),
                   created_at, read_at (nullable). No payload: text is built from the subject when shown.

guest_claim_votes  claim_id → guest_claims, user_id → users, is_accepted, created_at
                   PK (claim_id, user_id); votes can't be changed

cards              oracle_id (PK), scryfall_id (Scryfall's chosen printing), name, type_line,
                   color_identity (text[]), keywords (text[]), commander_legality, raw (jsonb),
                   source_hash, updated_at
                   (every card in Scryfall's Oracle Cards bulk file, §7.1; images, artist and set come
                    from printings via scryfall_id; trigram + unaccent index on name for autocomplete)

printings          scryfall_id (PK), oracle_id (nullable), name, set_code, collector_number, lang,
                   layout, image_normal_url, image_art_crop_url, artist, source_hash, updated_at
                   UNIQUE (set_code, collector_number, lang)
                   (every printing in Scryfall's Default Cards bulk file, tokens included, §7.1;
                    only the columns we need, no raw object, to keep storage small)
                   -- cards and printings are raw Scryfall data: no CHECK constraints

commanders         oracle_id (PK) → cards, has_partner, partner_with_oracle_id (nullable, no FK),
                   partner_variant (nullable; e.g. 'Friends forever'), can_choose_background, is_background,
                   is_doctor, is_doctors_companion, updated_at
                   (derived from cards, §7.1; one column per pairing ability, a card can have several;
                    rows are never deleted: a card that disappears is kept and logged for review)

commander_pairs    first_id → commanders, second_id → commanders,
                   pairing_type ('partner'|'partner_with'|'partner_variant'|'background'|'doctor'), updated_at
                   PK (first_id, second_id); every legal pair, in canonical order (§3.3), derived in the sync

decks              id (uuid), owner_id → users, commander_id → commanders, partner_id → commanders (nullable),
                   name (nullable; 1–60 chars, free text), url (nullable; any http(s) link), bracket (1–5, nullable),
                   archived_at (nullable), created_at, updated_at
                   FK (commander_id, partner_id) → commander_pairs: a pair must be legal and in canonical order (§3.3)
                   -- several named/linked decks per (owner, commander) allowed
                   -- generic deck = name IS NULL AND url IS NULL; at most one per owner + commander(s):
                   --   UNIQUE NULLS NOT DISTINCT (owner_id, commander_id, partner_id) WHERE name IS NULL AND url IS NULL
                   -- colour identity is derived from cards, not stored
                   -- agreed in US-01; full definition and checks in data-model.dbml

games              id (uuid), playgroup_id → playgroups (nullable = anonymous), status ('completed'|'in_progress'),
                   played_date, is_draw, win_method (outcome method, nullable), turn_count (1–50), duration_minutes,
                   bracket (1–5), notes (nullable, ≤ 2000 chars, never on anonymous games),
                   locked_at, locked_by → users, created_by → users, logged_by → users (never changes),
                   updated_by → users, submitter_ip_hash (anonymous only), flag_reasons (text[]), flag_approved_at (flagged = reasons and not approved),
                   created_at, updated_at
                   -- no source column: anonymous = playgroup_id IS NULL
                   -- creator-seat rule applies while created_by = logged_by (no marker column)
                   -- agreed in US-01; full definition and checks in data-model.dbml

game_players       id (uuid), game_id → games, user_id → users (nullable), guest_id → guest_players (nullable),
                   deck_id (nullable = generic seat), commander_id → commanders, partner_id → commanders (nullable),
                   seat (1–8, nullable), is_starter, is_winner, placement (1–8, nullable), eliminated_turn (nullable),
                   eliminated_by (nullable), elimination_method (outcome method, nullable), created_at, updated_at
                   UNIQUE (game_id, user_id), UNIQUE (game_id, guest_id), UNIQUE (game_id, seat)
                   UNIQUE (game_id) WHERE is_starter; UNIQUE (game_id) WHERE is_winner   -- at most one each
                   FK (deck_id, user_id) → decks (id, owner_id) ON DELETE SET NULL (deck_id): the deck is the seated user's
                   FK (game_id, eliminated_by) → game_players (game_id, id) ON DELETE SET NULL (eliminated_by)
                   FK (commander_id, partner_id) → commander_pairs: legal pair in canonical order
                   -- at most one of user_id / guest_id; both null only for anonymous games
                   -- enforced in the app (game service, decision #79): 2–8 seats; exactly one starter
                   --   (seat 1 if seats are set); exactly one winner unless a draw, none if it is; winner placed
                   --   1 or null; nobody placed 1 in a draw; the logger has a seat while created_by = logged_by;
                   --   seat commanders match the deck's
```

### 5.1 Delete behavior
An account is hard-deleted only when nothing outside the user's own data points at it; otherwise it becomes a Spirit (§4, decision #75). The `RESTRICT` rules on `users` below are what decide between the two.

| Reference | On delete |
|---|---|
| `sessions`, `accounts`, `playgroup_members`, `decks`, `notifications`, `guest_claims.user_id`, `guest_claim_votes.user_id` → users | CASCADE (the user's own data) |
| `game_players.user_id`, `games.created_by` / `logged_by` / `updated_by` / `locked_by`, `playgroups.creator_id`, `guest_players.claimed_by` → users | RESTRICT (the user becomes a Spirit instead) |
| `playgroups.archived_by`, `guest_players.created_by`, `guest_claims.reviewed_by` / `decided_by` → users | SET NULL (`archived_by` is first handed to the longest-standing remaining admin, else member) |
| `game_players.deck_id` → decks | SET NULL (`deck_id` only; the seat becomes generic and keeps its user and commander) |
| `game_players.game_id`, `notifications.game_id` → games | CASCADE |
| `games.playgroup_id` → playgroups | RESTRICT (the app first turns the group's games into anonymous games, decision #80) |
| `playgroup_members`, `guest_players` → playgroups | CASCADE |
| `guest_claims` → guest_players, `guest_claim_votes` and `notifications.guest_claim_id` → guest_claims | CASCADE |
| `game_players.guest_id` → guest_players | RESTRICT (a guest with games can't be deleted, only renamed or claimed) |
| `game_players.eliminated_by` → game_players | SET NULL (`eliminated_by` only) |
| `commanders`, `commander_pairs`, `decks`/`game_players` → commanders | RESTRICT (commanders are never deleted; the sync logs missing cards for review) |

On account deletion the app, in one transaction, hands over the user's group roles (§3.2, §4), deletes their own data (cascades above), and then either deletes the user row or, if a `RESTRICT` reference remains, anonymizes it as a Spirit.

Commander and partner are stored on `game_players` even when a deck is linked, so generic seats, Spirit seats (whose decks are deleted) and anonymous seats all use the same stats queries.

A future `game_events` table (life changes, commander damage, eliminations with timestamps) will support live mode.

---

## 6. Anti-spam for anonymous submissions
1. **Bot check**: Cloudflare Turnstile (or Vercel BotID) on the anonymous form.
2. **Rate limiting**: per IP hash, e.g. 5 submissions/hour and 20/day (Upstash Redis via the Vercel Marketplace).
3. **Validation**: commanders must exist in the `commanders` table, with legal pairings. 2–8 players, exactly one starter, exactly one winner or a draw, placement rules from §3.4, turn count between 1 and 50, no future dates, and no free-text fields.
4. **Duplicate detection**: identical submissions (same commanders, winner and date) from the same IP hash within 24 hours are **flagged** (step 5), not rejected, since a group can play the same matchup twice in one night.
5. **Flagging**: games that fail a soft check are stored with the reasons in `flag_reasons` (non-empty = flagged), and left out of global stats until a site admin reviews them. Approving sets `flag_approved_at` and keeps the reasons. Soft checks never reject. The checks are:
   - **Burst**: more than 3 submissions from one IP hash within 15 minutes.
   - **Early win**: a win on turn 1–3 that isn't a `combo` or `alt_win`.
   - **Same commander**: every seat plays the same commander.
   - **Short game**: a duration under 10 minutes with 4 or more players.
   - **Duplicate**: step 4.
6. **Privacy**: only a salted hash of the IP is stored, never the raw IP.

A minimal **site-admin** page (reserved to users with `site_role = 'admin'`) to review flagged games and delete spam, and to search and edit game notes when a deleted user asks for a note that calls out their handle to be removed (§4).

The site admin page shows each flagged game's reasons.

---

## 7. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Hosting | Vercel |
| Database | Postgres on Neon (via Vercel Marketplace) |
| ORM / migrations | Drizzle ORM + drizzle-kit |
| Auth | Better Auth (Google + magic link) |
| Email | Resend |
| UI | Custom Ravnica design system (§7.2): Tailwind CSS v4 tokens + Base UI headless primitives, mobile-first |
| Card data | Scryfall Oracle Cards and Default Cards bulk files, synced daily into `cards` and `printings`, with `commanders` derived from them (§7.1) |
| Scheduled jobs | Vercel Cron |
| Charts | Recharts, styled with the design system tokens |
| Anti-spam | Cloudflare Turnstile + Upstash rate limiting |
| Validation | Zod (shared between forms and server actions) |
| Tests | Vitest (logic, stats), Playwright (key flows) |

**Database roles:** two Postgres roles on Neon (decision #81). An **owner** role owns the schema and is used only by drizzle-kit migrations (`DATABASE_MIGRATION_URL`). An **app** role is used by the running app, cron jobs included (`DATABASE_URL`): it has `SELECT`, `INSERT`, `UPDATE` and `DELETE` on the tables and no DDL rights, and no `UPDATE` on `guest_claim_votes`, so votes are immutable without a trigger. `ALTER DEFAULT PRIVILEGES` on the owner role grants the app role access to tables created by later migrations, and migrations that need a narrower grant set it explicitly.

**Environment variables:** `DATABASE_URL` (app role), `DATABASE_MIGRATION_URL` (owner role, migrations only; not given to the running app), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `IP_HASH_SALT`, `PSEUDONYM_SECRET` (keyed hash for Ravnica pseudonyms, §4), `CRON_SECRET`. Site admins are users with `site_role = 'admin'`, set with `just make-site-admin <email>`.

### 7.1 Card data sync
- A daily **Vercel Cron** job (protected by `CRON_SECRET`) downloads Scryfall's full **Oracle Cards** bulk data file (one object per card, about 138 MB uncompressed) and upserts **every card** into `cards`, keeping the raw object in `raw` plus the columns we query.
- `commanders` is then derived from `cards` in the same job: cards that can be a commander (legendary creatures, cards that say they can be your commander, and Backgrounds), with their pairing type. Every legal pair is then derived into `commander_pairs` (§3.3).
- The file is **streamed and parsed incrementally** and written in batches, never loaded into memory at once, so the job fits serverless memory and time limits. If it doesn't fit in a Vercel Function, the fallback is a scheduled GitHub Action running the same script.
- The same job then streams Scryfall's **Default Cards** file (every English printing, tokens included, about 420 MB uncompressed) into `printings`, keeping only the columns listed in §5. This is what resolves a set code + collector number (Totally Lost GTC #54, Spirit TGTC #7, any profile picture) and the pseudonym art (§4). Oracle Cards alone can't, because it holds one printing per card.
- The two files are processed as separate steps (separate invocations if needed), so a failure in one doesn't block the other, and each step is idempotent (upserts, safe to re-run).
- At roughly 560 MB of downloads a day, the job should check each file's `updated_at` in Scryfall's bulk-data index and skip files that haven't changed since the last run.
- Autocomplete, deck creation, profile pictures, pseudonym art and anonymous validation read only from the local tables. **No Scryfall API calls happen during user requests.**
- **Only changed rows are written**: each row stores a hash of its source object, and the upsert skips rows whose hash hasn't changed. That avoids rewriting ~140k rows a day, which would otherwise churn storage and history on Neon.
- **Storage**: the estimate is roughly 100–200 MB for `cards` (with `raw`) plus `printings`. That is well under the Neon Free plan's 1 GB per project (raised from 0.5 GB in October 2026). Measure it after the first import in milestone 2. If `raw` turns out to be the bulk of it, drop it first.
- **Fallback if storage becomes a problem: lazy printings cache.** The daily job syncs only Oracle Cards (or only commanders). Any other printing (profile pictures, pseudonym art) is fetched from the Scryfall API the first time it's needed and saved in `printings`, so Scryfall is never called twice for the same card. Trade-offs: the first lookup of a printing is a live API call during a user request (rate-limited per user, and it needs a timeout and error message if Scryfall is down), and cached rows need a refresh rule (e.g. re-fetch rows older than 30 days in the background). The pseudonym art lists are small and fixed, so they can be pre-fetched at deploy time instead of on first view.
- Card images are linked from Scryfall's image servers, not re-hosted.
- The first sync runs as a script during setup (milestone 2).

### 7.2 UI: Ravnica design system
The app should feel like **Ravnica, the city that covers a whole world**: towering gothic architecture, layered districts, spires and bridges, rather than a stock component kit. The theme draws on the **city**, not on guild branding: no guild symbols, guild colours or watermarks. Game symbols (mana and set symbols) are used where they carry information (§7.2.1).

**Visual direction**
- **Architecture as framing**: pointed arches, buttresses, tracery and wrought-iron filigree as frame shapes for cards, panels and dialogs; a layered skyline silhouette of spires as the header and page background, deeper layers fading into haze.
- **Materials**: weathered stone and slate for surfaces, aged parchment for content areas (light theme), soot and night sky (dark theme), with brass, gilt and verdigris copper as accents.
- **Light**: lamplight and stained-glass glow as the highlight treatment (focus rings, active states, the winner of a game), over mostly muted, dusky surfaces.
- **Density**: the city is crowded and vertical; layouts can be rich and layered on desktop, but stay simple and fast on mobile (logging in under 60 seconds still rules, §9).
- **Colour identity** chips use the mana symbols (§7.2.1) with text labels; these are generic game symbols, not guild branding.
- **Card art** (commanders, profile pictures, pseudonyms) is the main source of colour, framed by the architecture.

**Building blocks**
- **Behaviour from headless primitives**: [Base UI](https://base-ui.com) (MUI team, stable, v1.6 at the time of writing, and shadcn/ui's default primitive library since July 2026) provides accessible, unstyled dialogs, popovers, comboboxes, menus, tabs, etc. We get focus management, keyboard support and ARIA for free and own 100% of the styling. Radix UI is the alternative; Base UI is preferred because it's the more actively developed of the two.
- **Look from our own tokens**: Tailwind CSS v4's CSS-first `@theme` defines the design tokens (colours, fonts, radii, shadows, textures, frame shapes) as CSS variables, so components, charts and plain CSS share one source. Light and dark themes; every pairing checked against WCAG AA contrast.
- **Components live in the repo** (`components/ui`), written in the same "copy into your codebase" style as shadcn/ui. The shadcn CLI can still scaffold a primitive's wiring as a starting point, but every component is restyled to the Ravnica tokens; no default shadcn theme is shipped.
- **Ornament as SVG**: arches, filigree and the skyline are original SVG assets (drawn for this app, not traced from WotC art), used as masks, borders and backgrounds so they scale and theme with the tokens.
- **Motion**: CSS transitions by default; the Motion library (motion.dev) only if a specific interaction needs it. Respect `prefers-reduced-motion`.
- **Fonts**: a carved-stone display face for headings and a readable text face, both open-licensed and loaded with `next/font`. Candidates from Google Fonts: **Cinzel** (inscriptional capitals) or **Cormorant** for display, paired with a clean serif or sans for body text and numbers. WotC's own card fonts (e.g. Beleren) are not freely licensed and must not be used.
- **Art**: card art only via Scryfall, credited per §3.1. No guild symbols; mana and set symbols per §7.2.1.
- A **style guide page** (dev only, e.g. `/dev/ui`) shows every token and component, so the theme can be reviewed in one place.

#### 7.2.1 Mana and set symbols
- **Mana symbols** (colour identity chips, commander details, outcome icons where useful) come from Scryfall's symbology: `GET https://api.scryfall.com/symbology` lists every symbol with an `svg_uri`.
  - A script (`pnpm symbols:sync`) downloads the SVGs into the repo (e.g. `public/symbols/mana/`) together with a small JSON manifest (symbol → file, English name). The files are **committed**, and the script is run when Scryfall adds symbols (new sets), not on every build. That keeps deploys independent of Scryfall being up. The build checks that every symbol the UI uses exists in the manifest.
  - Served as static files from our own domain, so no request to Scryfall at runtime.
  - Each symbol has an accessible name from the manifest (e.g. "Green") and is always paired with a text label in colour identity chips (§9).
  - Scryfall's docs don't state a licence for these SVGs. The symbols are WotC trademarks, used under the Fan Content Policy like the rest of the theme; credited in the footer with Scryfall.
- **Set symbols** (only if needed, e.g. in the profile picture picker): the **Keyrune** icon font by Andrew Gioia (npm `keyrune`, v3.19.0, released May 2026, actively maintained).
  - Licence: the **font files are SIL OFL 1.1** and its **CSS and SVG sources are GPL-3.0-only**. Both are compatible with the app's AGPL-3.0 licence (§7.3; GPL-3.0 §13 explicitly allows combining with AGPL-3.0 code), so Keyrune is used as published: installed from npm, its stylesheet imported, font self-hosted through the build. Its files keep their own licences, listed in the third-party notices.
  - New sets appear in Keyrune some time after release, so the UI falls back to the set code as text when a glyph is missing.

---

### 7.3 Licensing
The app's source code is licensed under **GNU AGPL-3.0-or-later** (SPDX `AGPL-3.0-or-later`): users may also follow any later AGPL version published by the FSF. Keyrune's GPL-3.0-only parts stay under GPL-3.0; combining them is still allowed, they just can't move to a later version with the rest of the code.

- **Public repository** with the full source. Secrets live only in environment variables (§7), never in the repo; `.env.example` lists the variable names with no values.
- **Source for network users (AGPL §13)**: the footer of the hosted app has a "Source code" link to the repository, pointing at the commit that is deployed (Vercel exposes the commit SHA at build time). Anyone who hosts a modified fork must offer their modified source the same way.
- **Licence files**: `LICENSE` (AGPL-3.0 text) at the root, and an SPDX header (`// SPDX-License-Identifier: AGPL-3.0-or-later`) in source files.
- **Dependencies**: AGPL-3.0 can include MIT, BSD, ISC, Apache-2.0, LGPL and GPL-3.0 code; OFL fonts are shipped alongside it. A **licence check in CI** fails the build on any dependency with an incompatible or unknown licence (e.g. GPL-2.0-only, proprietary or "no licence"), so a new package can't slip in unnoticed. The expected stack (Next.js, Drizzle, Better Auth, Base UI, Tailwind, Recharts, Zod, Motion) should be verified by that check, not assumed.
- **Third-party notices**: a generated `THIRD_PARTY_NOTICES` file (and a page linked from the footer) lists dependency licences, including Keyrune's OFL/GPL-3.0 parts and the fonts.
- **What the licence does not cover**: Magic: The Gathering names, symbols, card art, the Ravnica setting and the mana/set symbols are WotC property, used under the **Fan Content Policy**; Scryfall's data and images are used under **Scryfall's terms**. The AGPL grants no rights to any of them. The README states this, and that any fork must follow the Fan Content Policy too (free, non-commercial). The code licence lets others fork and even charge for the software, but the Magic content limits what a fork can actually do with it.
- **Contributions**: contributors sign off their commits with the **DCO** (Developer Certificate of Origin, `git commit -s`), checked in CI, confirming they have the right to submit their code under the project licence. No CLA, so the project can't later be relicensed without contributors' agreement, which is the intended effect of choosing AGPL.

---

## 8. Pages
- `/` — landing page, global dashboard preview, "Log an anonymous game"
- `/stats` — global dashboard, including the public player leaderboard
- `/submit` — anonymous game form
- `/login`
- `/onboarding` — choose display name and handle (first sign-in)
- `/privacy` — privacy policy
- `/me` — my profile, profile picture, account details (email, timezone), decks, stats, privacy and leaderboard settings, data export, delete account
- `/me/decks` — manage decks
- `/u/[handle]` — public profile (if public); Spirits have none
- `/groups` — my playgroups, create/join
- `/g/[id]` — playgroup overview (leaderboard, recent games)
- `/g/[id]/games/new` — log a game
- `/g/[id]/games/[gameId]` — game detail / edit, lock/unlock (admins)
- `/g/[id]/settings` — members, guests, claims, invite link, visibility, leaderboard threshold, archive/delete (admins)
- `/join/[code]` — accept an invite
- `/admin` — site admin: flagged anonymous games, notes search and edit
- `/dev/ui` — design system style guide (development only)

---

## 9. Non-functional
- Mobile-first. Logging a 4-player game should take **under 60 seconds** on a phone.
- The global dashboard (including the player leaderboard) is cached and revalidated periodically (e.g. every 10 minutes) rather than computed on every request.
- Respect Scryfall's usage guidelines: use bulk data instead of per-request API calls (no exceptions), send a descriptive User-Agent, credit the artist wherever an art crop is shown, and credit Scryfall and Wizards of the Coast (Fan Content Policy) in the footer, next to the "Source code" and licence links (§7.3). The Ravnica theme, character and location names fall under the same Fan Content Policy: the app must stay free and non-commercial.
- Game dates are stored as plain dates (no timezone). Other timestamps are stored in UTC and shown in the viewer's timezone.
- Authorization is checked on the server for every mutation (playgroup membership, role, and game lock).
- Accessibility: keyboard-navigable forms, enough contrast, colour identity shown with labels and not colour alone, and pseudonyms marked by more than colour (§4).

---

## 10. Decisions log
| # | Topic | Decision |
|---|---|---|
| 1 | Draws | A game has either one winner or "Draw / no winner". Draws count as games played, not wins. |
| 2 | Format | Free-for-all only in v1. Teams are deferred. |
| 3 | Pod size | 2–8 players. Stats can be filtered by pod size. |
| 4 | Account deletion | *Superseded by #18.* |
| 5 | Bracket | Optional on both decks and games. The game's bracket is pre-filled from the decks, and the global dashboard uses the game's bracket. |
| 6 | Anonymous notes | Not allowed. Anonymous submissions store no free text. |
| 7 | Bracket pre-fill | Uses the highest bracket among the seats' decks, generic decks included. |
| 8 | Empty playgroup | Deleted when its last member leaves or deletes their account. |
| 9 | Guest claim conflicts | *Superseded by #15.* |
| 10 | Win condition / eliminations | A fixed list of outcome methods, no free text. |
| 11 | Anonymous duplicates | Flagged for review, not rejected. |
| 12 | Card data | Scryfall bulk data (Oracle Cards + Default Cards) synced daily. No Scryfall API calls during user requests. |
| 13 | Decks | Name and link both optional; several named/linked decks per commander allowed. A deck with neither is the player's unique generic deck for that commander and collects every seat logged without a deck. Logging suggests the player's non-archived named/linked decks for the chosen commander, never auto-picks. |
| 14 | Locked games | Admins can lock/unlock a game. Locked games can't be edited or deleted by non-admins, creator included. |
| 15 | Guest claims | Only allowed if the claimant has no game recorded in the playgroup. Checked on request and on approval. |
| 16 | Profile picture | Any Scryfall printing (set code + collector number), resolved from the local `printings` table, art crop with artist credit. Default: Totally Lost (GTC #54). |
| 17 | Game date | Date only, no time. Same-day games ordered by logging time. |
| 18 | Account deletion | User row kept and anonymized as "Spirit" with the Spirit token TGTC #7 as picture; personal data, auth accounts, memberships and decks removed; seats kept. Spirits are left out of leaderboards and head-to-head. GDPR basis in §4.1. |
| 19 | Public leaderboard | Separate opt-in, requires a public profile, minimum 20 games for win rate ranking. |
| 20 | Private names | Ravnica character / location pseudonyms, visually distinct and not clickable, stable within one public page context only. Private players show the character's card art as their picture. |
| 21 | UI | Custom design system themed on Ravnica as a gothic city (no guild symbols), on Tailwind v4 tokens + Base UI primitives, not stock shadcn/ui. |
| 22 | Data model | Reviewed table by table in US-01 (2026-11-24); `data-model.dbml` holds the full definition. See decisions #74–#80. |
| 23 | Who logs games | A member can only log playgroup games they play in. |
| 24 | Card sync | The whole Oracle Cards file is stored in `cards`; `commanders` is derived from it. Default Cards is stored in `printings`. |
| 25 | Private playgroup picture | The card art of its Ravnica location pseudonym. |
| 26 | Creator's seat | Every playgroup game always includes its creator; the seat can't be removed, even by admins. |
| 27 | Card storage fallback | If storage becomes a problem, switch `printings` to a lazy cache: fetched from Scryfall on first use and stored, never fetched twice. |
| 28 | Mana symbols | Scryfall symbology SVGs, downloaded by a script, committed and served statically. |
| 29 | Set symbols | Keyrune, used as published (OFL font, GPL-3.0 CSS/SVG, both compatible with AGPL-3.0); set code as text fallback. |
| 30 | Licence | App source under AGPL-3.0-or-later, public repo, "Source code" link to the deployed commit, CI licence check, DCO sign-off. |
| 31 | Handles | 8–20 characters: letters, digits, `.`, `_`, `-`. Unique regardless of case. |
| 32 | Handle reuse | A handle that is given up can be taken by anyone. |
| 33 | Timezone | Detected from the browser, editable in account details. |
| 34 | Last admin leaves | The longest-standing remaining member is promoted automatically. |
| 35 | Demoting admins | Only the creator (while a member) can demote admins; the creator can't be demoted. Once the creator is gone, any admin can demote any other. |
| 36 | Commander pair order | Alphabetical for symmetric partners; creature before Background; Doctor before companion. |
| 37 | Anonymous players | Shown as "Player 1" … "Player N"; eliminations reference seats. |
| 38 | Deleting / archiving groups | Delete only with no games or no members. Otherwise admins archive: no new games, members or guests. |
| 39 | Placements | Standard competition ranking: simultaneous eliminations share a place and the next place is skipped. |
| 40 | Same commander twice | Allowed in one game. |
| 41 | Editing old games | Creator and admins can keep or swap former members and archived decks, with a warning. Admins can turn a former member's seats into a guest. |
| 42 | Guest claims | Pending claims count towards the one-per-group limit. Rejected or unreviewed claims can be made public; a majority of members decides; a public rejection is final for that guest. |
| 43 | Sample sizes | Every average and rate shows its count. Unfilled optional fields are excluded. |
| 44 | Playgroup leaderboard threshold | Set by admins, minimum 5. |
| 45 | Invite codes | No expiry; valid until regenerated or disabled. |
| 46 | Former members | Kept as membership rows with `left_at`. |
| 47 | Private groups via public profiles | Members are redirected to their own view of the group. |
| 48 | Public head-to-head | Only against public players. |
| 49 | Notes | Members only, even in public groups. |
| 50 | Active commanders | At least one counted game. |
| 51 | Data export | Every game the user played in; private players anonymised. |
| 52 | Notes removal | Site-admin tool; only for notes that directly call out the deleted user's handle. |
| 53 | Launch | The app goes public after the last milestone. |
| 54 | Email change | Allowed, after verifying the new address. |
| 55 | Deck edits | Commanders never change. Name and link can change; a name can't be removed; a named or linked deck never becomes generic. Decks are archived, not deleted. |
| 56 | Generic → named deck | Allowed when the player has no named or linked deck for that commander; every generic seat moves to the new deck. |
| 57 | Soft checks | Burst, early win, same commander, short game (plus duplicates). The admin sees the reasons. |
| 58 | Commander pairs | Precomputed from card data into `commander_pairs`, canonical order. Other pairing types to discuss. |
| 59 | Public claims | One month before going public, one more month of voting, majority of members except the claimant. The creator can override. |
| 60 | Notifications | In-app only. |
| 61 | Creator role | One transferable creator per group; must hand over before leaving; can't be demoted or removed; only they demote admins. Supersedes the second half of #35. |
| 62 | Archiving | Disables invites and rejects pending claims. Only the creator unarchives (or the last admin/member if there's no creator). |
| 63 | Former member → guest | The admin names the guest. Allowed for Spirits. |
| 64 | Game creator leaves | `created_by` becomes the playgroup creator; the creator-seat rule then no longer applies to that game. Refines #26. |
| 65 | Notes removal | Only for notes in games created or modified before the account was deleted. |
| 66 | Leaderboard threshold default | 5. |
| 67 | Guests in exports | Not anonymised. |
| 68 | Pairing types | Partner, Partner with, every Partner—[text] variant (matching text only), Choose a Background, Doctor's companion. New Partner—[text] variants are picked up from card text. Completes #58. |
| 69 | Notifications | Header badge opening a Notifications section of `/me`. |
| 70 | Creator succession on deletion | The longest-standing admin becomes creator. |
| 71 | Logged by | `logged_by` never changes. It shows the logger's name, former members included; deleted accounts show "Spirit". |
| 72 | Milestone 0 | Repository, agent instructions (AGENTS.md, CLAUDE.md, skills, subagents), CI/CD and a `justfile` come before any app code. |
| 73 | Agent skills | Third-party skills are reviewed and pinned in a committed manifest, never committed themselves: `just setup` installs them; the SQL style guide (`diagmatrix/sql-style-guide`) applies to all hand-written SQL and to the data model's names. |
| 74 | Site admins and bans | Better Auth's admin plugin: `users.site_role` (`user`/`admin`, one role only). Bans are "Later" (§1). Its remove-user, impersonate and set-password permissions are disabled. Admins are made with a `just` recipe, not an env var. |
| 75 | Hard delete | An account that nothing else references is hard-deleted; otherwise it becomes a Spirit. |
| 76 | Playgroup founder | No separate founder column: `creator_id` is the current, transferable creator. |
| 77 | Archived by | On account deletion, `archived_by` passes to the longest-standing remaining admin, else member; null only if no members remain (FK `ON DELETE SET NULL` as a backstop). |
| 78 | Rejoining | `joined_at` is reset on rejoin, so a returning member counts as the newest for every "longest-standing" rule; they come back as an ordinary member. |
| 79 | No database triggers | The schema holds keys, foreign keys, unique indexes and named CHECKs only. Rules that span rows or tables are enforced by the app, in one transaction that locks the parent row, and covered by integration tests. |
| 80 | Deleted playgroups | When a group with games is deleted (no members left), its games become anonymous games and go through the soft checks; they're never deleted with the group. |
| 81 | Database roles | An owner role runs migrations; the app runs as a role with DML only and no `UPDATE` on `guest_claim_votes`. |

### 10.1 Open questions
None right now.

---

## 11. Milestones
0. **Repository & agent setup**: public GitHub repo with a protected `main`, `LICENSE` and README (§7.3), contribution files, `justfile` for every task, CI (lint, typecheck, tests, licence check, DCO), dependency updates, `AGENTS.md` and `CLAUDE.md`, Claude Code settings, subagents, our own skills, and vetted third-party skills (SQL style guide, Better Auth, Neon, React, Playwright) installed by `just setup` from a pinned manifest rather than committed, the backlog as GitHub issues, and Vercel and Neon connected to the repo. No app code.
1. **Setup**: data model review (§5), Next.js, Neon, Drizzle schema (including delete rules and game checks), Better Auth with account linking, onboarding, design tokens and base components (§7.2), deployed to Vercel.
2. **Decks & Scryfall**: daily Oracle Cards and Default Cards sync into `cards`, `printings` and `commanders`, first import, commander autocomplete with pairing rules, deck CRUD (including generic decks), profile picture picker.
3. **Playgroups**: create, invite, join, roles, guests.
4. **Game logging**: form with deck suggestions and generic decks, edit/delete, game locking, game detail.
5. **Stats**: player, deck and playgroup pages.
6. **Privacy**: public profiles and groups, Ravnica pseudonyms with character and location art.
7. **Global**: anonymous submission, anti-spam, global dashboard, public player leaderboard, site admin.
8. **Polish**: guest claiming (with eligibility check), privacy policy and legitimate interest assessment (§4.1), data export, account deletion (Spirits), tests, performance, theme polish.

The app goes **public after milestone 8** (decision #53). Earlier milestones can be used privately for testing.
