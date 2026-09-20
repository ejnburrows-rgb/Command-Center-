# NBO Marketing Automation — Infrastructure Only

Status: **prepared, not activated for prospecting**.

## Goal

Turn one approved source item into a reusable bilingual content pack without wasting Diaflow credits or allowing autonomous posting.

## Source items

A source item can be:
- a completed NBO project update
- a before/after workflow example
- a short operations insight
- a website improvement
- a CRM feature demonstration
- an owner-approved case-study fact set

## Pipeline

1. Capture one source item in the CRM Growth Center.
2. Store the factual source text unchanged.
3. Run one bounded AI generation request.
4. Require structured output:
   - English website paragraph
   - Spanish localized website paragraph
   - English LinkedIn/post draft
   - Spanish LinkedIn/post draft
   - English short social draft
   - Spanish short social draft
   - English email/newsletter draft
   - Spanish email/newsletter draft
5. Save all outputs as **DRAFT**.
6. Review/edit.
7. Mark **APPROVED**.
8. Publishing remains manual until explicitly enabled later.

## Hard rules

- No automatic cold outreach.
- No scraping contacts.
- No autonomous social posting.
- No invented results, testimonials, client names, ROI, savings, or performance claims.
- Spanish is localized, not word-for-word translated when that would sound unnatural.
- Every pack links back to its factual source item.
- One AI request per content pack by default.

## Content queue fields

- id
- source_type
- source_title
- source_text
- factual_claims
- channels
- english_draft
- spanish_draft
- status: draft | reviewed | approved | published
- reviewer
- created_at
- approved_at
- published_at
