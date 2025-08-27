#!/usr/bin/env node
/**
 * Local Asset Scanner
 * Scans site/assets/images and generates:
 *  - site/assets/images/manifest.json
 *  - site/assets/snippets/gallery-items.html
 * No dependency on sibling repos. Pure Node.js fs/path.
 */

const fs = require('fs').promises;
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'site', 'assets', 'images');
const SNIPPETS_DIR = path.join(ROOT, 'site', 'assets', 'snippets');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');

const CATEGORIES = ['environments', 'weapons', 'vehicles', 'factions', 'renders', 'ui'];

function isImage(file) {
  return /\.(png|jpe?g|webp|gif)$/i.test(file);
}

// Exclude experimental/test/low-quality variants by filename pattern
const DISALLOW_PATTERNS = [
  /SWEEP/i,
  /ROLLBACK/i,
  /BASE720/i,
  /UPSCALE/i,
  /BICUBIC/i,
  /NEAREST/i,
  /TEST/i,
  /TG_Style/i,
  /TG_VAR/i,
  /TG_UPSCALE/i,
  /DPM/i,
  /CRISP_/i
];
function isDisallowed(name) {
  return DISALLOW_PATTERNS.some((r) => r.test(name));
}

function titleCaseName(str) {
  return str
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function detectStyle(filename) {
  const f = filename.toLowerCase();
  if (f.includes('gritty') || f.includes('worn') || f.includes('damaged')) return 'gritty';
  if (f.includes('clean') || f.includes('pristine') || f.includes('new')) return 'clean';
  if (f.includes('hero') || f.includes('render')) return 'hero';
  if (f.includes('emblem') || f.includes('insignia')) return 'emblem';
  return 'default';
}

function detectDescription(filename, category) {
  const f = filename.toLowerCase();
  const map = {
    environments: [
      ['metro', 'Underground transit system'],
      ['iez', 'Industrial Exclusion Zone facility'],
      ['research', 'Pre-cascade laboratory complex'],
      ['security', 'Military checkpoint installation'],
      ['bunker', 'Fortified underground shelter'],
      ['tech', 'Technology sector ruins']
    ],
    vehicles: [
      ['walker', 'Bipedal assault platform'],
      ['helo', 'Rotorcraft reconnaissance unit'],
      ['apc', 'Armored troop transport']
    ],
    weapons: [
      ['plasma', 'High-energy particle weapon'],
      ['ion', 'Directed energy system'],
      ['rifle', 'Standard infantry firearm']
    ],
    factions: [
      ['directorate', 'Sky Bastion military order'],
      ['scavenger', 'Salvage specialist organization'],
      ['free77', 'Professional mercenary company'],
      ['nomad', 'Mobile clan federation'],
      ['warden', 'Neutral civic coalition']
    ],
    renders: [
      ['hero', 'Showcase render']
    ],
    ui: [
      ['icon', 'Interface element']
    ]
  };
  const list = map[category] || [];
  for (const [kw, desc] of list) {
    if (f.includes(kw)) return desc;
  }
  return `${category.charAt(0).toUpperCase() + category.slice(1)} asset`;
}

(async function main() {
  console.log('🗂️ Scanning local assets...');
  const manifest = { environments: {}, weapons: {}, vehicles: {}, factions: {}, renders: {}, ui: {}, total: 0, lastUpdated: new Date().toISOString() };

  // Ensure snippets dir exists
  await fs.mkdir(SNIPPETS_DIR, { recursive: true });

  let galleryHTML = '';

  // Optional allowlist support: scripts/gallery-allowlist.json
  let allowlist = null;
  const allowlistPath = path.join(ROOT, 'scripts', 'gallery-allowlist.json');
  try {
    const content = await fs.readFile(allowlistPath, 'utf8');
    allowlist = JSON.parse(content);
    console.log('✓ Loaded gallery allowlist');
  } catch (_) {
    // no allowlist, proceed with heuristics
  }

  // Utility: normalize a filename to detect variant duplicates
  function normalizeKey(name) {
    const base = name
      .replace(/\.[^.]+$/, '') // drop extension
      .replace(/\b(19|20)\d{2,}\b/g, '') // drop long year/timestamps
      .replace(/\b\d{3,4}x\d{3,4}\b/gi, '') // drop resolution tokens
      .replace(/_?\d{5,}_?/g, '') // drop long numeric run ids
      .replace(/_?0000\d_?/g, '') // drop trailing sequence markers
      .replace(/_?1920w_?/gi, '')
      .replace(/_?Toned_?/gi, '')
      .replace(/^(HQ_|LORE_|PROD_|REFINE_SHARP_)+/gi, '') // drop pipeline prefixes
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
    return base;
  }

  // Preference scoring: favor semantic, curated names and showcase descriptors
  function scoreName(name) {
    const lower = name.toLowerCase();
    let score = 0;
    if (/-/.test(name)) score += 3; // semantic hyphenated names
    if (lower.includes('hero')) score += 3;
    if (lower.includes('premium')) score += 2;
    if (lower.includes('clean') || lower.includes('gritty')) score += 2;
    if (/\b2560x1440\b/i.test(name) || /1920w/i.test(name)) score += 1;
    if (lower.includes('toned')) score -= 1;
    if ((name.match(/\d/g) || []).length > 6) score -= 2;
    if (name.length > 60) score -= 2;
    return score;
  }

  // Should this image be emitted to the gallery HTML? (manifest remains curated by disallow rules)
  function includeInGallery(category, name) {
    // Never include UI icons or palette swatches in the gallery
    if (category === 'ui') return false;
    if (/palette/i.test(name)) return false;

    if (allowlist && Array.isArray(allowlist[category]) && allowlist[category].length) {
      return allowlist[category].includes(name);
    }

    // Heuristic: prefer semantic hyphenated files and avoid heavy pipeline-coded names
    const semantic = /[a-z]+-[a-z0-9-]+\.(png|jpe?g|webp)$/i.test(name);
    const pipeliney = /[A-Z]{2,}[_\d]/.test(name) || /(cfg|s\d|_\d{5,})/i.test(name);
    if (semantic && !pipeliney) return true;

    // Fallback: allow a small curated set of descriptors
    const allowedHints = ['metro', 'corridor', 'facility', 'bunker', 'tech-wastes', 'research', 'security', 'hero', 'stalker', 'walker', 'apc', 'plasma', 'ion'];
    return allowedHints.some(h => name.toLowerCase().includes(h));
  }

  for (const category of CATEGORIES) {
    const catDir = path.join(IMAGES_DIR, category);
    try {
      const entries = await fs.readdir(catDir, { withFileTypes: true });
      // Deduplicate by normalized key within category
      const chosen = new Map(); // key -> { name, score }
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!isImage(entry.name)) continue;
  if (isDisallowed(entry.name)) continue; // skip non-curated variants

        const filePath = path.join(catDir, entry.name);
        const stats = await fs.stat(filePath);

        // Always record in manifest (curated by disallow only)
        manifest[category][entry.name] = {
          filename: entry.name,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
        manifest.total++;

        // Gallery candidate collection
        if (!includeInGallery(category, entry.name)) continue;
        const key = `${category}:${normalizeKey(entry.name)}`;
        const score = scoreName(entry.name);
        const prev = chosen.get(key);
        if (!prev || score > prev.score) {
          chosen.set(key, { name: entry.name, score });
        }
      }

      // Emit chosen items to gallery
      for (const { name } of chosen.values()) {
        const displayName = titleCaseName(name);
        const style = detectStyle(name);
        const desc = detectDescription(name, category);
        const rarity = 'common';
        galleryHTML += `\n<div class="asset-item" data-category="${category}" data-style="${style}">\n  <img src="/assets/images/${category}/${name}" alt="${displayName}" class="asset-image" loading="lazy">\n  <div class="asset-overlay">\n    <h4>${displayName}</h4>\n    <p>${desc}</p>\n    <span class="rarity-tag ${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>\n  </div>\n</div>`;
      }
    } catch (e) {
      // Category folder may not exist; log once and continue
      if (e && e.code === 'ENOENT') {
        console.log(`ℹ️ Skipping missing category directory: ${path.relative(ROOT, catDir)}`);
      } else {
        console.warn(`⚠️ Error scanning ${category}: ${e.message}`);
      }
    }
  }

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✓ Wrote manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);

  const snippetPath = path.join(SNIPPETS_DIR, 'gallery-items.html');
  await fs.writeFile(snippetPath, galleryHTML.trim(), 'utf8');
  console.log(`✓ Wrote gallery snippet: ${path.relative(ROOT, snippetPath)}`);
  console.log(`📊 Assets found: ${manifest.total}`);
})();
