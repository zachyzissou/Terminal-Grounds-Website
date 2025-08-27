#!/usr/bin/env python3
"""
Scan images under site/assets/images and compute simple quality metrics (contrast, sharpness) using Pillow and numpy.
Produce a CSV report of images likely to be filtered by the client-side vision code.
"""
import os
import sys
from pathlib import Path
import json

try:
    from PIL import Image, ImageStat, ImageFilter
    import numpy as np
except Exception as e:
    print('Missing dependencies. Run: pip install pillow numpy')
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / 'site' / 'assets' / 'images'
OUT = ROOT / 'output' / 'vision-quality-report.csv'
OUT.parent.mkdir(parents=True, exist_ok=True)

# Basic quality metrics: RMS contrast, laplacian variance (sharpness proxy)

def rms_contrast(img):
    stat = ImageStat.Stat(img.convert('L'))
    mean = stat.mean[0]
    sq = stat.var[0]
    # RMS contrast approximated by stddev
    import math
    return math.sqrt(sq)


def laplacian_sharpness(img):
    # approximate Laplacian via filter
    gray = img.convert('L')
    arr = np.array(gray, dtype=np.float32)
    # simple Laplacian kernel
    kernel = np.array([[0,1,0],[1,-4,1],[0,1,0]], dtype=np.float32)
    from scipy import ndimage
    lap = ndimage.convolve(arr, kernel)
    return float(np.var(lap))


rows = []
for root, dirs, files in os.walk(IMG_DIR):
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg')):
            p = Path(root) / f
            try:
                img = Image.open(p)
                # downscale
                img2 = img.copy()
                img2.thumbnail((600,400))
                contrast = rms_contrast(img2)
                # fall back if scipy not installed
                try:
                    sharp = laplacian_sharpness(img2)
                except Exception:
                    sharp = 0.0
                rows.append((str(p.relative_to(ROOT)), contrast, sharp, img.size[0], img.size[1]))
            except Exception as e:
                rows.append((str(p.relative_to(ROOT)), -1, -1, 0, 0))

# Write CSV
with open(OUT, 'w') as fh:
    fh.write('path,contrast,sharpness,width,height\n')
    for r in rows:
        fh.write(','.join(map(str,r))+'\n')

print('Report written to', OUT)
