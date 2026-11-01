# NBO Studio — Desktop IDE Aesthetic, Mind-Map Lifecycle Board & Streamlined Prompt Library

Elevate the NBO Command Center into a cohesive, native-feeling desktop coding studio featuring authentic IDE color themes (**Tokyo Night**, **Catppuccin**, **Dracula**, **Cursor Carbon**, plus **Light Studio**), an interactive **Visual Web / Mind-Map Project Lifecycle Board** with embedded Ready-to-Start prompts, and an un-crowded **Split-Pane Full-Stack Prompt Library**.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions incorporate your answers and govern this upgrade:

- **Confirmed Decision 1 — Desktop IDE Color Themes & Anti-Sticker Framing**: Replace bulky, floating "sticker-like" cards with a unified, flush desktop studio layout using crisp `1px` hairline borders, subtle syntax-inspired accents, and one-click IDE palettes (**Tokyo Night**, **Catppuccin Mocha**, **Dracula**, **Cursor Carbon**, and **Light Studio**).
- **Confirmed Decision 2 — Un-Crowded Split-Pane Prompt Library**: Replace the bulky wall of prompt cards with a breathable **two-pane studio browser**—compact single-line rows on the left and a clean IDE prompt viewer on the right—organized into 6 simple steps that mirror a real full-stack development firm.
- **Confirmed Decision 3 — Interactive Visual Web / Mind-Map Project Lifecycle Board**: Track every project through a visual **Connected Node Web** (from *Idea & Spec* through *Launch & Handoff*) where clicking any node on the web reveals its plain-English checklist and the exact **Ready-to-Start AI Prompt** for that stage.

---

### 1. Overview & Core Concept

- **What It Does**: Gives you the power of a professional full-stack software development firm inside a calm, visually cohesive desktop studio. Instead of reading bulky text boxes or complicated tables, you see your projects and their lifecycle stages as an intuitive visual web, click the active node, and copy the exact AI prompt needed for that moment.
- **Target Audience / Persona**: Designed for Emilio José—a visual, non-technical founder who prefers clean mind-map/web relationships, desktop coding aesthetics, and streamlined one-click AI workflows over crowded enterprise dashboards.
- **Key Value**: Eliminates visual bulk ("fake sticker" cards and text walls) while connecting all 98+ of your repository instructions directly to the visual lifecycle stage where they belong.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Sleek Studio Homepage (`Today · Overview`)**:
     - Framed like a modern desktop coding workspace (Cursor / Linear / Raycast style) with a compact status header, IDE theme switcher, and zero wasted space.
     - **Compact Project Strip**: Sleek horizontal project rows/tiles for **La Cartilla de Gretel**, **LANY Books**, and **NBO Operations Hub** showing a 1-line plain-English status, active lifecycle node pill, and a 1-click **"Copy Next Prompt"** action.
     - **Embedded Interactive Lifecycle Web Preview**: Shows your active project’s connected lifecycle web right on the workspace, with the technical details drawer (*Full Network Map, Jules #18 & Raw GitHub Queue*) tucked cleanly at the bottom.
  2. **Visual Web / Mind-Map Project Lifecycle Board (`Project Lifecycle`)**:
     - **Project Selector Bar**: Switch between **La Cartilla de Gretel**, **LANY Books**, **NBO Operations Hub**, **OTTO CRM**, or start a new project brief.
     - **Interactive 6-Node Connected Web Canvas (SVG)**:
       - Renders the selected project as the central hub node connected by smooth curved paths to 6Full-Stack AI Firm Lifecycle nodes:
         1. `01 · Idea & Spec` *(Define outcome & boundaries)*
         2. `02 · Foundation & Rules` *(Workspace & CLAUDE.md / AGENTS.md)*
         3. `03 · Core Build` *(Features, games, CRM & database)*
         4. `04 · Visual & Mobile QA` *(390px phone, 1440px desktop & artwork)*
         5. `05 · Security & Backups` *(Keys, privacy & backup gates)*
         6. `06 · Launch & Handoff` *(Live proof & lessons learned)*
       - Each node shows its real state (**Done**, **Active Now**, or **Next Up**) and responds to hover/click.
     - **Focused Stage Dock (Beside/Below the Web)**:
       - Clicking any node on the web displays only that stage’s essentials:
         - **Plain-English Goal**: 1 sentence explaining what happens in this stage and why it matters.
         - **3 Simple Checkboxes**: Click to mark milestones complete for that specific project.
         - **Ready-to-Start AI Prompts for This Stage**: The exact kickoff, build, or verification prompts for that stage—ready to copy in one click.
  3. **Un-Crowded Split-Pane Prompt Library (`Prompt Library`)**:
     - **Top Stage Bar**: Filter by the 6 Full-Stack AI Firm stages (*All*, *1. Start & Spec*, *2. AI Behavior (00–16)*, *3. Build & CRM*, *4. Cartilla Games & Art*, *5. Quality, Security & Backups*, *6. My Saved Prompts*) + instant search.
     - **Left Pane (Compact List)**: Clean, single-line clickable rows showing the prompt title, category tag, and an instant `Copy` button—zero multi-paragraph card clutter.
     - **Right Pane (IDE Prompt Viewer)**: Displays the selected prompt’s plain-English *"When to use this"* note and a syntax-styled monospace prompt viewer with **Copy Prompt** and **Customize** buttons.

- **Visual Identity & Theme**:
  - **Aesthetic Direction**: High-craft desktop IDE & creative command studio—flush panel geometry, `1px` crisp structural borders, subtle glass topbar, and syntax-highlighted accents.
  - **Color Palette & Mood**:
    - **Tokyo Night (`blue` / default dark)**: Deep indigo-slate canvas (`#1a1b26`), recessed sidebar (`#16161e`), elevated surface (`#1f2335`), electric cyan/blue (`#7aa2f7`) and violet (`#bb9af7`) accents.
    - **Catppuccin Mocha (`purple`)**: Warm espresso-slate canvas (`#1e1e2e`), mantle (`#181825`), surface (`#313244`), lavender/mauve (`#cba6f7`) and sapphire (`#89b4fa`) accents.
    - **Dracula (`teal`)**: Deep charcoal-plum canvas (`#282a36`), sidebar (`#21222c`), surface (`#343746`), mint-cyan (`#8be9fd`) and emerald (`#50fa7b`) accents.
    - **Cursor Carbon (`mono`)**: Pure obsidian-zinc canvas (`#0c0d10`), sidebar (`#111318`), surface (`#171a21`), crisp ice-slate (`#e2e8f0`) andemerald accents.
    - **Light Studio (`light` mode)**: Warm porcelain paper (`#f8fafc`), crisp white panels (`#ffffff`), subtle slate hairlines (`#e2e8f0`), and high-contrast ink (`#0f172a`) for an airy, light-board experience.
  - **Typography & Hierarchy**: Geometric sans headings (`tight` tracking, balanced wrapping), clean `13.5px–14px` studio UI labels (`whitespace-nowrap` on all buttons and tabs), and `tabular-nums` monospace (`JetBrains Mono` / `SFMono-Regular`) for prompt code blocks, stage numbers, and counts.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1 — Connected SVG Lifecycle Web Instead of a Kanban Table**
  - *Chosen Approach*: Render an interactive SVG node-and-branch web showing the project at the center/left and its 6 lifecycle stages branching outward, paired with a single-stage detail dock.
  - *Why*: Matches your preference for visual webs/mind maps, avoids enterprise Kanban jargon, and keeps only one stage's details open at a time so the screen never feels crowded.
- **Decision 2 — Split-Pane Master-Detail Layout for the 98+ Prompt Library**
  - *Chosen Approach*: Show a scannable compact list on the left and a dedicated IDE code viewer on the right (collapsing cleanly into a slide-down reader on mobile).
  - *Why*: Lets you scan 15–20 prompts at a glance without scrolling past giant boxes, while giving the selected prompt room to breathe.
- **Decision 3 — Map IDE Themes Directly Onto Existing Theme Tokens**
  - *Chosen Approach*: Upgrade the CSS token definitions in `nbo-premium.css` and `hub-upgrade.css` so the existing 4 palette keys (`blue` → **Tokyo Night**, `purple` → **Catppuccin**, `teal` → **Dracula / Cyan**, `mono` → **Cursor Carbon**) and `light` / `dark` appearance toggle deliver authentic desktop IDE colors while keeping 100% compatibility with existing tests.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│            NBO DESKTOP STUDIO SHELL (IDE Themes + Light Board)             │
│  Palettes: Tokyo Night · Catppuccin · Dracula · Cursor Carbon · Day Light  │
├────────────────────────┬───────────────────────────┬───────────────────────┤
│   1. TODAY STUDIO HQ   │ 2. MIND-MAP LIFECYCLE WEB │  3. SPLIT-PANE        │
│ • Sleek Status Strip   │ • Interactive SVG Web     │     PROMPT LIBRARY    │
│ • Compact Project Rows │   (Project ──► 6 Stages)  │ • 6 Full-Stack Firm   │
│   (Cartilla, LANY, NBO)│ • Stage 1: Idea & Spec    │   Category Tabs       │
│ • 1-Click Next Prompt  │ • Stage 2: Foundation     │ • Left: Compact List  │
│ • Collapsible Drawer   │ • Stage 3: Core Build     │   with 1-Click Copy   │
│   for Raw Git / Jules  │ • Stage 4: Visual & Mobile│ • Right: Syntax IDE   │
│                        │ • Stage 5: Security/Backup│   Prompt Reader &     │
│                        │ • Stage 6: Launch & Proof │   Custom Editor       │
└────────────────────────┴───────────────────────────┴───────────────────────┘
```

- **Data Model & State**:
  - **Project Lifecycle Progress (`nbo-lifecycle-web-v1`)**: Persists per-project stage completion and active node selection (`{ [projectSlug]: { activeStage: number, completedChecks: Record<string, boolean>, brief: ProjectBrief } }`) in `localStorage` and includes it in complete NBO backups.
  - **Full-Stack Firm Stage Mapping**: Maps each of the 98+ markdown prompts from `/api/library` to one of the 6 lifecycle nodes (`idea`, `foundation`, `build`, `visual`, `security`, `launch`) so clicking any node on the Lifecycle Web automatically surfaces the matching Ready-to-Start prompts from your library.

- **Interactive Component & State Mapping**:
  - **Interactive Lifecycle Web SVG**: Clicking any of the 6 stage nodes (`01` through `06`) highlights the connecting branch, updates `activeStage`, and loads that stage’s plain-English checklist, project brief fields (on Stage 1), release gate (on Stage 6), and Ready-to-Start prompts in the Stage Dock.
  - **Split-Pane Prompt Library**: Clicking any compact prompt row selects `activePromptId` and renders its full markdown and metadata in the right-hand IDE reader; clicking `Copy` on either the row or reader copies the prompt immediately with a subtle status badge.
