# Architecture

## 1. Configurable workspace

One codebase changes labels, modules, roles, terminology, language defaults, and workflow rules through configuration instead of client-specific forks.

## 2. Universal data model

- contacts: customer, vendor, partner, parent, lead, member, or other relationship
- work: job, project, case, service request, class/engagement, or custom work unit
- tasks: deterministic next actions and follow-ups
- activities: unified historical timeline
- users: owner/admin/manager/staff/customer/viewer
- files: classified through one intake surface

## 3. Permission model

Capabilities are explicit. Roles never gain access because a screen happens to be visible.

Owner/admin: full workspace and settings.
Manager: operations, people, finance, intake, export.
Staff: assigned work, tasks, contacts, intake.
Customer: intentionally isolated portal layer only.
Viewer: read-only internal overview.

## 4. Deterministic attention engine

Needs Attention is computed from recorded facts:
- overdue open task
- overdue unfinished work
- blocked work
- outstanding balance past due
- future adapters can add missing approval, unsigned document, unanswered intake, or client-specific rules

No AI guess may create an operational alert.

## 5. Unified intake

One front door:
- spreadsheet -> structured field mapping + review
- image -> OCR review
- PDF -> explicit document vs drawing choice
- CAD -> drawing/work review
- Word/text -> document review
- PowerPoint -> presentation/reference review

Nothing extracted is committed without review.

## 6. Storage boundary

Reference build is local-first with primary + backup localStorage and JSON export/import.
Production adapters can later replace persistence with Firebase, Supabase, an existing client CRM/API, or another owner-approved backend without rewriting the UI model.

## 7. Growth Center

Internal NBO layer tracks:
- positioning
- offers
- website readiness
- proof/case-study preparation
- bilingual content pipeline
- competitor notes
- approved marketing drafts

Prospecting is not required for this layer to be useful.
