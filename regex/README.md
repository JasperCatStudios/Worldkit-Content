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
