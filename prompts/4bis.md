Re-read CLAUDE.md. This refines the Business Unit "create → template → assisted drafting" flow
(UJ1 steps 1–2) to be demo-friendly: the presenter must NEVER have to type content live. Everything
typed is replaced by clicking pre-written content. Use plan mode: analyze the current create/draft
code, propose the plan, implement after I approve.

Make the flow click-driven and deterministic:

1. Business need: keep the text field but make the "Use example" button the primary path — one click
   fills "New cross-border energy trading agreement". The presenter never types here.

2. On submit, the Drafting Agent (shared AgentPanel) produces the PRECOMPILED TEMPLATE: structured
   sections with guideline-based phrasing, pre-seeded regulatory refs (REMIT, EMIR, ACER, RAAEY;
   MiFID II / HEnEx secondary), and a stub draft resolution. It reads as a template to be completed.

3. ASSISTED DRAFTING — fully click-driven, no live typing:
   - The Drafting Agent shows SUGGESTED INTEGRATIONS and INFORMATION GAPS as actionable cards/chips,
     each backed by PRE-WRITTEN content for the hero scenario.
   - Each item has an "Apply" button: clicking it inserts the pre-written text into the right section,
     animates the insertion (so it visibly looks like co-drafting), and marks the item resolved.
   - Add an "Apply all" / "Auto-complete draft" button that resolves every remaining suggestion and
     gap at once and fills the template into a complete draft — a safety valve to fast-forward during
     the demo.
   - Sections remain technically editable (in case someone wants to show it), but editing is OPTIONAL
     and never required to advance.
   - Show a small progress indicator (e.g. "3 of 5 suggestions applied", gaps remaining) so the
     audience sees the draft becoming complete and board-ready.

Constraints:
- Fully scripted/deterministic per CLAUDE.md — no live calls; all suggestion/gap/insert text is
  pre-written for "New cross-border energy trading agreement".
- Agentic moments stay in the shared AgentPanel, attributed to the "Drafting Agent" (no code names).
- Downstream unchanged: after the draft is complete, the existing "Send to control functions / Send
  directly to Chairman" step must still work and flow to the shared store as before.
- Surgical change: only the create → template → assisted-draft portion. Don't touch other personas
  or the rest of the journey.

After I approve the plan, implement it and show me the click-driven create + assisted-draft flow.