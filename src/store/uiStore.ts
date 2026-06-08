import { create } from 'zustand'

export type Persona = 'bu' | 'review' | 'secretariat'

export const PERSONA_LABELS: Record<Persona, string> = {
  bu: 'Business Unit',
  review: 'Legal / Finance / Compliance',
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
    title: 'Step 1 — Create the recommendation',
    hint: 'Click "+ New Recommendation". On the form, click "Use example" to pre-fill the cross-border energy trading scenario — avoids live typing. Then click "Create & Draft".',
    switchHint: 'Next click: "Create & Draft"',
  },
  {
    persona: 'bu',
    title: 'Step 2 — Draft with the Drafting Agent',
    hint: 'Click "Run Drafting Agent". Watch it scaffold 7 sections, regulatory refs (REMIT, EMIR, ACER, RAAEY), and the draft resolution. Open "Under the Hood" to show the IT audience the orchestration. Then click "Send for Review".',
    switchHint: 'Next click: "Send for Review"',
  },
  {
    persona: 'bu',
    title: 'Step 3 — Send for review',
    hint: 'All three functions are pre-selected. Click "Send to 3 functions". Status moves to "Under Review". Switch persona to watch the reviews.',
    switchHint: '→ Switch to Legal / Finance / Compliance',
  },
  {
    persona: 'review',
    title: 'Step 4 — Specialist review',
    hint: 'Click the cross-border trading item (marked "New"). Run the Legal Review Agent — it flags REMIT/EMIR criticalities. Click "Return for Update". Then switch to Finance and Compliance tabs and click "Approve" on each.',
    switchHint: '→ Switch back to Business Unit',
  },
  {
    persona: 'bu',
    title: 'Step 5 — Review feedback & accept',
    hint: 'Click the recommendation showing "Returned for Update". Click "Review Feedback". Apply each of the 3 Legal comments with the "Apply" button — each updates the corresponding section. Once all resolved, click "Verify & accept version". Once all reviews complete, click "Submit to Secretariat".',
    switchHint: '→ Switch to Corporate Secretariat',
  },
  {
    persona: 'secretariat',
    title: 'Step 6 — Readiness check',
    hint: 'Find the cross-border trading item in "In pipeline". Click it, then click "Run Readiness Agent". The readiness score and completeness checklist populate. Note the BoD deadline countdown.',
    switchHint: 'Next click: "Generate BoD Pack"',
  },
  {
    persona: 'secretariat',
    title: 'Step 7 — BoD pack & submit',
    hint: 'Click "Generate BoD Pack". Then click "Download PDF" to show the formatted pack on screen. Optionally click "Share with Chairman" to show the touchpoint. Finally click "Submit to BoD" to complete the demo.',
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
  resetUI: () => set((s) => ({ resetKey: s.resetKey + 1, demoStep: 0, persona: 'bu', demoGuideOpen: true })),
}))

// Sync persona with the current demo step's persona suggestion
useUIStore.subscribe((state, prev) => {
  if (state.demoStep !== prev.demoStep) {
    // Auto-suggest persona switch but don't force it — presenter controls navigation
  }
})
