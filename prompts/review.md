Re-read CLAUDE.md, then act as an expert reviewer of the whole Recopilot demo. Do NOT change any
code in this turn — analysis and written feedback only. (Use plan mode / read-only: read the codebase
and reason; produce findings as text. I'll decide afterwards what, if anything, to action.)

Wear three hats at once:
1. A board-governance / corporate-secretary expert who knows how PPC recommendations actually move
   (drafting → Legal/Finance/Compliance review → approvals/co-signatures → Corporate Secretariat →
   BoD), including the real PPC document structure and the Chairman's discretion.
2. A business/process analyst judging whether the end-to-end flow makes logical sense.
3. A product/UX + frontend reviewer judging clarity, consistency, and demo-readiness.

Review the app as a WHOLE, end to end, across all three personas and the full hero golden path
(create → template → assisted drafting → send to functions → review → return → address feedback →
accept → submit to secretariat → readiness → BoD pack → submit to BoD), plus the cross-cutting pieces
(knowledge base / precedent grounding, progressive signatures, PPC document fidelity).

Specifically hunt for:
- LOGICAL / BUSINESS-SENSE issues: steps that don't follow, state that doesn't propagate across
  personas, statuses used inconsistently, approvals/signatures that don't reflect everywhere, the
  direct-to-Chairman path behaving wrong, deadlines/readiness that don't add up, anything a PPC
  governance person would find unrealistic or out of order.
- NARRATIVE issues: places where the demo story (UJ1 → UJ2 → UJ1 → UJ3) would confuse or underwhelm
  a mixed Legal/IT/C-level audience, or where the "agentic / under-the-hood" value isn't clear.
- CONSISTENCY issues: agent naming, terminology, document sections, the PPC format, the
  reco↔resolution link, audit log completeness.
- UX / polish issues that would hurt a live presentation.
- Anything that contradicts CLAUDE.md (e.g. residual code names, live calls, required live typing).

Output format (text only):
- A short overall assessment (is the end-to-end logic sound? is it demo-ready?).
- Findings grouped by area, each with: severity (High / Medium / Low), where it occurs (file or
  screen / journey step), why it's a problem in business/governance terms, and a concrete suggested
  fix.
- Order findings by priority. Be specific and critical — surface real issues, don't reassure me.
- Separate genuine bugs/logic errors from subjective "would be nicer" suggestions.
- End with a tight shortlist: the top 3–5 things most worth fixing before the demo.

Do not modify code. Wait for my decision on which findings to action.