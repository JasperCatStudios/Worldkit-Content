/**
 * Builds items/fe-three-houses.items.json from a saved copy of the Fire Emblem: Three Houses "List of items" wiki page.
 *
 *   node tools/build-fe-items.mjs "C:/path/to/items.htm"
 *
 * Reads the item tables (equipment, items, gifts, lost items, bait, seeds, ore, fish, produce, meat, tea)
 * and writes plain data: id, name, category, price, sell, uses, grade, desc, plus a few presets. The Worldkit
 * extension imports the file from the Content Kit into its Item Database. Run build-catalog.mjs afterwards.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) { console.error('Usage: node tools/build-fe-items.mjs <items.htm>'); process.exit(1); }
const html = fs.readFileSync(source, 'utf8');

const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'").replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const text = (cell) => decode(cell.replace(/<sup[\s\S]*?<\/sup>/gi, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** The table sections we want: heading text on the page -> category label and how to read its columns. */
const SECTIONS = [
    { heading: 'Equipment', category: 'Equipment', cols: ['name', 'prt', 'wt', 'other', 'desc'] },
    { heading: 'Items', category: 'Consumable', cols: ['name', 'uses', 'price', 'sell', 'desc'] },
    { heading: 'Important Gifts', category: 'Important Gift', cols: ['name', 'grade', 'desc'] },
    { heading: 'Gifts', category: 'Gift', cols: ['name', 'grade', 'desc'] },
    { heading: 'Lost Items', category: 'Lost Item', cols: ['name', 'desc', 'owner'] },
    { heading: 'Bait', category: 'Bait', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Seeds', category: 'Seeds', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Ore', category: 'Ore', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Fish', category: 'Fish', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Produce', category: 'Produce', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Meat', category: 'Meat', cols: ['name', 'price', 'grade', 'desc'] },
    { heading: 'Tea', category: 'Tea', cols: ['name', 'price', 'grade', 'desc'] },
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
const num = (s) => { const n = Number(String(s ?? '').replace(/[^0-9.-]/g, '')); return Number.isFinite(n) && String(s ?? '').trim() !== '' && /\d/.test(s) ? n : null; };

const parts = html.split('<table');
const out = [];
const seen = new Set();
for (let i = 1; i < parts.length; i++) {
    const before = parts[i - 1].match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g);
    const heading = before ? text(before[before.length - 1]).replace(/\[.*$/, '').trim() : '';
    const section = SECTIONS.find(s => s.heading === heading);
    if (!section) continue;
    const rows = parts[i].split('</table>')[0].split(/<tr[\s>]/i).slice(1);
    for (const row of rows) {
        if (/<th/i.test(row) && !/<td/i.test(row)) continue;     // header row
        const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)(?=<t[dh]|$)/gi)].map(m => text(m[1]));
        // Equipment has an icon cell first; it has no text, so drop empty leading cells.
        while (cells.length && cells[0] === '') cells.shift();
        if (!cells.length || !cells[0]) continue;
        const rec = {};
        section.cols.forEach((c, k) => { rec[c] = cells[k] ?? ''; });
        const name = rec.name.replace(/\s+/g, ' ').trim();
        if (!name) continue;
        let id = `fe_${slug(name)}`;
        if (seen.has(id)) id = `${id}_${slug(section.category)}`;
        seen.add(id);
        const item = { id, name, category: section.category };
        if (section.category === 'Equipment') {
            const bits = [];
            if (rec.prt) bits.push(`Prt ${rec.prt}`);
            if (rec.wt) bits.push(`Wt ${rec.wt}`);
            if (rec.other) bits.push(rec.other);
            if (bits.length) item.stats = bits.join(', ');
        }
        const price = num(rec.price); if (price !== null) item.price = price;
        const sell = num(rec.sell); if (sell !== null) item.sell = sell;
        const uses = num(rec.uses); if (uses !== null) item.uses = uses;
        const grade = num(rec.grade); if (grade !== null) item.grade = grade;
        if (rec.owner) item.owner = rec.owner;
        item.desc = rec.desc;
        out.push(item);
    }
}

const presets = [
    { id: 'fe_adventurer_pack', name: 'FE Adventurer Pack', desc: 'Healing, light and a shield for a first outing.', gold: 300,
        items: [{ ref: 'Vulnerary', qty: 3 }, { ref: 'Concoction', qty: 1 }, { ref: 'Torch', qty: 2 }, { ref: 'Antitoxin', qty: 1 }, { ref: 'Iron Shield', qty: 1 }] },
    { id: 'fe_healer_satchel', name: 'FE Healer Satchel', desc: 'Everything a field healer keeps to hand.', gold: 0,
        items: [{ ref: 'Vulnerary', qty: 5 }, { ref: 'Concoction', qty: 2 }, { ref: 'Elixir', qty: 1 }, { ref: 'Antitoxin', qty: 2 }, { ref: 'Pure Water', qty: 1 }] },
    { id: 'fe_angler_kit', name: 'FE Angler Kit', desc: 'Bait for a day at the pond.', gold: 0,
        items: [{ ref: 'Insect Larva', qty: 5 }, { ref: 'Earthworm', qty: 5 }, { ref: 'Pond Snail', qty: 3 }] },
    { id: 'fe_garden_starter', name: 'FE Garden Starter', desc: 'Seeds for the greenhouse.', gold: 0,
        items: [{ ref: 'Mixed Fruit Seeds', qty: 2 }, { ref: 'Mixed Herb Seeds', qty: 2 }, { ref: 'Vegetable Seeds', qty: 2 }] },
    { id: 'fe_tea_party', name: 'FE Tea Party', desc: 'Three blends to share.', gold: 0,
        items: [{ ref: 'Tea of the Saints', qty: 2 }, { ref: 'Chamomile', qty: 1 }, { ref: 'Sweet-Apple Blend', qty: 1 }] },
];
for (const p of presets) for (const e of p.items) if (!out.some(i => i.name === e.ref)) throw new Error(`preset ${p.name}: no item called ${e.ref}`);

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, '..', 'items', 'fe-three-houses.items.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify({ format: 'worldkit-items', version: 1, name: 'Fire Emblem: Three Houses items', items: out, presets })}\n`);
const counts = {};
for (const i of out) counts[i.category] = (counts[i.category] || 0) + 1;
console.log(`wrote ${out.length} items to ${target}`, counts);
