Re-read CLAUDE.md. The Evidence Collection Assistant (official Phase 1, step 4) isn't convincing: it
doesn't really search a document base or attach anything. Make it realistic. I have NO real sample
files — everything must be MOCKED, made as realistic as possible for a Greek electricity utility (PPC).

Use plan mode. PHASE A — analyze (no code yet): read the current Evidence Collection step code,
summarize what it does, and propose the plan. Then implement (scripted / deterministic / click-driven
per CLAUDE.md — no live calls, no live typing).

REALISM BAR for the mocks (important, since there are no reference files): each mocked document must
look like a real PPC supporting document, not a placeholder — a document-style PREVIEW with a header
(placeholder PPC lockup, owning unit, protocol no. & date), sensible body content, and details that
are CONSISTENT with the hero "cross-border energy trading" scenario (Greece–Romania) and with the rest
of the demo (same counterparty, amounts, dates, cost center, and regulatory refs REMIT/EMIR/ACER/RAAEY,
MiFID II/HEnEx where relevant). Avoid lorem ipsum and vague text.

1. DOCUMENT REPOSITORY (new seeded data store, src/data — DISTINCT from the Knowledge Base of past
   recommendations): ~12–15 mocked supporting-document RECORDS. Each: title, document type (PDF / Word
   / Excel, with icon), owning unit, date, short summary, and a realistic rendered PREVIEW per the
   realism bar above (viewable in-app). Cover realistic types for the hero scenario, e.g.: counterparty
   KYC / due-diligence report, counterparty REMIT registration certificate, draft term sheet, market &
   credit risk assessment, financial impact / CAPEX–OPEX breakdown (Excel-style), regulatory framework
   memo (REMIT/EMIR/ACER/RAAEY/HEnEx), Group Policy Approval reference, cross-border trading procedure,
   SAP purchase request. Add a few unrelated documents as noise so search looks real.

2. Rework the EVIDENCE COLLECTION ASSISTANT step to actually:
   - SEARCH the repository: a visible scripted search ("Searching the document repository…") returning
     relevant matches RANKED by relevance for the hero scenario (deterministic).
   - IDENTIFY applicable policies/regulations tied to the found documents.
   - FLAG MISSING EVIDENCE: documents that should exist but aren't found (e.g. "Sanctions screening
     not found", "Cross-border capacity allocation (CACM) confirmation missing"), as actionable items.
   - ATTACH each retrieved document with a click → it appears in the recommendation's Attachments and
     in the PPC "Related documents / Attachments" section (Σχετικά / Συνημμένα). Add "Attach all" as a
     safety valve. Attached docs are VIEWABLE in a preview drawer.
   - Show progress (e.g. "4 of 6 recommended documents attached").

3. Integrate downstream: attached documents flow with the recommendation through the shared store, are
   openable by the reviewers, and are included in the Corporate Secretariat BoD package bundle. The
   completeness/readiness check accounts for required-but-missing evidence.

4. Keep it inside the shared AgentPanel, attributed to the "Evidence Collection Assistant" (no code
   names), with cognitive-layer tags (Perceive / Reason / Act) per CLAUDE.md.

Surgical & additive: add the mocked document repository + rework the Evidence Collection step + wire
attachments into the PPC document and downstream. Don't rebuild other journeys or assistants. After I
approve the plan, implement and show me: the assistant searching the repository, attaching real
viewable (mocked) documents, flagging missing evidence, and the attachments appearing in the PPC
document.