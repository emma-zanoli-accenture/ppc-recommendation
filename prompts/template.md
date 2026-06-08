Re-read CLAUDE.md. Goal: make the documents Recopilot generates faithfully mirror REAL PPC board
recommendations. I've placed two real PPC reference files in `reference/`:
- `reference/ppc_recommendation_template.docx` — the official PPC recommendation ("εισήγηση") template.
- `reference/ppc_filled_example.pdf` — a real, fully completed example (Carbon Farming / Just Transition).

Use plan mode: first READ both reference files and analyze them; summarize the template's section
structure and the filled example's style/depth; compare against the content the Drafting Agent
currently produces; propose the mapping; implement only after I approve.

LANGUAGE: the demo stays in ENGLISH. Mirror the STRUCTURE and SUBSTANCE of the PPC template (English
section titles that are faithful translations), not the Greek text.

Make the generated recommendation document follow this PPC structure (this is the authoritative spec;
use the reference files to refine wording and depth):

Header block: Proposing Business Unit/Department · Contact/Phone/e-mail · Protocol No. & Date.

Body sections (keep ALL sections; if one doesn't apply, state "Not applicable" — per PPC rules):
1. Subject / Related documents / Attachments.
2. Necessity (Why) — brief background incl. any prior decision; link to permanent/recurring needs;
   link to business plan; applicable legislative & regulatory framework; reasons, expected benefits,
   and consequences of not deciding.
3. Object (What) — precise description of what the BoD is asked to decide incl. conditions;
   alternatives considered + justification for excluding them; inventory/stock check (if materials);
   key transaction terms (duration/extension, governing law, dispute resolution, option rights);
   risks (operational / financial / regulatory) + mitigation; penalty clauses for delays.
4. Location of the intended transaction (Where).
5. Proposed Implementation Method (How) — procedure followed with reference to PPC Regulations
   (e.g. procurement manual / KEPY); confirmation of compliance with internal Regulations & Policies
   (e.g. Group Policy Approval) and Group procedures; opinion of a competent Committee / Independent
   Body where required.
6. Timeline (When) — start date, key phases, completion date.
7. Budget / Expense (How much) — specific or maximum expense; documentation; in/out of budget;
   CAPEX or OPEX; financing terms; potential savings/benefits; cost center & account number.
8. Counterparty (Who) & Authorizations — counterparty identification; KYC check (AML, sanctions,
   anti-corruption); Related-Party check; who signs/acts for the company; financial & time limits
   and special restrictions; sub-delegations.
9. Proposal for Decision — concise (e.g. "recommend a decision as per the draft below").
10. Draft BoD Resolution — Subject; "The Board of Directors, having regard to: a) recommendation
    no. [...]; b) the discussion at this meeting, RESOLVES: [...]"; plus listed attachments.
11. Signatures / Co-signatures / Approvals — Hierarchy · Parallel Bodies · Preventive Financial
    Control · (Group) General Directors · Legal Counsel / Group GD Legal Affairs & Corporate
    Governance. Use plausible FICTIONAL names with realistic PPC-style titles (do NOT reuse the real
    individuals from the sample file).

Apply this to the hero scenario "New cross-border energy trading agreement" (Greece–Romania), filled
to the same depth as the example PDF: REMIT/EMIR/ACER/RAAEY in the Necessity & regulatory framework;
alternatives (e.g. bilateral OTC vs exchange-based via HEnEx); market/credit/regulatory risks +
limits; counterparty KYC + related-party finding; CAPEX/OPEX, cost center, account number; a draft
resolution authorizing signature within stated limits.

Wire it through (scripted/deterministic/click-driven per CLAUDE.md — no live calls, no live typing):
- The DRAFTING AGENT's precompiled template (step 4b) now uses these exact sections and produces the
  draft resolution + signature block.
- The assisted-drafting GAPS and SUGGESTIONS map to these mandatory PPC elements (e.g. "Missing
  Related-Party check (sec. 8)", "Alternatives not justified (sec. 3)", "CAPEX/OPEX & cost center
  missing (sec. 7)"). Same for the review agents' checks (Legal → secs 2/3/5/8; Finance → sec 7;
  Compliance → secs 5/8).
- The Corporate Secretariat BoD pack (UJ3) renders the document in this PPC layout.
- Enforce the PPC preparation rules: explicit amounts/limits/authorizations, no vague phrasing.

Optional but recommended: turn the Carbon Farming example into one realistic PAST recommendation in
the Knowledge Base (same structure), so a real PPC-style precedent appears in the grounding/citations.

Surgical & additive: update the document model + Drafting Agent output + draft resolution + review
checks + BoD pack rendering. Don't rebuild the journeys or other personas. After I approve the plan,
implement and show me a generated recommendation in the PPC format end-to-end.