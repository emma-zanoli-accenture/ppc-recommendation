import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRecoStore } from '@/store'
import RecoCard from '@/components/RecoCard'
import AgentPanel from '@/components/AgentPanel'
import { legalReviewAgentScript, financeReviewAgentScript, complianceReviewAgentScript } from '@/agents/scripts'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.18 } }

type Fn = 'legal' | 'finance' | 'compliance'
const FN_LABELS: Record<Fn, string> = { legal: 'Legal', finance: 'Finance', compliance: 'Compliance' }
const FN_SCRIPTS = { legal: legalReviewAgentScript, finance: financeReviewAgentScript, compliance: complianceReviewAgentScript }

export default function ReviewFunctions() {
  const [activeFn, setActiveFn] = useState<Fn>('legal')
  const recommendations = useRecoStore((s) => s.recommendations)

  const inReview = recommendations.filter(
    (r) => r.status === 'Under Review' || r.status === 'Returned for Update'
  )

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Legal / Finance / Compliance</h1>
        <p className="text-slate-500 text-sm mt-1">Specialist review functions</p>
      </div>

      {/* Function tabs */}
      <div className="flex gap-1 bg-surface-raised rounded-xl p-1 w-fit border border-border-subtle">
        {(Object.keys(FN_LABELS) as Fn[]).map((fn) => (
          <button
            key={fn}
            onClick={() => setActiveFn(fn)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFn === fn ? 'bg-brand text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-surface'
            }`}
          >
            {FN_LABELS[fn]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items awaiting this function */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Items awaiting {FN_LABELS[activeFn]} review ({inReview.length})
          </h2>
          {inReview.length === 0 ? (
            <p className="text-slate-400 text-sm italic">No items currently under review.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {inReview.map((r) => (
                <RecoCard key={r.id} recommendation={r} />
              ))}
            </div>
          )}
        </div>

        {/* Agent preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {FN_LABELS[activeFn]} Review Agent — Preview
          </h2>
          <AgentPanel key={activeFn} script={FN_SCRIPTS[activeFn]} />
          <p className="text-xs text-slate-400 italic text-center">Full UJ2 journey built in Step 5</p>
        </div>
      </div>
    </motion.div>
  )
}
