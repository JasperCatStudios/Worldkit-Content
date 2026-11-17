# Worldkit regex scripts

Regex scripts that dress the blocks Worldkit's trackers write under each reply, and keep them out of old prompts. They are one file per script, in one folder per tracker, so you import only what you want. The quickest way is Worldkit's **Content Kit** tab, which lists them in groups with an **Import all** button per group; or import files by hand in SillyTavern (Extensions, Regex, the import arrow) and keep them enabled. Importing a script that is already there (same id) updates it instead of adding a copy.

Every script here is named `Worldkit - ...`. They are display-only (Markdown only, AI output) unless they are a context saver.

## The default look, by tracker

This is the look chosen by **Default - Freaky Frankenstein** in a tracker's Look menu: Worldkit leaves the styling to the regexes you have imported. If you have not imported any, the blocks show as plain lines.

| Folder | Scripts | What they do |
| --- | --- | --- |
| `bonds/` | Bond Bars (Positive), Bond Bars (Negative), Bond Tracker Context Saver | Bars for Affection, Trust, Respect and the optional Desire, red when affection is negative |
| `vitals/` | Vitals Bars, Vitals Context Saver | Health, hunger, energy and mood bars |
| `inventory/` | Inventory Frame (Menu Gold), Inventory Person, Inventory Item, Inventory Context Saver | The panel, a header with money and item count per person, and a row per item |
| `internal-states/` | Frame, four section menus, Collapse Spacing, Context Saver | The dark panel around Internal States, the coloured section menus (teal agendas and locations, mauve Chekhov and thoughts, peach notebook, world sim and physics, pink body scale), and a tidy-up of the gaps between sections |

The lines they match, for reference:

    - <b>Kaito</b> → <b>Mira</b> | AFFECTION: +34 | TRUST: 20 | RESPECT: 15 | DESIRE: 40 | LEVEL: Friend
    - <b>Ana</b> | HEALTH: 55 | HUNGER: 20 | MOOD: Anxious | MOODLEVEL: 60 | ENERGY: 70 | NOTE: health -25
    - <b>Ana</b> | MONEY: 230 | UNIT: Gold | ITEMS: 2 | NOTE: +30 Gold, +Healing Potion
    - ITEM: Iron Sword | QTY: 1 | KIND: Weapon | NOTE: Chipped near the hilt

`DESIRE` is optional and its bar hides when it is missing. `MONEY` is `--` when money tracking is off. A vital that is switched off shows `--` and an empty bar.

The `Worldkit - Menu Gold (Inventory)` frame is the owner's own script. The older `Worldkit - Inventory Owner` script (a `CARRY` and `GOLD` header) no longer matches the Inventory block; `Inventory Person` replaces it, so delete the old one.

## Context savers

A context saver removes a block from older messages in the prompt that goes to the story model (prompt only, depth 2 and older), so the block does not cost tokens every turn. There is one for each tracker: Bonds, Vitals, Inventory and Internal States. They are adapted, with permission, from the context saver of the Freaky Frankenstein preset, and each does the same job for its own tracker.

They only matter when that tracker's block is written **inside the reply** (Bonds set to "With the reply", Internal States set to write in the reply, or a preset that asks for the block). When a tracker writes its block after the reply, the block is kept on the message's metadata and never in its text, so it never reaches the prompt and its saver does nothing. They are harmless to leave on.

The Freaky Frankenstein menu scripts (`FF5 UI - ...`) are that preset's own and are not in this repository. The `internal-states/` scripts here are Worldkit's own dark menus and need no FF5 script.

## Looks (`themes/`)

Three complete looks for the Bond, Vitals and Inventory blocks, and for Internal States: **Cozy Parchment**, **Persona HUD** and **Tactical Glass Telemetry**. Each has its own folder:

- `themes/<look>/Worldkit-<Tracker>-<Look>-*.json` regex scripts. Import every file in the look's folder and keep them enabled. Each tracker has a *Frame* script that turns the block's `<details>` into the card, and line scripts that turn each line into a row (Bonds has a Positive and a Negative one; Inventory has Person and Item). Use one look at a time, and do not run it together with the default scripts above.
- `themes/<look>/Worldkit-Internal-States-<look>-template.html` the Internal States template for that look. It is inline-styled HTML, so it needs no regex: paste it over the template part of the Internal States instructions (Prompts, Tracker prompts). Every entry (each NPC under Agendas, Locations and Internal Thoughts, each character under Body Scale) is its own line ending in `<br>`, repeating the example line once per entry.

You do not have to import anything to use these: in the extension, the **Look** choice at the top of the Internal States, Bonds, Vitals and Inventory menus applies the same looks itself, and picking one picks it for all four so they match. The files are for people who prefer regexes, or use the blocks outside the extension. They are generated from the extension's own definitions (`tools/export-theme-regexes.mjs` in the extension), so the two cannot drift apart.

The looks use the Anton, Crimson Pro, Inter and JetBrains Mono fonts from Google Fonts and fall back to system fonts without them. The Bonds looks keep Worldkit's own bond lines (Affection, Trust, Respect, Desire, Level); only the visual style was taken from the mock-ups.
