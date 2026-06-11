import { create } from 'zustand'

export type Persona = 'bu' | 'review' | 'secretariat'

export const PERSONA_LABELS: Record<Persona, string> = {
  bu: 'Business Unit',
  review: 'Legal / Finance / Compliance / Chairman',
  secretariat: 'Corporate Secretariat',
}

export interface DemoStep {
  persona: Persona
  title: string
  hint: string
  switchHint?: string
}

export const DEMO_STEPS: DemoStep[] = [
  {
    persona: 'bu',
    title: 'Step 1 — Identify the need (Knowledge Retrieval Assistant)',
    hint: 'Click "+ New Recommendation". On the form, click "Use example" to pre-fill the cross-border energy trading scenario. The Knowledge Retrieval Assistant retrieves similar past recommendations as precedent. Then click "Create & Draft".',
    switchHint: 'Next click: "Create & Draft"',
  },
  {
    persona: 'bu',
    title: 'Step 2 — Draft (Recommendation Assistant + Resolution Assistant)',
    hint: 'Run the Recommendation Assistant — it scaffolds the 11-section εισήγηση and regulatory refs (REMIT, EMIR, ACER, RAAEY), but leaves section 10 (the resolution) as a blank placeholder. Then run the Resolution Assistant — it proposes the resolution options and writes the recommended wording into section 10. Then run the Evidence Collection Assistant — it searches the document repository, ranks matches, and flags missing evidence; click "Attach all recommended" to bundle the supporting documents into the recommendation (they appear under Related Documents / Attachments and are viewable in preview). Open "Under the Hood" to show the orchestration + P/R/A cognitive layer. Then click "Send for Review".',
    switchHint: 'Next click: "Send for Review"',
  },
  {
    persona: 'bu',
    title: 'Step 3 — Plan & route review (Review Planning + Review Workflow)',
    hint: 'The Review Planning Assistant suggests the approval timing; the Review Workflow Assistant maps reviewers. Legal, Finance, Compliance and the Chairman (mandatory) are pre-selected. Click "Send for review". Status moves to "Under Review". Switch persona to run the reviews.',
    switchHint: '→ Switch to Legal / Finance / Compliance / Chairman',
  },
  {
    persona: 'review',
    title: 'Step 4 — Review & sign-off',
    hint: 'Open the cross-border item (marked "New"). Run the Legal Review Agent — it flags REMIT/EMIR criticalities; click "Return for Update". Then on the Finance, Compliance and Chairman tabs, click "Approve" on each (Chairman sign-off is mandatory).',
    switchHint: '→ Switch back to Business Unit',
  },
  {
    persona: 'bu',
    title: 'Step 5 — Consolidate feedback & accept (Feedback Co-Pilot)',
    hint: 'Open the "Returned for Update" item, click "Review Feedback". The Feedback Co-Pilot consolidates the comments — apply each of the 3 Legal comments, then click "Verify & accept version". Once all reviews (incl. Chairman) are complete, click "Submit to Secretariat".',
    switchHint: '→ Switch to Corporate Secretariat',
  },
  {
    persona: 'secretariat',
    title: 'Step 6 — Readiness check (Governance Workflow Tracking)',
    hint: 'Find the cross-border item in "In pipeline". Open it, then run the Readiness Agent. The readiness score and completeness checklist populate. Note the BoD deadline countdown.',
    switchHint: 'Next click: "Generate BoD Pack"',
  },
  {
    persona: 'secretariat',
    title: 'Step 7 — Prepare, distribute & submit to BoD',
    hint: 'Click "Generate BoD Pack", then "Download PDF" to show the formatted pack. Optionally "Share with Chairman" to show the touchpoint. Finally click "Submit to BoD" to complete the demo.',
    switchHint: 'Demo complete ✓',
  },
]

interface UIStore {
  persona: Persona
  setPersona: (p: Persona) => void
  demoGuideOpen: boolean
  toggleDemoGuide: () => void
  setDemoGuideOpen: (open: boolean) => void
  demoStep: number
  setDemoStep: (n: number) => void
  advanceDemoStep: () => void
  retreatDemoStep: () => void
  // Increments on every full reset — used as key in App.tsx to remount persona components
  resetKey: number
  resetUI: () => void
  kbOpen: boolean
  setKbOpen: (v: boolean) => void
  openPrecedentId: string | null
  setOpenPrecedentId: (id: string | null) => void
  openDocumentId: string | null
  setOpenDocumentId: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  persona: 'bu',
  setPersona: (p) => set({ persona: p }),

  demoGuideOpen: true,
  toggleDemoGuide: () => set((s) => ({ demoGuideOpen: !s.demoGuideOpen })),
  setDemoGuideOpen: (open) => set({ demoGuideOpen: open }),

  demoStep: 0,
  setDemoStep: (n) => set({ demoStep: n }),
  advanceDemoStep: () => set((s) => ({ demoStep: Math.min(s.demoStep + 1, DEMO_STEPS.length - 1) })),
  retreatDemoStep: () => set((s) => ({ demoStep: Math.max(s.demoStep - 1, 0) })),

  resetKey: 0,
  resetUI: () => set((s) => ({ resetKey: s.resetKey + 1, demoStep: 0, persona: 'bu', demoGuideOpen: true, kbOpen: false, openPrecedentId: null, openDocumentId: null })),

  kbOpen: false,
  setKbOpen: (v) => set({ kbOpen: v }),

  openPrecedentId: null,
  setOpenPrecedentId: (id) => set({ openPrecedentId: id }),

  openDocumentId: null,
  setOpenDocumentId: (id) => set({ openDocumentId: id }),
}))

// Sync persona with the current demo step's persona suggestion
useUIStore.subscribe((state, prev) => {
  if (state.demoStep !== prev.demoStep) {
    // Auto-suggest persona switch but don't force it — presenter controls navigation
  }
})
