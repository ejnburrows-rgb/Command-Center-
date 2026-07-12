---
title: "0b · Shared Engine + Content Contract (build once)"
category: Build/Execution
project: cartilla
tags: ["build", "code"]
source: "Operator Hub Build Console"
stageGroup: "Cartilla — 8-Game Remaster Pack"
created: 2026-07-12
updated: 2026-07-12
---
=== BUILD: shared game engine (do this ONCE, reuse in all 8 games) ===

Engine modules (src/cartilla/games/engine/):
- audio: playWord(audioUrl), playInstructions(audioUrl), chimeCorrect(), toneRetry(), gretelSay(line)
- dnd: <Draggable> + <DropZone> primitives. Pointer + touch + keyboard.
- feedback: <Feedback> wrapper — visual snap/bounce + audio chime/tone + Gretel pose reaction.
- gretel: <Gretel pose="idle|pointing|cheering" say="..." />
- scoring: useGameScore() — tracks attempts/correct, emits completion event to CRM progress store.
- shell: <GameShell instructions={...} letter={...}>

Content contract — src/cartilla/games/content/<gameId>.ts:

type GameArchetype =
  | "mariposas" | "payaso-chano" | "juego-vocal" | "fonetica-completar"
  | "lectura-silabas" | "lectura-rima" | "palabras-por-minuto" | "dibujos";

type WordItem = {
  word: string;
  syllables?: string[];
  audioUrl: string;
  imageUrl?: string;
};

type GameContent = {
  id: string;
  type: GameArchetype;
  letter: string;
  instructions: string[];
  words: WordItem[];
  tiles?: string[];
  assets: { illustration?: string; props?: string[] };
};

Deliverable: the engine + the GameContent type, plus an empty content folder. Commit and push.
=== END ENGINE ===
