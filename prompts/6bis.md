Re-read CLAUDE.md. New cross-cutting feature: make it clear that Recopilot grounds its agents in an
INTERNAL KNOWLEDGE BASE of PAST RECOMMENDATIONS and their BoD resolutions. This directly addresses a
known pain point (today retrieval is manual and tacit; no structured reco↔resolution link). Use plan
mode: propose the data model + UI plan, implement after I approve.

1. Knowledge base (src/data): add a seed set of ~8–10 PAST recommendations, each with: title,
   business unit, date, a short summary, the regulatory refs involved, the linked BoD RESOLUTION and
   its OUTCOME (e.g. Approved / Approved with conditions / Deferred), and 2–3 reusable "precedent
   snippets" (pre-written clauses/wording). Make several relevant to the hero scenario (cross-border
   energy trading, REMIT/EMIR, PPA, hedging, Greece–Romania) so they can be cited on the golden path.

2. Grounding in the agents (scripted, deterministic — no live calls): when the Drafting Agent and
   the review agents run, they cite the precedents they're drawing on. In the AgentPanel, add a
   "Grounded in" / "Sources" section listing the cited past recommendations as CLICKABLE references
   (e.g. "Based on 3 past recommendations"). Clicking one opens a panel/drawer showing that
   precedent: summary, regulatory refs, and the BoD resolution outcome.
   - Drafting Agent: pre-fills template sections and suggestions "from precedent X" — tie some of the
     existing assisted-drafting suggestions (step 4b) to a specific past reco.
   - Review agents: reference how a similar past reco was handled (e.g. "REMIT disclosure was a
     condition in [past reco] — Approved with conditions").
   - Readiness Agent: can note precedent-based expectations for board-readiness.

3. Lightweight Knowledge Base view: a browsable/searchable list of the past recommendations
   (filter by business unit / regulatory ref), each opening the same precedent panel. Reachable from
   the app (e.g. a "Knowledge Base" entry), so the presenter can show the repo itself exists.
   Keep it read-only.

4. Reco↔resolution link: in each precedent, show the explicit link between the recommendation and
   its resulting BoD resolution + outcome — visually making the point that this link is now
   structured, not manual.

Constraints:
- Fully scripted/deterministic per CLAUDE.md — all precedents, citations and snippets are
  pre-written; no live retrieval. Keep it click-driven (no live typing/searching required to demo;
  searching the KB is optional flavor).
- Citations use the descriptive agent names (no code names) and live inside the shared AgentPanel
  pattern.
- Surgical and additive: enrich the existing agent outputs and add the KB view; do NOT rebuild the
  journeys. Downstream flow and shared-store behavior stay intact.
- Make at least the Drafting Agent (UJ1 step 1–2) and the Legal Review Agent (UJ2) visibly cite
  precedents on the hero path, since those are the demo's focal moments.

After I approve the plan, implement it and show me: the agent "Grounded in / Sources" citations, a
precedent panel with its BoD resolution outcome, and the Knowledge Base view.