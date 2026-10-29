---
name: NBO Studio visual system
version: 1
colors:
  primary: "#1c62d5"
  canvas-day: "#eef5ff"
  canvas-night: "#081827"
  panel-day: "#ffffff"
  panel-night: "#112b44"
typography:
  display:
    fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif'
  body:
    fontFamily: 'Inter, "Segoe UI", system-ui, sans-serif'
  utility:
    fontFamily: '"JetBrains Mono", ui-monospace, monospace'
omitted:
  - section: spacing
    reason: Inherited from existing NBO CSS layout rhythm.
  - section: rounded
    reason: Inherited from established NBO primitives.
---
# NBO Studio — visual language
An accessible, owner-first operations workspace, not a marketing landing page. Its primary job is to make decisions and project status understandable on a phone without reading code.

## Canonical tokens
The existing runtime file `app/nbo-premium.css` is the source of truth for appearance and palette. This document describes the system, not a second generator. `app/premium-preferences.tsx` owns the persisted palette, day/night mode, and workspace selection. Components consume the `--ui-*` semantic variables.

Each of Blue, Violet, Teal, and Monochrome has two **complete surface palettes**, Day and Night: canvas, sidebar, topbar, raised background, panel, hover, border, text, muted text, and action accent change together. Do not implement a theme by changing only the logo, colored letter, or accent border.

## Layout and style
Calm, confident, immersive work surface; no small badge collage or decorative sticker panels. Gretel's owner timeline is part of the existing Overview canvas, not a separate floating widget. The broad five-stage line is its unique visual signature. Generous headline; uncluttered proof status; one obvious handoff action; remaining prompts are collapsed by default. High legibility and touch targets on narrow phones.

## Behavior
- Theme changes persist on device and apply across Overview, projects, GitHub, evidence, settings, and the shared shell.
- Distinguish open PR, independent verification, approval, and production release. No synthetic completion.
- Muse handles Jules. Owner handouts for other agents stay device-local on an anonymous website.
- Browser refresh, keyboard focus, touch interaction, contrast, 320–390px responsive layout, and reduced motion must remain usable.
