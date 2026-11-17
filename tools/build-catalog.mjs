/**
 * Writes catalog.json: the list of everything importable in this repository, which the Worldkit extension's Content Kit
 * screen reads after it has fetched the repository with git.
 *
 *   node tools/build-catalog.mjs
 *
 * Run it after adding or renaming a file, then commit catalog.json with the change. Art is listed for information only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const items = [];
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
const list = (dir, test) => (fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)).filter(test).sort() : []);
const titleCase = (s) => s.replace(/[-_.]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();

// Worlds
for (const f of list('worlds', n => n.endsWith('.world.json'))) {
    let name = titleCase(f.replace('.world.json', ''));
    let description = '';
    try {
        const data = json(`worlds/${f}`);
        const first = Array.isArray(data.types) ? data.types[0] : (data.type || data);
        if (first?.name) name = first.name;
        if (first?.description) description = String(first.description);
    } catch { /* keep the file name */ }
    items.push({ type: 'world', name, file: `worlds/${f}`, description: description || 'A world type: the rules of a fight.' });
}

// Character packs
for (const f of list('characters', n => n.endsWith('.characters.json'))) {
    let count = 0;
    try { count = json(`characters/${f}`).characters.length; } catch { /* unreadable */ }
    items.push({ type: 'characters', name: titleCase(f.replace('.characters.json', '')), file: `characters/${f}`, description: count ? `${count} characters with combat sheets filled in. No portraits or lore.` : '' });
}

// Lorebooks
for (const f of list('lorebooks', n => n.endsWith('.json'))) {
    items.push({ type: 'lorebook', name: titleCase(f.replace(/\.lorebook\.json$|\.json$/g, '')), file: `lorebooks/${f}`, description: 'A SillyTavern lorebook (World Info).' });
}

// Regex scripts
const regexItem = (rel, group) => {
    let names = [];
    try { const d = json(rel); names = (Array.isArray(d) ? d : [d]).map(s => s.scriptName).filter(Boolean); } catch { /* unreadable */ }
    items.push({
        type: 'regex',
        name: names.length === 1 ? names[0] : titleCase(path.basename(rel, '.json')),
        file: rel,
        group,
        description: names.length > 1 ? `${names.length} scripts: ${names.join(', ')}` : '',
    });
};
// the default look: one folder per tracker, one file per script
const TRACKERS = { bonds: 'Bonds', vitals: 'Vitals', inventory: 'Inventory', 'internal-states': 'Internal States' };
for (const [dir, label] of Object.entries(TRACKERS)) {
    for (const f of list(`regex/${dir}`, n => n.endsWith('.json'))) regexItem(`regex/${dir}/${f}`, `${label} (default look)`);
}
const LOOKS = { parchment: 'Cozy Parchment look', persona: 'Persona HUD look', tactical: 'Tactical Glass Telemetry look' };
for (const [dir, group] of Object.entries(LOOKS)) {
    for (const f of list(`regex/themes/${dir}`, n => n.endsWith('.json'))) regexItem(`regex/themes/${dir}/${f}`, group);
}

// Workflows
for (const f of list('workflows', n => n.endsWith('.json'))) {
    items.push({ type: 'workflow', name: titleCase(f.replace('.workflow.json', '')), file: `workflows/${f}`, description: 'A ComfyUI workflow for the Phone. Copy it, then paste it into the Phone\'s ComfyUI workflow box.' });
}

// Art (information only: it is copied by hand)
if (fs.existsSync(path.join(root, 'art', 'fire-emblem'))) {
    items.push({ type: 'art', name: 'Fire Emblem artwork', file: 'art/fire-emblem/banners/neutral.png', description: 'House banners, weapon icons and crest icons. Copy the art folder into data/<your user>/user/images/worldkit-art/ (see the README).' });
}

fs.writeFileSync(path.join(root, 'catalog.json'), `${JSON.stringify({ format: 'worldkit-content', version: 1, items }, null, 2)}\n`);
console.log(`catalog.json: ${items.length} items`);
