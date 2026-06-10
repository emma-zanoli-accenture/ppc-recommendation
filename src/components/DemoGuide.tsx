import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Users, Scale, Crown } from 'lucide-react'
import { useUIStore, DEMO_STEPS, type Persona } from '@/store/uiStore'

const PERSONA_ICONS: Record<Persona, React.ElementType> = {
  bu: Users,
  review: Scale,
  secretariat: Crown,
}

const PERSONA_LABELS: Record<Persona, string> = {
  bu: 'Recommendation Owner',
  review: 'Reviewers',
  secretariat: 'Chairman',
}

export default function DemoGuide() {
  const { demoGuideOpen, setDemoGuideOpen, demoStep, advanceDemoStep, retreatDemoStep, setPersona } =
    useUIStore()

  const step = DEMO_STEPS[demoStep]
  const Icon = PERSONA_ICONS[step.persona]
  const total = DEMO_STEPS.length

  return (
    <AnimatePresence>
      {demoGuideOpen && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          className="fixed right-0 top-16 bottom-0 w-72 bg-surface border-l border-border-subtle shadow-xl z-30 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Demo Guide</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Step {demoStep + 1} of {total}
              </p>
            </div>
            <button
              onClick={() => setDemoGuideOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-surface-raised">
            <motion.div
              className="h-full bg-brand"
              animate={{ width: `${((demoStep + 1) / total) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={demoStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="space-y-4"
              >
                {/* Persona chip */}
                <button
                  onClick={() => setPersona(step.persona)}
                  className="inline-flex items-center gap-1.5 bg-brand-subtle text-brand text-xs font-medium px-2.5 py-1 rounded-full border border-brand/20 hover:bg-brand hover:text-white transition-all"
                  title="Click to switch to this persona"
                >
                  <Icon className="w-3 h-3" />
                  {PERSONA_LABELS[step.persona]}
                </button>

                {/* Step title */}
                <h3 className="font-semibold text-slate-800 leading-snug">{step.title}</h3>

                {/* Hint */}
                <p className="text-sm text-slate-600 leading-relaxed">{step.hint}</p>

                {/* Switch hint */}
                {step.switchHint && (
                  <div className="bg-surface-raised rounded-lg px-3 py-2 text-xs text-slate-500 border border-border-subtle">
                    {step.switchHint}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step navigation */}
          <div className="border-t border-border-subtle px-4 py-3 flex items-center justify-between">
            <button
              onClick={retreatDemoStep}
              disabled={demoStep === 0}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>

            {/* Dot indicators */}
            <div className="flex gap-1">
              {DEMO_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => useUIStore.getState().setDemoStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === demoStep ? 'bg-brand w-3' : 'bg-border-strong hover:bg-brand/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={advanceDemoStep}
              disabled={demoStep === total - 1}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
