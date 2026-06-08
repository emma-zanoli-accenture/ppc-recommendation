# Recopilot — Demo for PPC Group

An agentic platform demo for governing Board of Directors recommendations end-to-end, built for **PPC Group** (Public Power Corporation S.A., Greece).

## Run

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**. No backend, no API keys, no auth required.

## Reset between demos

Click **Reset** in the top-right of the app. This restores the seed data, clears all personas back to their dashboards, and returns the Demo Guide to Step 1.

## Recommended demo narrative

The golden path follows one hero recommendation: **"New cross-border energy trading agreement"** — a PPC Greece–Romania scenario involving REMIT, EMIR, ACER, and RAAEY regulatory requirements.

### Narrative thread (FILO LOGICO)

| # | Persona | Action |
|---|---|---|
| 1 | Business Unit | Click **+ New Recommendation** → **Use example** → **Create & Draft** |
| 2 | Business Unit | Click **Run Drafting Agent** → show "Under the Hood" for IT audience → **Send for Review** |
| 3 | Business Unit | Click **Send to 3 functions** → switch persona |
| 4 | Legal / Finance / Compliance | Open the cross-border item (marked **New**) → run **Legal Review Agent** → click **Return for Update** → switch to Finance & Compliance tabs → **Approve** each |
| 5 | Business Unit | Open the returned item → **Address Feedback** → **Apply suggested update ↗** → **Save & Resubmit** → once all reviews complete, **Submit to Secretariat** → switch persona |
| 6 | Corporate Secretariat | Open the item in pipeline → **Run Readiness Agent** → review score and checklist |
| 7 | Corporate Secretariat | **Generate BoD Pack** → **Download PDF** → optionally **Share with Chairman** → **Submit to BoD** |

The **Demo Guide** (top-right "Guide" button) walks through each step with exact click instructions.

## Personas

| Persona | Role | Person |
|---|---|---|
| Business Unit | Procurement author | D. Papadopoulos |
| Legal / Finance / Compliance | Reviewer functions | M. Stavrou · K. Economou · A. Nikolaou |
| Corporate Secretariat | Control tower | P. Georgiou |

> The Chairman is a **touchpoint** shown inside Secretariat (Step 7 modal), not a separate persona.

## Agentic "Under the Hood"

Every AI action is fully scripted — zero live API calls, 100% deterministic. Click **Under the Hood** on any AgentPanel to expose the orchestration view showing which Recopilot agent ran, its inputs, reasoning steps, and structured output. This is designed for the IT audience in the room.

| Agent | Persona | What it does |
|---|---|---|
| Drafting Agent | Business Unit | Scaffolds 7 sections, regulatory refs, draft resolution |
| Legal Review Agent | Legal | REMIT / EMIR / ACER / RAAEY analysis, criticalities |
| Finance Review Agent | Finance | Budget coverage, financial impact, FX risk |
| Compliance Review Agent | Compliance | Policy and governance fit |
| Readiness Agent | Secretariat | Completeness score, residual gaps, BoD pack assembly |

## Stack

Vite · React · TypeScript · Tailwind CSS v3 · Zustand · framer-motion · jsPDF · lucide-react
