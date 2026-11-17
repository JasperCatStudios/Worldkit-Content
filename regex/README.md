# SillyNPC Bond Tracker regex

Import both files in SillyTavern: Extensions -> Regex -> Import (the arrow icon). Keep them enabled.

They dress the Bond Tracker block the same way your Internal States regexes dress theirs. The block is a
`<details>` whose summary says `BOND TRACKER`; your existing **FF5 UI - Menu Teal** regex already styles that
summary (it lists BOND TRACKER). Each line inside it looks like:

    - <b>Kaito</b> → <b>Mira</b> | AFFECTION: +34 | TRUST: 20 | RESPECT: 15 | LEVEL: Friend

and, while that character's romance is switched on, with a desire field before the level:

    - <b>Kaito</b> → <b>Mira</b> | AFFECTION: +34 | TRUST: 20 | RESPECT: 15 | DESIRE: 40 | LEVEL: Friend · Courting

- `SillyNPC-Bond-Bars-Positive.json` matches lines where AFFECTION is zero or positive.
- `SillyNPC-Bond-Bars-Negative.json` matches lines where AFFECTION starts with `-` (red bar).
- Trust and Respect show their sign in the label; the bar length is the size of the number (0-100).
- DESIRE is optional: when present a small pink bar is added under Respect; lines without it (older
  replies, or romance off) render exactly as before. Re-import both files to get the desire bar.
- Both run as markdown-only display regexes (placement: AI output), so they never touch the prompt.

The block is written under each reply by the Bond Tracker (Bonds tab). With the timing "With the reply" the
story model writes the same block inside its reply, in the same format; the Bond Tracker checks the numbers
against the growth rules and rewrites the block with the real values (and the change in brackets), so these
regexes dress it the same way.

## Context saver (only for "With the reply")

`SillyNPC-Bond-Tracker-Context-Saver.json` removes the BOND TRACKER block from older messages in the prompt that goes
to the story model (prompt only, depth 2 and older, like your Internal States context saver), so the block does not
cost tokens every turn. Import it the same way. It is not needed for the other timings: there the block is not in the
message text.

## Vitals (`Worldkit-Vitals-Bars.json`)

Dresses the **VITALS** block the Vitals Tracker writes under each reply, right below the Bond Tracker's block. Import it the same way (Extensions -> Regex -> Import) and keep it enabled. Each line looks like:

    - <b>Ana</b> | HEALTH: 55 | HUNGER: 20 | MOOD: Anxious | MOODLEVEL: 60 | NOTE: health -25

Health and hunger run 0 to 100 (0 is dead or starving, 100 is healthy or full); mood is a word and a 0 to 100 strength. A vital that is switched off in the Vitals tab shows `--` and an empty bar. Like the bond regexes it is a display-only AI-output regex, so it never touches the prompt.

## All the default scripts in one file (`Worldkit-Default-Regexes.json`)

The Bond Bars (positive and negative), the Bond Tracker Context Saver, the Vitals Bars, the Inventory frame and the two Inventory rows, in one file for the **Default - Freaky Frankenstein** look (the look that leaves the styling to your SillyTavern regexes). The Content Kit tab in Worldkit imports it in one press; or import it from SillyTavern's Regex menu. Scripts that are already there (same id) are updated, never duplicated.

It deliberately holds no Freaky Frankenstein scripts (the `FF5 ...` ones that style the Internal States menus): those belong to that preset, so import them from the preset itself.

If an earlier set of yours has `Worldkit - Inventory Owner` (the old `CARRY` and `GOLD` header), it no longer matches the current Inventory block. `Worldkit - Inventory Person` replaces it, so you can delete the old one.

## Context saver scripts

A context saver removes a block from older messages in the prompt that goes to the story model, so it does not cost tokens every turn. Worldkit has one: `SillyNPC-Bond-Tracker-Context-Saver.json`, and it is only needed when Bonds is set to **With the reply** (the story model writes the Bond Tracker block inside its own message). Every other block (Vitals, Inventory, Bonds after the reply, Internal States written after the reply) is kept on the message's metadata and never in its text, so it never reaches the prompt and needs no saver. The `FF5 - Context Saver` and `FF5 - GFX Stripper` scripts are Freaky Frankenstein's and apply when its preset writes Internal States inside the reply.

## Inventory (`Worldkit-Inventory-Person.json`, `Worldkit-Inventory-Item.json`)

Dress the **INVENTORY** block the Inventory Tracker writes under each reply (default dark look). Import both and keep them enabled. The block has one line per person followed by one line per item they carry:

    - <b>Ana</b> | MONEY: 230 | UNIT: Gold | ITEMS: 2 | NOTE: +30 Gold, +Healing Potion
    - ITEM: Iron Sword | QTY: 1 | KIND: Weapon | NOTE: Chipped near the hilt
    - ITEM: Healing Potion | QTY: 3 | KIND: Consumable | NOTE: +35 HP

`MONEY` is `--` when money tracking is off; `UNIT` is whatever the currency is called in the Inventory tab. Display-only, like the others.

## Looks (`themes/`)

Three complete looks for the Bond, Vitals and Inventory blocks, and for Internal States: **Cozy Parchment**, **Persona HUD** and **Tactical Glass Telemetry**. Each has its own folder:

- `themes/<look>/Worldkit-<Tracker>-<Look>-*.json` regex scripts. Import every file in the look's folder and keep them enabled. Each tracker has a *Frame* script that turns the block's `<details>` into the card, and line scripts that turn each line into a row (Bonds has a Positive and a Negative one, like the default bars; Inventory has Person and Item). Use one look at a time, and do not run it together with the default Bond or Vitals bars above.
- `themes/<look>/Worldkit-Internal-States-<look>-template.html` the Internal States template for that look. It is inline-styled HTML, so it needs no regex: paste it over the template part of the Internal States instructions (Prompts, Tracker prompts) or a preset. Every entry (each NPC under Agendas, Locations and Internal Thoughts, each character under Body Scale) is its own line ending in `<br>`, repeating the example line once per entry.

You do not have to import anything to use these: in the extension, the **Look** choice at the top of the Internal States, Bonds, Vitals and Inventory menus applies the same looks itself, and picking one picks it for all four so they match. The files here are for people who prefer regexes, or use the blocks outside the extension. They are generated from the extension's own definitions (`tools/export-theme-regexes.mjs`), so the two cannot drift apart.

The looks use the Anton, Crimson Pro, Inter and JetBrains Mono fonts from Google Fonts and fall back to system fonts without them. The Bonds looks keep Worldkit's own bond lines (Affection, Trust, Respect, Desire, Level); only the visual style was taken from the mock-ups.
