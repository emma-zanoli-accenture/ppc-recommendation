PROMPT (copy-paste)

Re-read CLAUDE.md. My colleagues produced the OFFICIAL AS-IS and TO-BE process maps — they are now
the SOURCE OF TRUTH for the process, and the demo must match the deck. The 4 screenshots are in
reference/process-maps/ (asis.png, tobe_1.png, tobe_2.png, tobe_3.png).

SCOPE: the demo ends at "Submitted to BoD". PHASE 4 (post-Board-decision: clarification loop,
validation, receive/store/execute resolution — steps 15–20, and the Clarification Co-Pilot) is OUT
OF SCOPE — build nothing for it, just note it as deferred.

Use plan mode. This turn is READ-ONLY analysis: view the 4 images AND read the codebase, then
produce a written GAP ANALYSIS + RECONCILIATION PLAN. Do NOT change any code.

THE OFFICIAL PROCESS (authoritative; verify wording against the images). Three swimlanes:
Recommendation Owners | Reviewing Functions/Chairman | BoD Secretary & Board. IN-SCOPE steps 1–14:

PHASE 1 — Request initiation & recommendation drafting (Recommendation Owners)
  1 Identify business needs → Historical Case Assistant (retrieve similar past recommendations,
    research precedents)
  2 Assisted Draft recommendation → Recommendation Co-Pilot (generate initial draft, check alignment
    with predefined guidelines, highlight missing info, suggest improvements)
  3 Assisted Draft resolutions → Resolution Assistant (suggest alternative resolution options,
    retrieve similar past resolutions, highlight impacts/dependencies, support evaluation)
  4 Collect supporting documents → Evidence Collection Assistant (auto-retrieve supporting docs,
    identify applicable policies/regulations, highlight missing evidence)

PHASE 2 — Review, feedback & finalization
  5 Define approval timing → Review Planning Assistant (suggest timeline-based approval type,
    identify critical deadlines, auto-schedule review milestones)
  6 Define reviewers (legal / compliance / financial / Chairman — CHAIRMAN MANDATORY)
    → Review Workflow Assistant (suggest reviewers by type & governance rules, auto-engage & launch
    review workflow, track progress & send reminders)
  7 Submit draft for review
  8 Review recommendation (Reviewing Functions/Chairman; "possible multiple interactions");
    decision "Content approved?": 9a Yes → Provide sign off; 9b No → Return feedback
  10b Update recommendation based on feedback (Owners)
  10 Collect all formal sign from all reviewers
    → Approval Tracking Assistant (track sign-off status real time, identify pending approvals & send
    reminders, maintain approval trail & audit log)
    → Feedback Co-Pilot (consolidate reviewer feedback into single view, highlight key comments &
    required changes, suggest updates & assist document revision)

PHASE 3 — Governance review & submission (BoD Secretary & Board) — demo ENDS here
  11 Notify secretary for approval
  12 Prepare Board package
  13 Distribute BoD materials to board members
  14 Submit/hand package to the BOARD OF DIRECTORS → final status "Submitted to BoD"
    → Governance Workflow Tracking — PHASE-3 PORTION ONLY (workflow orchestration, board package
    preparation & distribution). Its Phase-4 functions (decision tracking, resolution repository)
    are out of scope.

AS-IS pain points the TO-BE removes (use to tell the value story per in-scope step): reliance on
individual expertise / no standardized format; manual rework / no version control; untracked feedback
/ ping-pong iterations; manual sign-off collection / no visibility on pending approvals; manual
package prep & distribution.

Deck legend to mirror in the "Under the Hood" view: activity types (User activity / Fully automatic /
Agentic support / ETRM-licensed-tool / Reinvented-with-AI) and the COGNITIVE LAYER tags
Perceive / Reason / Act (P/R/A) per assistant action.

PRODUCE (text only):
1. Swimlane → persona mapping (Owners ≈ Business Unit; Reviewing Functions/Chairman ≈ Legal/Finance/
   Compliance; BoD Secretary & Board ≈ Corporate Secretariat). Confirm or correct.
2. ASSISTANT RECONCILIATION table: map our current interim agents (Drafting / Legal / Finance /
   Compliance Review / Readiness) to the official in-scope assistants. Recommend ADOPTING the
   official names. Note what we keep (precedent grounding ≈ Historical Case Assistant; progressive
   signatures ≈ Approval Tracking Assistant audit trail) and what's new (Resolution Assistant,
   Evidence Collection Assistant, Review Planning Assistant, Review Workflow Assistant, Feedback
   Co-Pilot, Governance Workflow Tracking [Phase-3 portion]). Flag the "Recommendation Co-Pilot" vs
   platform name "Recopilot" overlap and propose how to handle it.
3. STEP-BY-STEP GAP LIST for steps 1–14: has it / partial / missing + proposed change. Call out the
   NEW pieces: separate Draft resolutions step, Collect supporting documents, Define approval timing,
   AI reviewer mapping. Confirm Phase 4 (15–20) stays unbuilt.
4. SCOPE DECISIONS with your recommendation: (a) adopt the full official assistant taxonomy for
   phases 1–3? (b) Chairman as MANDATORY reviewer (per map) vs our current touchpoint + en-passant
   skip — how to reconcile?
5. STATUS-FLOW update to match phases 1–3, still ending at "Submitted to BoD".
6. Surgical implementation plan ordered by priority, separating "needed for deck-faithfulness" from
   "nice to have".

SEQUENCING: after you present this, I'll give you my scope decisions. Your VERY NEXT action will be
to update CLAUDE.md ONLY (no other code). Do not implement until I approve the revised CLAUDE.md.
Order: (A) this analysis → (B) my decisions → (C) update CLAUDE.md only → (D) my approval →
(E) implementation in later steps.

Do NOT change code. Present the gap analysis + plan and wait.