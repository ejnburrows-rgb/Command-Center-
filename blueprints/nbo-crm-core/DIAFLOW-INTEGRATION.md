# Diaflow Integration for NBO CRM Core

Use Diaflow as a thin automation layer, not as a chatbot.

## Credit rule

**One user action -> deterministic preparation -> at most one AI call -> structured result.**

Avoid agentic chat, recursive agents, long chains, and scheduled loops that consume credits just to think.

## Flow 1 — Bilingual Content Pack

Trigger: manual button from Growth Center.

Input:
- source_title
- source_text
- factual_claims
- target_channels
- tone
- company_context

Steps:
1. Validate required fields.
2. Assemble one prompt.
3. Use the user's own free-tier Gemini key where practical.
4. Request strict JSON for all English/Spanish channel drafts in one call.
5. Return JSON to the CRM.
6. CRM stores everything as DRAFT.

No posting or sending node.

## Flow 2 — Document Workbench

Trigger: explicit reviewed document intake.

Input:
- extracted_text
- document_type
- requested_action: summarize | extract_fields | QA | draft_response

Steps:
1. Deterministic cleanup/truncation.
2. One AI call.
3. Structured JSON output.
4. Human review before anything becomes business data.

## Flow 3 — Bilingual QA

Trigger: manual review request.

Input:
- English text
- Spanish text
- purpose
- audience

Output:
- meaning mismatch
- tone mismatch
- missing information
- terminology inconsistency
- recommended corrections

One call only.

## Flow 4 — CRM Brief

Trigger: owner/manager requests a summary of selected CRM records.

The CRM first selects and formats only the relevant recorded facts. Diaflow receives the prepared facts and produces one brief. It does not receive unrestricted access to the whole CRM and does not decide what records to inspect.

## Connection contract

NBO CRM -> webhook/API request -> Diaflow flow -> structured JSON -> NBO CRM review queue.

The CRM remains the system of record. Diaflow never becomes the database.

## Activation checklist

- Grandfathered Diaflow credit allocation resolved.
- Gemini key configured if used.
- Test flow shows expected credit cost.
- JSON schema validated.
- No autonomous send/post action.
- Error path returns control to the CRM without partial writes.
