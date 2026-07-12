---
title: "Prompt A — Wire activities to real content"
category: Build/Execution
project: global
tags: ["build", "prompt"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla de Gretel — Execution Prompts"
created: 2026-07-12
updated: 2026-07-12
---
TASK: Wire every activity component to real lesson content. Replace all placeholder/hardcoded data with imports from the content layer, keyed by lessonNumber.

DATA SOURCE (import via barrel ONLY): import from "src/content/index.ts"
PAGE -> LESSON: resolve lessonNumber ONLY via page-bindings.json.

EXACT OUTCOME: every activity type renders real Spanish words/sentences from content files for the active lessonNumber. Zero hardcoded Spanish/English strings remain.

COMMIT: feat(activities): wire all activity types to src/content via page-bindings

STOP after this commit.
