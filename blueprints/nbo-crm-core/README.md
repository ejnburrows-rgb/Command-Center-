# NBO CRM Core

Private reusable CRM infrastructure for NBO client implementations.

This is not OTTO, La Cartilla, or Tucker Pool CRM repackaged. It extracts the strongest reusable patterns from those systems into one configurable base.

## Source patterns incorporated

- Tucker Pool CRM: simple offline-first operation, bilingual interface, contacts, schedules/payments, fast local persistence, JSON backup/restore.
- OTTO: owner/manager/staff permissions, deterministic Needs Attention, jobs/work, follow-ups, activity history, unified file intake, customer/employee separation, operational summaries.
- La Cartilla: structured role-specific dashboards, progress/history patterns, disciplined React-era information architecture, deterministic flags rather than AI guesses.
- NBO: workflow modernization, custom CRM + operations hub, bilingual operations, practical AI/content automation with human approval.

## Core modules

- Today / Needs Attention
- Contacts
- Work pipeline
- Tasks and follow-ups
- Unified file intake
- Activity timeline
- Role and capability control
- English / Spanish UI
- Local-first persistence + backup/restore
- Client configuration layer
- NBO Growth Center
- Adapter boundary for future cloud/database/API integrations

## Rule

AI is optional. The CRM must remain useful without a paid AI API. Deterministic business rules run first; AI can be added only to bounded tasks such as document extraction, summaries, drafting, QA, or knowledge lookup.

Open `index.html` directly in a browser to run the private reference implementation.
