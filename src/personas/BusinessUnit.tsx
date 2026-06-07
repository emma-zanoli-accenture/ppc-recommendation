import { motion } from 'framer-motion'
import { useRecoStore } from '@/store'
import RecoCard from '@/components/RecoCard'
import AgentPanel from '@/components/AgentPanel'
import { draftingAgentScript } from '@/agents/scripts'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.18 } }

export default function BusinessUnit() {
  const recommendations = useRecoStore((s) => s.recommendations)

  const statuses = recommendations.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Business Unit</h1>
          <p className="text-slate-500 text-sm mt-1">Procurement · My recommendations</p>
        </div>
        <button
          disabled
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
          title="Full journey in Step 4"
        >
          + New Recommendation
        </button>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statuses).map(([status, count]) => (
          <span key={status} className="bg-surface-raised text-slate-600 text-xs px-3 py-1 rounded-full border border-border-subtle">
            {count} · {status}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">All Recommendations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((r) => (
              <RecoCard key={r.id} recommendation={r} />
            ))}
          </div>
        </div>

        {/* Agent preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Drafting Agent — Preview</h2>
          <AgentPanel script={draftingAgentScript} />
          <p className="text-xs text-slate-400 italic text-center">Full UJ1 journey built in Step 4</p>
        </div>
      </div>
    </motion.div>
  )
}
