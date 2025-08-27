#!/usr/bin/env python3
"""
Select AAA-quality images from the vision-quality-report CSV and inject the list into
site/assets/images/manifest.json as the "aaa" array. Criteria are conservative:
 - width >= 1920 AND (contrast >= 25 OR sharpness >= 50)
 - OR very high quality: contrast >= 80 AND sharpness >= 200

This script is idempotent and preserves existing manifest fields.
"""
import json
from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / 'output' / 'vision-quality-report.csv'
MANIFEST = ROOT / 'site' / 'assets' / 'images' / 'manifest.json'

if not CSV.exists():
    print('CSV not found:', CSV)
    raise SystemExit(1)

rows = []
with CSV.open() as fh:
    reader = csv.DictReader(fh)
    for r in reader:
        try:
            contrast = float(r.get('contrast', 0) or 0)
            sharpness = float(r.get('sharpness', 0) or 0)
            width = int(r.get('width', 0) or 0)
        except Exception:
            contrast = 0.0
            sharpness = 0.0
            width = 0
        rows.append({
            'path': r.get('path', ''),
            'contrast': contrast,
            'sharpness': sharpness,
            'width': width,
        })

# Selection logic
selected = []
for r in rows:
    w = r['width']
    c = r['contrast']
    s = r['sharpness']
    if w >= 1920 and (c >= 25 or s >= 50):
        selected.append(r)
        continue
    if c >= 80 and s >= 200:
        selected.append(r)
        continue

# Deduplicate and sort by a simple score (contrast + sharpness/50)
def score(r):
    return r['contrast'] + (r['sharpness'] / 50.0)

selected = sorted({r['path']: r for r in selected}.values(), key=score, reverse=True)

# Turn relative paths into web paths (they are relative to repo root already like "site/assets/images/..")
web_paths = []
for r in selected:
    p = r['path']
    # If path begins with 'site/assets/images', convert to '/assets/images/...'
    if p.startswith('site/assets/images'):
        web_paths.append('/' + p[len('site/'):])
    else:
        web_paths.append('/' + p)

# Load existing manifest if present
manifest = {}
if MANIFEST.exists():
    try:
        manifest = json.loads(MANIFEST.read_text())
    except Exception:
        manifest = {}

manifest['aaa'] = web_paths
manifest['aaaCount'] = len(web_paths)

MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
print('Wrote', MANIFEST, 'with', len(web_paths), 'AAA images')
