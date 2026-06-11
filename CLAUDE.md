# CLAUDE.md — Recopilot Demo

## What this is
Recopilot is a **demo** of an agentic platform that governs **Board of Directors (BoD) recommendations**
end-to-end. It is built for a prospect: **PPC** (Public Power Corporation S.A. / PPC Group), Greece's
largest electricity producer and supplier, which operates across **Greece and Romania**. This is a
sales demo, **not** production software.

> Note: PPC's real cross-border footprint (Greece–Romania) makes the golden-path scenario
> ("New cross-border energy trading agreement") read as plausibly real — lean into that.

## Prime directives (re-read these every time)
1. **Priorities:** clarity, visual impact, and value storytelling. The agentic system must be
   *clearly visible* "under the hood." Robustness on stage beats enterprise robustness.
2. **AI is fully scripted.** No live API calls, ever. All agent output comes from a typed,
   scripted engine that *plays back* reasoning steps + results with lifelike timing. The golden
   path must be 100% deterministic and instant.
3. **Language:** all UI and content in **English**.
4. **Audience is mixed** (Legal, IT, C-level) → balance governance, UX, and visible agentic tech.
5. **Don't over-engineer.** No backend, no auth, no database. Favor demo reliability and easy reset.

## Stack
- Vite + React + TypeScript
- Tailwind CSS
- Zustand for shared state (single source of truth)
- localStorage persistence + cross-tab sync; a **Reset Demo** action restores the seed
- framer-motion (agent thinking / transitions), lucide-react (icons)
- No backend. Runs locally via `npm run dev`.

## State & persistence
- **One shared store across all personas** → switching persona shows the same evolving data.
- Persists within a session (survives refresh; syncs across browser tabs via the `storage` event).
- **Resets at end of demo** via the Reset Demo control (clears storage, reseeds).

## Personas (3) + 1 touchpoint
1. **Business Unit (Procurement)** = *Recommendation Owners* lane — identify needs, draft recommendation
   & resolutions, collect supporting docs, define approval timing & reviewers, send for review,
   update on feedback, submit.
2. **Legal / Finance / Compliance (+ Chairman)** = *Reviewing Functions / Chairman* lane — review,
   comment or sign off, return for update. **The Chairman is a MANDATORY reviewer in this lane**
   (added to the reviewer set at step 6, provides sign-off at step 8) — *not* a 4th persona and *not*
   the identity of Persona 3.
3. **Corporate Secretariat (BoD Secretary)** = *BoD Secretary & Board* lane — control tower: notify
   secretary, completeness/readiness, prepare & distribute BoD pack, submit to BoD.
- **Direct-to-Chairman bypass** = a *de-emphasized en-passant branch* (Persona 1 may skip the review
  functions with a mandatory reason). It is **not** in the official map — keep it barely visible.
- Use a **prominent persona selector** in the top bar (this is how the presenter navigates).

> Drift note (being reconciled): the code currently labels Persona 3 "Chairman" and uses a
> `Submitted to Chairman` status. Per the official map these revert to **Corporate Secretariat** /
> **`Submitted to Secretariat`**, and the Chairman becomes a mandatory reviewer in Persona 2.

## The official process (SOURCE OF TRUTH — deck-faithful)
The AS-IS / TO-BE process maps in `reference/process-maps/` (asis.png, tobe_1–3.png) are the
authoritative spec. The demo must mirror the deck. **In scope: steps 1–14 (Phases 1–3), ending at
"Submitted to BoD".** **Phase 4 (steps 15–20: Board decision → clarification loop → validation →
receive/store/execute resolution, + the Clarification Co-Pilot) is OUT OF SCOPE — deferred, build
nothing for it.**

Three swimlanes → three personas (see Personas above):
Recommendation Owners → P1 · Reviewing Functions/Chairman → P2 · BoD Secretary & Board → P3.

**Phase 1 — Request initiation & drafting (P1)**
- 1 Identify business needs → **Knowledge Retrieval Assistant** (deck: "Historical Case Assistant") — retrieve similar past recos, research precedents
- 2 Assisted draft recommendation → **Recommendation Assistant** (deck: "Recommendation Co-Pilot"; renamed to avoid clashing with "Recopilot") — initial draft, guideline alignment, missing-info & improvement suggestions
- 3 Assisted draft resolutions → **Resolution Assistant** (alternative resolution options, similar past resolutions, impacts/dependencies)
- 4 Collect supporting documents → **Evidence Collection Assistant** (auto-retrieve docs, identify applicable policies/regs, flag missing evidence)

**Phase 2 — Review, feedback & finalization (P1 setup, P2 review)**
- 5 Define approval timing → **Review Planning Assistant** (timeline-based approval type, critical deadlines, schedule milestones)
- 6 Define reviewers (legal / compliance / financial / **Chairman — MANDATORY**) → **Review Workflow Assistant** (suggest reviewers by type & governance rules, engage & launch workflow, track progress & reminders)
- 7 Submit draft for review
- 8 Review recommendation (P2 — Legal/Finance/Compliance/Chairman; "possible multiple interactions"); decision *Content approved?* → 9a Yes: provide sign off · 9b No: return feedback → 10b Owner updates
- 10 Collect all formal sign-offs → **Approval Tracking Assistant** (real-time sign-off status, pending approvals & reminders, approval trail / audit log) + **Feedback Co-Pilot** (consolidate reviewer feedback, highlight key changes, assist revision)

**Phase 3 — Governance review & submission (P3) — demo ENDS here**
- 11 Notify secretary for approval · 12 Prepare Board package · 13 Distribute BoD materials · 14 Submit to Board → **Submitted to BoD**
- → **Governance Workflow Tracking** (Phase-3 portion only: workflow orchestration, package prep & distribution). Its Phase-4 functions (decision tracking, resolution repository) are out of scope.

## The agentic story (assistant taxonomy)
**Recopilot** is the product/orchestrator brand. Under the hood it coordinates a team of specialist
assistants. Use the **official deck names** (no code names); every AI moment is attributed to one of
them via the shared **AgentPanel**. Status of each vs the current code:

| Assistant (official name) | Step | Status in code |
|---|---|---|
| **Knowledge Retrieval Assistant** | 1 | KEEP — surface existing Knowledge Base + precedent grounding as a named step-1 moment (deck name: "Historical Case Assistant") |
| **Recommendation Assistant** | 2 | RENAME of the current *Drafting Agent* (recommendation body only). Deck calls it "Recommendation Co-Pilot" — renamed to avoid overlap with the platform brand "Recopilot" |
| **Resolution Assistant** | 3 | NEW — split the draft-resolution out of drafting; offer alternative options |
| **Evidence Collection Assistant** | 4 | NEW |
| **Review Planning Assistant** | 5 | NEW |
| **Review Workflow Assistant** | 6 | NEW — AI reviewer mapping incl. mandatory Chairman |
| **Legal / Finance / Compliance Review Agents** | 8 | KEEP — the function-specific detail of "Review recommendation" |
| **Approval Tracking Assistant** | 10 | KEEP/NAME — existing progressive SignatureBlock + audit log |
| **Feedback Co-Pilot** | 10b | EXTEND/NAME — existing "apply each comment" flow → consolidate all reviewers |
| **Governance Workflow Tracking** (Phase-3 portion) | 11–14 | KEEP/NAME — existing Secretariat pipeline + BoD pack/PDF (Readiness Agent folds in here) |
| Clarification Co-Pilot | Phase 4 | OUT OF SCOPE — deferred |

**Recopilot vs the step-2 drafting specialist:** the deck names the step-2 specialist
"Recommendation Co-Pilot", which overlaps confusingly with the platform/orchestrator brand
**Recopilot**. We therefore name it **Recommendation Assistant** in the demo. **Recopilot** stays the
orchestrator brand (the brand chip in Under-the-Hood); **Recommendation Assistant** is one of its
AgentBadge specialists, subtitled "drafting specialist" on first appearance.

Every AI moment uses the shared **AgentPanel**: agent identity + thinking animation + streamed
reasoning steps (as chips) + result. The **"Under the Hood"** toggle exposes the orchestration
(which assistant Recopilot called, inputs, steps, outputs). **Mirror the deck legend here:** the
**activity-type** tags (User activity / Fully automatic / Agentic support / ETRM-licensed-tool /
Reinvented-with-AI) and the **COGNITIVE LAYER** tags **Perceive / Reason / Act (P/R/A)** per
assistant action.

## Recommendation model
Fields: `id`, `title`, `businessNeed`, `businessUnit`, `owner`, `status`, `createdAt`,
`boardMeetingDate`, `bodDeadline` (~2 working days before the meeting), `regulatoryRefs[]`,
`contentSections`, `draftResolution` (mandatory — a reco is invalid without it),
`reviews { legal, finance, compliance, chairman: { status, reviewer, comments[] } }` (**Chairman is a
mandatory reviewer** — step 6/8), `readinessScore`, `directToChairman?: { reason }`, `auditLog[]`.

Status flow (in scope, ends at "Submitted to BoD"):
`Draft → Under Review → Returned for Update → All Reviews Completed → Submitted to Secretariat →
Ready for BoD → Submitted to BoD`
- "All Reviews Completed" requires all sign-offs **including the Chairman's**.
- Code reconciliation: rename the existing `Submitted to Chairman` status → **`Submitted to Secretariat`**.

Branch: **Send directly to Chairman** (bypasses the review functions) requires a *mandatory reason*.
This is **not in the official map** — keep it a *de-emphasized en-passant* option; do not dwell on it.

## Regulatory canon (PPC, cross-border energy trading)
Core references: **REMIT** (wholesale market integrity/transparency, ACER reporting),
**EMIR** (derivatives reporting/clearing), **ACER** oversight, **RAAEY** (Greek regulator,
successor to RAE) notification. Secondary flags: **MiFID II** classification, **HEnEx** /
market coupling. Use these in the Recommendation Assistant and Legal Review Agent output.

## Golden path (the hero scenario)
A single hardcoded recommendation: **"New cross-border energy trading agreement"** (Procurement),
realistic for PPC's Greece–Romania operations. It is **created live** during the demo (it is NOT in
the seed). Provide a **"Use example"** button that fills the pre-written business-need text so the
presenter doesn't type live.

Narrative thread (FILO LOGICO):
UJ1 up to step 3 → UJ2 (review) → back to UJ1 (step 4 onward) → finish UJ1 → UJ3 → Submitted to BoD.

## Seed data
~10–12 *other* recommendations in **mixed statuses** across business units (Procurement,
Regulatory Affairs, Finance/Treasury, IT, Operations, ESG, Legal/Compliance, HR) so the dashboards
feel alive. Plausible English content, consistent with a large utility (PPC). Plus a near-future
board meeting date that drives deadlines.

## Conventions
- Functional components + hooks; the store is the single source of truth.
- All AI flows through the scripted agent engine + AgentPanel (never ad-hoc inline text).
- Status color system; a brand accent vs a distinct **agentic accent** reserved for AI elements.
- Keep components small and composable; reuse RecoCard, StatusBadge, AgentBadge, ReadinessMeter,
  Timeline/AuditLog.
- Commit after each build step.

## Don't
- No live API / network calls. No backend, database, or auth.
- No 4th persona. The Chairman is a mandatory reviewer in Persona 2, not a persona. Keep the
  direct-to-Chairman bypass de-emphasized.
- Don't break golden-path determinism. Don't introduce real latency or anything that can fail live.
- No code names — assistants use the official deck names (Recommendation Assistant, Resolution
  Assistant, etc.); Recopilot stays the orchestrator brand.
- Don't build Phase 4 (steps 15–20 / Clarification Co-Pilot) — out of scope.

## Branding
Platform name: **Recopilot** — "your agentic copilot for board recommendations." Recopilot is the
orchestrator brand; the official assistants above (Knowledge Retrieval Assistant, Recommendation Assistant,
Resolution Assistant, etc.) are its specialists.
Client: **PPC** (PPC Group). Keep the client name in a single configurable constant for easy reuse.
Lockup: **"Recopilot · for PPC Group"**. Aim for a polished, modern legal-tech / control-tower
aesthetic.