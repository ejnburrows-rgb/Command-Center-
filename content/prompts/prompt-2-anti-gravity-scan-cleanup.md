---
title: "Prompt 2 → Anti-Gravity (scan cleanup)"
category: Build/Execution
project: cartilla
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla — Image Pipeline & Art"
created: 2026-07-12
updated: 2026-07-12
---
ROLE: Turn raw scans into clean, artifact-free line art. NO AI redraw — pure image processing.

WRITE scripts/clean_workbook.py (OpenCV + Pillow + rembg [BiRefNet]) that, per scan:
  1. Deskew + auto-crop to the artwork.
  2. Normalize: grayscale → CLAHE → adaptive threshold; despeckle scanner noise.
  3. Background → transparent PNG via rembg/BiRefNet. Save to public/cartilla/art/hd/lineart/page-<nnn>.png
  4. Remove printed grid / answer-circle artifacts ONLY where they are scan noise.

OUTPUT a side-by-side QA contact sheet (source | cleaned) for all 92.
Branch feat/workbook-scan-cleanup.
