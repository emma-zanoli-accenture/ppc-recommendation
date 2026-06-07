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
    hint: 'Click "New Recommendation". Use the "Use example" button to prefill the cross-border energy trading scenario — avoids live typing.',
    switchHint: 'Stay on Business Unit',
  },
  {
    persona: 'bu',
    title: 'Step 2 — Draft with Recopilot',
    hint: 'Click "Draft with Recopilot" to run the Drafting Agent. Watch it scaffold all 7 sections, regulatory references (REMIT, EMIR, ACER, RAAEY), and the mandatory draft resolution.',
    switchHint: 'Stay on Business Unit',
  },
  {
    persona: 'bu',
    title: 'Step 3 — Send for review',
    hint: 'Send to Legal, Finance, and Compliance. Then switch persona to see the review happen.',
    switchHint: '→ Switch to Legal / Finance / Compliance',
  },
  {
    persona: 'review',
    title: 'Step 4 — Specialist review',
    hint: 'Each function runs their agent: Legal Review Agent (REMIT/EMIR criticalities), Finance Review Agent (budget, FX), Compliance Review Agent (policy checks). Each approves or returns.',
    switchHint: '→ Switch back to Business Unit',
  },
  {
    persona: 'bu',
    title: 'Step 5 — Address feedback & submit',
    hint: 'Address any returned items and resubmit. Once all reviews are complete, submit to the Corporate Secretariat.',
    switchHint: '→ Switch to Corporate Secretariat',
  },
  {
    persona: 'secretariat',
    title: 'Step 6 — Readiness check',
    hint: 'Run the Readiness Agent: it scores completeness, flags residual gaps, and shows the BoD deadline countdown.',
    switchHint: 'Stay on Corporate Secretariat',
  },
  {
    persona: 'secretariat',
    title: 'Step 7 — Assemble BoD pack & submit',
    hint: 'Generate the BoD pack (6 documents). Confirm the Chairman touchpoint if needed. Submit to the Board of Directors.',
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
}))

// Sync persona with the current demo step's persona suggestion
useUIStore.subscribe((state, prev) => {
  if (state.demoStep !== prev.demoStep) {
    // Auto-suggest persona switch but don't force it — presenter controls navigation
  }
})
