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

  for (const category of CATEGORIES) {
    const catDir = path.join(IMAGES_DIR, category);
    try {
      const entries = await fs.readdir(catDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile()) continue;
        if (!isImage(entry.name)) continue;

        const filePath = path.join(catDir, entry.name);
        const stats = await fs.stat(filePath);

        manifest[category][entry.name] = {
          filename: entry.name,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
        manifest.total++;

        const displayName = titleCaseName(entry.name);
        const style = detectStyle(entry.name);
        const desc = detectDescription(entry.name, category);
        const rarity = 'common';
        galleryHTML += `\n<div class="asset-item" data-category="${category}" data-style="${style}">\n  <img src="/assets/images/${category}/${entry.name}" alt="${displayName}" class="asset-image" loading="lazy">\n  <div class="asset-overlay">\n    <h4>${displayName}</h4>\n    <p>${desc}</p>\n    <span class="rarity-tag ${rarity}">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>\n  </div>\n</div>`;
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
