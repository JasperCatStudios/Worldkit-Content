# Worldkit sample content

Optional sample content for the [Worldkit extension](https://github.com/JasperCatStudios/WorldKit): a sample world, a lorebook, character packs and artwork, so you can try combat without making anything first. The extension works without any of this and does not download it. Nothing here is built in: you import it yourself, the same way you would import something a friend sent you. The franchise packs carry no portraits, no personal characters and no lorebook entries.

**Getting it, the easy way:** in SillyTavern open the Worldkit menu, then **Content Kit** in the side list. The address of this repository is already filled in. Press **Download**, and SillyTavern fetches it with git the same way Extensions, Install extension does. The tab then lists everything in `catalog.json` with an **Import** button on each (worlds, character packs, the lorebook, regex scripts) or a **Copy** button (workflows and Internal States templates). Press **Update** later to get new content. Nothing is imported until you press its button, and nothing is deleted. This repository carries a `manifest.json` that loads no code, because SillyTavern's installer needs one; it shows in the extension list and does nothing there.

**Getting it by hand:** press the green **Code** button on this page and choose **Download ZIP**, then unzip it anywhere (not inside SillyTavern's extensions folder). Import the files you want from there, as described below.

**For the repository's owner:** after adding or renaming a file, run `node tools/build-catalog.mjs` and commit `catalog.json` with the change.

```
Worldkit-Content/
  worlds/        a world type (the rules of a fight)
  lorebooks/     a SillyTavern lorebook for the sample world
  characters/    character packs, each with combat sheets filled in
  items/         item databases for the Inventory tab (items and presets); import from the Content Kit under Item databases
  regex/         SillyTavern regex scripts that dress the bond, vitals and inventory blocks under replies, plus three looks (parchment, persona, tactical)
  art/           optional Fire Emblem artwork: house banners, weapon icons and crest icons
  workflows/     ComfyUI workflows for the Phone's pictures: selfie workflows and a general one
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

`regex/` holds every regex the extension uses to dress its blocks under a reply: the Bond Tracker's bars (positive and negative affection), the bond context saver, the Vitals bars (health, hunger and mood), the Inventory rows, and `themes/` with three full looks (Cozy Parchment, Persona HUD, Tactical Glass Telemetry) for Bonds, Vitals, Inventory and Internal States. In SillyTavern open Extensions, Regex, press the import arrow and pick the files. `regex/README.md` says what each one matches.

## 4. Artwork (optional)

`art/fire-emblem/` has `banners/` (Ashen Wolves, Black Eagles, Blue Lions, Golden Deer, Knights of Seiros and a neutral one), `weapon-icons/` (axe, sword, lance, bow and the other class icons) and `crests/`. They are presentation only: nothing depends on them, and a world that has none falls back to plain built-in icons. Use them as the faction banners and weapon or crest icons for the Fire Emblem world, or swap in your own.

**Installing the art:** copy the whole `art` folder into your SillyTavern data as `data/<your user>/user/images/worldkit-art/` (so the banners end up at `data/<your user>/user/images/worldkit-art/fire-emblem/banners/`). SillyTavern only serves `/user/images/` and `/user/files/` from a user's folder, so that exact place is what lets the extension show the pictures. If you use another folder, set its web path under Appearance, Faction colours and artwork. Turn "Use world artwork" off there to go back to built-in icons.

These images are fan material from the Fire Emblem games, not original to this project, so check that you are comfortable redistributing them before sharing the pack.

## 5. ComfyUI workflows for the Phone (optional)

Two workflows for the Phone's picture settings, already set up with the placeholders the Phone fills in. They are for [ComfyUI](https://github.com/comfyanonymous/ComfyUI) and need the ComfyUI node pack **Pixaroma** and the model files named in the notes inside each workflow.

| File | What it is for | Placeholders |
| --- | --- | --- |
| `workflows/selfie-character-sheet.workflow.json` | A picture **of** the contact. An image-edit model (FLUX 3 Klein) takes their character sheet and your prompt and draws the selfie from it. | `%image%` (the character sheet), `%prompt%`, `%seed%` |
| `workflows/selfie-character-sheet-uncensored-minimax-h3.workflow.json` | The same job as the selfie workflow above, on **MiniMax H3 Image**, for people who find the FLUX one too restrictive (in the author's use it would not make a swimsuit photo). Use one selfie workflow at a time. | `%image%` (the character sheet), `%prompt%`, `%seed%` |
| `workflows/general-text-to-image-moss.workflow.json` | Drawings, places and things, with no character in them. You give a short idea, a prompt helper (Qwen 3.5) writes the long prompt, and MOSS-Image draws it. | `%prompt%` (the idea), `%seed%`, `%width%`, `%height%` |

**To use them:** in the Phone settings, under ComfyUI, press **Load a workflow file** for the slot you want (**Selfie workflow** or **Your own workflow**) and pick the file. It is kept in SillyTavern's own workflow folder, `data/<your user>/user/workflows/`, so you can pick it again from the drop-down, and your phone sees it too. Give each contact a character sheet in their Gallery page for the selfie workflow.

Things to know:

- Ask for a **selfie** when you want the character in the picture; anything else uses the general workflow.
- The model file names are the ones on the author's computer. The Phone corrects a name when the same file sits in a different folder on yours; a file you do not have still has to be downloaded.
- Any other workflow saved with **Save (API Format)** works too: the Phone finds the prompt, the picture and the seed and adds the placeholders itself.
- The MiniMax H3 selfie workflow needs **ComfyUI 0.45.0 or newer** (the node it uses, *MiniMax H3 Image Conditioning*, is not in older versions) and three model files: `minimax_h3_image_pruned_int8_convrot.safetensors` (about 19.5 GB, in `models/diffusion_models/h3`), `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors` (about 14.6 GB, in `models/text_encoders`) and `minimax_h3_image_vae_fp16.safetensors` (about 1 GB, in `models/vae`). The model has its own licence, the MiniMax-H3-Image Community License; read it, as some countries need permission first. The node's name was restored from ComfyUI's source because the file was exported from a ComfyUI that did not have it yet, so open the workflow once after updating and check no node is red.
- That workflow's result size comes from its **Number Pick** node in megapixels (16 is the author's default, about 4096 pixels on a side; 4 and 8 are faster), not from the Phone's picture size. The Phone's **Selfie shape** setting still sets the shape.
- These are built on example workflows by Pixaroma and use their nodes and notes, so check their terms before sharing the files further.

## Sharing your own

- **A world:** Combat, Settings, World types, **Export** on a custom world gives a `.json` file anyone can import with **Import a world type file**.
- **Characters:** the character export now includes combat sheets. Importing a file from somebody else adds the people next to yours; names already in use are renamed unless you choose otherwise.
