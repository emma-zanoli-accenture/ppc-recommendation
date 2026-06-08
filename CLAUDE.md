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
1. **Business Unit (Procurement)** — create, draft, send for review, update, submit.
2. **Legal / Finance / Compliance** — review, comment or approve, return for update.
3. **Corporate Secretariat** — control tower: monitor, completeness/readiness, BoD pack, submit to BoD.
- **Chairman** = a *touchpoint shown* inside Persona 3 (a modal), **NOT** a 4th persona/journey.
- Use a **prominent persona selector** in the top bar (this is how the presenter navigates).

## The agentic story
**Recopilot** is the product/orchestrator brand. Under the hood it coordinates a team of specialist
agents. Use **plain, descriptive agent names — no code names**; every AI moment is attributed to one
of them:
- **Drafting Agent** — precompiled template, regulatory scaffolding, the mandatory draft resolution,
  drafting suggestions, gap detection. (Persona 1)
- **Legal Review Agent** — EMIR / REMIT / ACER / RAAEY analysis, criticalities, suggested
  integrations. (Persona 2 — Legal)
- **Finance Review Agent** — budget coverage, financial impact. (Persona 2 — Finance)
- **Compliance Review Agent** — policy / governance fit. (Persona 2 — Compliance)
- **Readiness Agent** — completeness check, readiness score, residual gaps, BoD pack assembly.
  (Persona 3)

Every AI moment uses a shared **AgentPanel**: agent identity + thinking animation + streamed
reasoning steps (as chips) + result. Add an **"Under the Hood"** toggle that exposes the
orchestration (which agent Recopilot called, inputs, steps, outputs) for the IT audience.

## Recommendation model
Fields: `id`, `title`, `businessNeed`, `businessUnit`, `owner`, `status`, `createdAt`,
`boardMeetingDate`, `bodDeadline` (~2 working days before the meeting), `regulatoryRefs[]`,
`contentSections`, `draftResolution` (mandatory — a reco is invalid without it),
`reviews { legal, finance, compliance: { status, reviewer, comments[] } }`, `readinessScore`,
`directToChairman?: { reason }`, `auditLog[]`.

Status flow:
`Draft → Under Review → Returned for Update → All Reviews Completed → Submitted to Secretariat →
Ready for BoD → Submitted to BoD`

Branch: **Send directly to Chairman** (bypasses the review functions) requires a *mandatory reason*.
Show this *en passant* — do not dwell on it.

## Regulatory canon (PPC, cross-border energy trading)
Core references: **REMIT** (wholesale market integrity/transparency, ACER reporting),
**EMIR** (derivatives reporting/clearing), **ACER** oversight, **RAAEY** (Greek regulator,
successor to RAE) notification. Secondary flags: **MiFID II** classification, **HEnEx** /
market coupling. Use these in the Drafting Agent and Legal Review Agent output.

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
- No 4th persona. Don't make direct-to-Chairman prominent.
- Don't break golden-path determinism. Don't introduce real latency or anything that can fail live.
- No agent code names — agents are named by what they do (Drafting Agent, Legal Review Agent, etc.).

## Branding
Platform name: **Recopilot** — "your agentic copilot for board recommendations." Recopilot is the
orchestrator brand; the descriptive agents above are its specialists.
Client: **PPC** (PPC Group). Keep the client name in a single configurable constant for easy reuse.
Lockup: **"Recopilot · for PPC Group"**. Aim for a polished, modern legal-tech / control-tower
aesthetic.