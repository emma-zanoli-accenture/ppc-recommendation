Re-read CLAUDE.md. This refines the Business Unit "address feedback → update → final acceptance"
part of UJ1 (steps 6–7). The "Address feedback" button is fine — keep it as the entry point. Use
plan mode: analyze the current update/accept code, propose the plan, implement only after I approve.

PHASE A — Analyze first (no changes): find and read the code that runs after the Business Owner
clicks "Address feedback" — how Legal comments are shown, how the recommendation is updated, and
how/whether it reaches a final accepted state. Summarize what it does today and where it diverges
from the intended flow below.

INTENDED flow (must be click-driven — the presenter never types live):

Step 6 — UPDATE the recommendation (integrate Legal comments):
- After "Address feedback", show the Legal comments / change requests anchored to the relevant
  sections of the document.
- Each comment has an "Apply suggested change" (Resolve) button backed by PRE-WRITTEN revised text
  for the hero scenario. Clicking it:
  - inserts the revised wording into the right section,
  - HIGHLIGHTS THE CHANGE (visible diff/highlight on the edited text),
  - MARKS THE COMMENT RESOLVED (checkmark / struck-through / moved to a "resolved" list),
  - animates the edit so it visibly looks like the recommendation is being updated in real time.
- Reuse the same "Apply" card/chip pattern and animation used in the assisted-drafting step (4b),
  for visual consistency.
- Show a progress indicator (e.g. "2 of 3 Legal comments addressed").
- Add an "Address all" safety valve that applies every remaining comment at once — to fast-forward
  during the demo. Sections stay technically editable, but editing is OPTIONAL and never required.

Step 7 — FINAL ACCEPTANCE:
- Once all comments are resolved, enable a "Verify & accept version" action that shows a short
  final-content review (e.g. "X changes integrated, all Legal comments resolved").
- Accepting sets status to "All Reviews Completed" and writes the audit log.

Constraints:
- Fully scripted/deterministic per CLAUDE.md — no live calls; all revised text and comments are
  pre-written for "New cross-border energy trading agreement".
- Any agentic assistance stays in the shared AgentPanel, attributed to the "Drafting Agent"
  (no code names).
- Downstream unchanged: after acceptance, the existing "Submit to Corporate Secretariat" step
  (UJ1 step 9) must still work and flow to the shared store as before.
- Keep consistent with how Legal feedback is produced in UJ2 — the comments shown here must match
  the ones the Legal Review Agent returns.
- Surgical change: only the address-feedback → update → final-acceptance portion. Don't touch other
  personas or the rest of the journey.

After I approve the plan, implement it and show me the updated address-feedback → accept flow.