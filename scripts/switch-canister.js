#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function die(msg) { console.error(msg); process.exit(1); }

const root = path.resolve(__dirname, '..');
const canisterIdsPath = path.join(root, 'canister_ids.json');
const frontendDistPath = path.join(root, 'src', 'frontend', 'dist', 'canister-ids.js');
const frontendPublicPath = path.join(root, 'src', 'frontend', 'public', 'canister-ids.js');
const clyprConfigPath = path.join(root, 'src', 'frontend', 'src', 'config', 'clypr-config.json');

const target = process.argv[2];
if (!target || !['local','ic'].includes(target)) {
  console.log('Usage: switch-canister.js <local|ic>');
  process.exit(1);
}

let rootIds = {};
if (fs.existsSync(canisterIdsPath)) {
  try { rootIds = JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8')); } catch(e) { rootIds = {}; }
}

function readLocalDist() {
  if (!fs.existsSync(frontendDistPath)) return null;
  const src = fs.readFileSync(frontendDistPath, 'utf8');
  const marker = 'window.canisterIds';
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  const braceIdx = src.indexOf('{', idx);
  if (braceIdx === -1) return null;
  // find matching brace
  let depth = 0;
  let end = -1;
  for (let i = braceIdx; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) return null;
  const objStr = src.substring(braceIdx, end+1);
  try {
    // Evaluate object safely
    const obj = vm.runInNewContext('(' + objStr + ')');
    return obj;
  } catch(e) {
    return null;
  }
}

const localDistIds = readLocalDist();

function pickId(canister, network) {
  // prefer root canister_ids.json
  if (rootIds && rootIds[canister] && rootIds[canister][network]) return rootIds[canister][network];
  // fallback to dist file for local
  if (network === 'local' && localDistIds && localDistIds[canister]) return localDistIds[canister];
  return undefined;
}

const canisters = ['backend','frontend','internet_identity'];
const selected = {};
for (const c of canisters) {
  const id = pickId(c, target === 'local' ? 'local' : 'ic');
  if (id) selected[c] = id;
}

if (!selected.backend && !selected.frontend) {
  die(`Could not locate canister ids for target='${target}'. Ensure canister_ids.json or src/frontend/dist/canister-ids.js exists.`);
}

// 1) update frontend dist and public canister-ids.js
const payloadObj = { backend: selected.backend||null, frontend: selected.frontend||null, internet_identity: selected.internet_identity||null };
const out = `// Clypr Canister IDs for ${target} environment\nwindow.canisterIds = ${JSON.stringify(payloadObj, null, 2)};\n`;
try { fs.writeFileSync(frontendDistPath, out, 'utf8'); console.log('Updated', frontendDistPath); } catch(e) { /* ignore */ }
try { fs.writeFileSync(frontendPublicPath, out, 'utf8'); console.log('Updated', frontendPublicPath); } catch(e) { /* ignore */ }

// 2) update clypr-config.json canisterId (backend) if present
if (fs.existsSync(clyprConfigPath)) {
  try {
    const cfg = JSON.parse(fs.readFileSync(clyprConfigPath, 'utf8'));
    if (selected.backend) cfg.canisterId = selected.backend;
    fs.writeFileSync(clyprConfigPath, JSON.stringify(cfg, null, 2), 'utf8');
    console.log('Updated', clyprConfigPath);
  } catch(e) {
    console.warn('Failed to update clypr-config.json:', e.message);
  }
}

// 3) print summary and instructions
console.log('Selected canister ids:');
for (const k of Object.keys(selected)) console.log(`  ${k}: ${selected[k]}`);
console.log('\nNext steps: rebuild or reload frontend if needed. For dfx commands, ensure you use the correct identity/network.');
