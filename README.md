# Worldkit sample content

Optional sample content for the [Worldkit extension](https://github.com/JasperCatStudios/SillyNPC): a sample world, a lorebook, character packs and artwork, so you can try combat without making anything first. The extension works without any of this and does not download it. Nothing here is built in: you import it yourself, the same way you would import something a friend sent you. The franchise packs carry no portraits, no personal characters and no lorebook entries.

**Getting it:** press the green **Code** button on this page and choose **Download ZIP**, then unzip it anywhere (not inside SillyTavern's extensions folder). Import the files you want from there, as described below.

```
Worldkit-Content/
  worlds/        a world type (the rules of a fight)
  lorebooks/     a SillyTavern lorebook for the sample world
  characters/    character packs, each with combat sheets filled in
  regex/         SillyTavern regex scripts that dress the bond and vitals blocks under replies
  art/           optional Fire Emblem artwork: house banners, weapon icons and crest icons
```

## 1. The sample world: Lantern Coast Skirmishes

A harbour-town world, made with the **Create a world type** editor (Combat tab, Settings, World types) and then exported. It shows what a custom world looks like: seven stats on 0 to 100, a Physical and a Spirit damage channel, three skills graded Novice to Master (Blades, Charms, Tactics), six abilities, a Health / Wind / Resolve set of pools, and a straight-line stat bonus.

| File | What it is |
| --- | --- |
| `worlds/lantern-coast.world.json` | the world type |
| `lorebooks/Lantern_Coast.lorebook.json` | a lorebook: one entry for the world and one for each of the five people, written in the "Attributes {...}" format the lore importer reads |
| `characters/lantern-coast.characters.json` | five invented people: Marlow Reed, Sable Quill, Tobias Fenn, Ilsa Thorne and Corvin Ashby |

**To use it**

1. Combat tab, Settings, World types: **Import a world type file**, and pick `lantern-coast.world.json`. Then choose *Lantern Coast Skirmishes* under **World type**.
2. In SillyTavern, open World Info and **Import World Info** with `Lantern_Coast.lorebook.json`.
3. Open the Worldkit menu, Characters: **Import characters** and pick `lantern-coast.characters.json`. Their combat sheets come with them. Link each to its lorebook entry by name if you want their profile text in the story.
4. Open Combat, pick two of them, and fight.

## 2. Franchise cast packs

Combat sheets for a cast from each of the built-in worlds. Import the pack, then pick the matching world type in the Combat tab.

| File | World type | Who |
| --- | --- | --- |
| `characters/fire-emblem-three-houses.characters.json` | Fire Emblem | 47 characters across the Houses, the Church, the Ashen Wolves and the Enemy |
| `characters/bleach-arrancar-arc.characters.json` | Bleach | 15 characters (Soul Society, Vizards, Karakura, Espada) as they stand in the Arrancar arc |
| `characters/black-clover.characters.json` | Black Clover | 10 Magic Knights, with grimoires and the elemental wheel set |

Things to know:

- The numbers are one fan's reading of the canon, not official stats. Change anything in the Combat tab roster.
- The Bleach sheets are converted from nine-stat tables to the eight stats of the Bleach world type (for example Reiatsu is the average of Magic and Resistance). Treat them as a starting point.
- A pack carries sheets and gear only. There are no portraits and no lore, so add your own.

## 3. Regex scripts

`regex/` holds every regex the extension uses to dress its blocks under a reply: the Bond Tracker's bars (positive and negative affection), the bond context saver, and the Vitals bars (health, hunger and mood). In SillyTavern open Extensions, Regex, press the import arrow and pick the files. `regex/README.md` says what each one matches.

## 4. Artwork (optional)

`art/fire-emblem/` has `banners/` (Ashen Wolves, Black Eagles, Blue Lions, Golden Deer, Knights of Seiros and a neutral one), `weapon-icons/` (axe, sword, lance, bow and the other class icons) and `crests/`. They are presentation only: nothing depends on them, and a world that has none falls back to plain built-in icons. Use them as the faction banners and weapon or crest icons for the Fire Emblem world, or swap in your own.

**Installing the art:** copy the whole `art` folder into your SillyTavern data as `data/<your user>/user/images/worldkit-art/` (so the banners end up at `data/<your user>/user/images/worldkit-art/fire-emblem/banners/`). SillyTavern only serves `/user/images/` and `/user/files/` from a user's folder, so that exact place is what lets the extension show the pictures. If you use another folder, set its web path under Appearance, Faction colours and artwork. Turn "Use world artwork" off there to go back to built-in icons.

These images are fan material from the Fire Emblem games, not original to this project, so check that you are comfortable redistributing them before sharing the pack.

## Sharing your own

- **A world:** Combat, Settings, World types, **Export** on a custom world gives a `.json` file anyone can import with **Import a world type file**.
- **Characters:** the character export now includes combat sheets. Importing a file from somebody else adds the people next to yours; names already in use are renamed unless you choose otherwise.
