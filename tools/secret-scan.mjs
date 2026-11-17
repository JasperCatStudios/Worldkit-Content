#!/usr/bin/env node
/**
 * Stops API keys and other credentials from being committed or pushed.
 *
 *   node tools/secret-scan.mjs --staged            what is about to be committed (the pre-commit hook)
 *   node tools/secret-scan.mjs --push              what is about to be pushed, read from git's stdin (the pre-push hook)
 *   node tools/secret-scan.mjs --files a.json b.js scan files as they are on disk
 *
 * Three kinds of check, on added lines only:
 *   1. the exact values of every key in this computer's SillyTavern secrets.json files (the strongest check: if a
 *      real key of yours appears anywhere, in any file type, the commit is refused);
 *   2. well-known key formats (OpenAI-style sk-..., Google AIza..., GitHub tokens, ElevenLabs, fal, AWS, private keys,
 *      Bearer tokens);
 *   3. in JSON, YAML, env and text files, a credential-named field (apiKey, token, password, proxy_password ...) holding a
 *      real-looking value.
 * A line can be let through on purpose by putting `secret-scan:allow` on it. Placeholders (empty, YOUR_KEY, xxx, <key>)
 * never count.
 *
 * One-time setup per clone:   git config core.hooksPath .githooks
 * Extra folders to read secrets.json from (semicolon separated):   git config secretscan.dataDirs "C:/path/to/data"
 * Skipping the hooks with --no-verify is possible and defeats this; do not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const RULES = [
    { id: 'openai-style key (sk-...)', re: /\bsk-(?:or-v1-|ant-|proj-|nano-)?[A-Za-z0-9_-]{20,}/ },
    { id: 'Google API key (AIza...)', re: /\bAIza[0-9A-Za-z_-]{30,}/ },
    { id: 'GitHub token', re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}/ },
    { id: 'ElevenLabs key', re: /\bsk_[a-f0-9]{40,}\b/ },
    { id: 'fal key (id:secret)', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{32}\b/i },
    { id: 'AWS access key', re: /\bAKIA[0-9A-Z]{16}\b/ },
    { id: 'private key block', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
    { id: 'Bearer token', re: /\bBearer\s+[A-Za-z0-9._~+/=-]{24,}/ },
    { id: 'xi-api-key header value', re: /xi-api-key["']?\s*[:=]\s*["'][^"'\s]{16,}["']/i },
];

const FIELD_NAME = '(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token|client[_-]?secret|secret|token|password|passwd|proxy[_-]?password)';
const FIELD_RE = new RegExp(`["']?([A-Za-z0-9_.-]*${FIELD_NAME})["']?\\s*[:=]\\s*["']([^"'\\s]{8,})["']`, 'i');
const FIELD_FILES = /\.(json|jsonl|ya?ml|env|ini|toml|txt|cfg|conf)$|(^|\/)\.env/i;
const PLACEHOLDER = /^(?:your[_-]?|replace|change[_-]?me|example|sample|dummy|test|placeholder|none|null|undefined|false|true|xxx+|\*+|x{4,}|<.*>|\{\{.*\}\}|\$\{.*\}|%.*%|insert|todo)/i;
const SKIP_FILES = /\.(png|jpe?g|gif|webp|ico|mp3|ogg|wav|m4a|mp4|webm|woff2?|ttf|otf|zip|gz|bundle|pdf|bin)$/i;
const ALLOW = 'secret-scan:allow';

const mask = (s) => `${String(s).slice(0, 4)}${'*'.repeat(Math.min(12, Math.max(0, String(s).length - 4)))}`;

/** Every secret value on this computer: the entries of each SillyTavern secrets.json found above or beside the repo. */
export function knownSecretValues(startDir = process.cwd(), extraDirs = []) {
    const dirs = new Set(extraDirs.filter(Boolean));
    let here = path.resolve(startDir);
    for (let i = 0; i < 8; i++) {
        dirs.add(here);                                           // a repo that is itself a data folder (profile folders inside)
        for (const rel of ['data', 'SillyTavern/data', 'New folder/SillyTavern/data']) dirs.add(path.join(here, rel));
        const up = path.dirname(here);
        if (up === here) break;
        here = up;
    }
    const values = new Set();
    for (const dir of dirs) {
        let users;
        try { users = fs.readdirSync(dir); } catch { continue; }
        for (const user of users) {
            const file = path.join(dir, user, 'secrets.json');
            let data;
            try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
            for (const entry of Object.values(data || {})) {
                for (const item of Array.isArray(entry) ? entry : [entry]) {
                    const v = typeof item === 'string' ? item : item?.value;
                    if (typeof v === 'string' && v.length >= 12) values.add(v);
                }
            }
        }
    }
    return [...values];
}

/**
 * Scans added lines.
 * @param {{ file: string, line: number, text: string }[]} lines
 * @param {{ secrets?: string[] }} [options]
 * @returns {{ file: string, line: number, rule: string, shown: string }[]}
 */
export function scanLines(lines, { secrets = [] } = {}) {
    const found = [];
    for (const { file, line, text } of lines) {
        if (SKIP_FILES.test(file) || text.includes(ALLOW) || text.length > 200000) continue;
        for (const secret of secrets) {
            if (text.includes(secret)) { found.push({ file, line, rule: 'a key from your secrets.json', shown: mask(secret) }); break; }
        }
        for (const rule of RULES) {
            const m = rule.re.exec(text);
            if (m) found.push({ file, line, rule: rule.id, shown: mask(m[0]) });
        }
        if (FIELD_FILES.test(file)) {
            const m = FIELD_RE.exec(text);
            if (m && !PLACEHOLDER.test(m[2])) found.push({ file, line, rule: `credential field "${m[1]}" with a value`, shown: mask(m[2]) });
        }
    }
    return found;
}

/** The added lines of a unified diff (git diff -U0 or git log -p -U0), with their file and line number. */
export function addedLines(diff) {
    const out = [];
    let file = '';
    let n = 0;
    for (const raw of String(diff).split('\n')) {
        if (raw.startsWith('+++ ')) { file = raw.slice(4).replace(/^b\//, '').replace(/^"|"$/g, ''); continue; }
        if (raw.startsWith('--- ') || raw.startsWith('diff ') || raw.startsWith('index ')) continue;
        const h = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(raw);
        if (h) { n = Number(h[1]); continue; }
        if (raw.startsWith('+') && file && file !== '/dev/null') { out.push({ file, line: n, text: raw.slice(1) }); n++; }
    }
    return out;
}

const git = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024, ...opts });

function report(found) {
    if (!found.length) return 0;
    console.error('\nSecret scan: this would publish something that looks like a credential.\n');
    for (const f of found.slice(0, 40)) console.error(`  ${f.file}:${f.line}  ${f.rule}  (${f.shown})`);
    if (found.length > 40) console.error(`  ... and ${found.length - 40} more`);
    console.error('\nNothing was committed or pushed. Remove the value (or blank the field), then try again.');
    console.error(`A line that is safe on purpose can carry the words ${ALLOW}.\n`);
    return 1;
}

function configured() {
    try { return git(['config', '--get', 'secretscan.dataDirs']).trim().split(';').filter(Boolean); } catch { return []; }
}

function main() {
    const mode = process.argv[2];
    const secrets = knownSecretValues(process.cwd(), configured());
    if (mode === '--staged') {
        const diff = git(['diff', '--cached', '--no-color', '-U0', '--diff-filter=AM', '--no-ext-diff', '--text']);
        process.exit(report(scanLines(addedLines(diff), { secrets })));
    }
    if (mode === '--push') {
        const stdin = fs.readFileSync(0, 'utf8').split('\n').filter(Boolean);
        const zero = /^0+$/;
        let found = [];
        for (const row of stdin) {
            const [, localSha, , remoteSha] = row.split(' ');
            if (!localSha || zero.test(localSha)) continue;                       // a deleted branch
            const range = remoteSha && !zero.test(remoteSha) ? [`${remoteSha}..${localSha}`] : [localSha, '--not', '--remotes'];
            const log = git(['log', '-p', '--no-color', '-U0', '--no-ext-diff', '--text', '--diff-filter=AM', '--format=', ...range]);
            found = found.concat(scanLines(addedLines(log), { secrets }));
        }
        process.exit(report(found));
    }
    if (mode === '--files') {
        const lines = [];
        for (const file of process.argv.slice(3)) {
            let text;
            try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
            text.split('\n').forEach((t, i) => lines.push({ file: file.replace(/\\/g, '/'), line: i + 1, text: t }));
        }
        process.exit(report(scanLines(lines, { secrets })));
    }
    console.error('Usage: node tools/secret-scan.mjs --staged | --push | --files <paths...>');
    process.exit(2);
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) main();
