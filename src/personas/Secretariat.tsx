import { motion } from 'framer-motion'
import { useRecoStore } from '@/store'
import RecoCard from '@/components/RecoCard'
import AgentPanel from '@/components/AgentPanel'
import ReadinessMeter from '@/components/ReadinessMeter'
import { readinessAgentScript } from '@/agents/scripts'
import type { RecommendationStatus } from '@/lib/types'

const PAGE = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.18 } }

const SECRETARIAT_STATUSES: RecommendationStatus[] = [
  'Submitted to Secretariat',
  'Ready for BoD',
  'Submitted to BoD',
]

function AvgReadinessMeter({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  return (
    <div className="flex flex-col items-center">
      <ReadinessMeter score={avg} size="md" showLabel />
      <p className="text-xs text-slate-400 mt-1">Avg readiness</p>
    </div>
  )
}

export default function Secretariat() {
  const recommendations = useRecoStore((s) => s.recommendations)

  const secretariatItems = recommendations.filter((r) => SECRETARIAT_STATUSES.includes(r.status))
  const allCompleted = recommendations.filter((r) => r.status === 'All Reviews Completed')

  const statusCounts = SECRETARIAT_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = recommendations.filter((r) => r.status === s).length
    return acc
  }, {})

  const scores = secretariatItems.map((r) => r.readinessScore)

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Corporate Secretariat</h1>
          <p className="text-slate-500 text-sm mt-1">Control tower · BoD submission pipeline</p>
        </div>
        <AvgReadinessMeter scores={scores} />
      </div>

      {/* Status tiles */}
      <div className="grid grid-cols-3 gap-4">
        {SECRETARIAT_STATUSES.map((s) => (
          <div key={s} className="bg-surface border border-border-subtle rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{statusCounts[s] ?? 0}</p>
            <p className="text-xs text-slate-500 mt-1">{s}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline items */}
        <div className="lg:col-span-2 space-y-6">
          {allCompleted.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Awaiting submission ({allCompleted.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allCompleted.map((r) => (
                  <RecoCard key={r.id} recommendation={r} />
                ))}
              </div>
            </div>
          )}

          {secretariatItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                In pipeline ({secretariatItems.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {secretariatItems.map((r) => (
                  <RecoCard key={r.id} recommendation={r} />
                ))}
              </div>
            </div>
          )}

          {secretariatItems.length === 0 && allCompleted.length === 0 && (
            <p className="text-slate-400 text-sm italic">No items in the BoD pipeline yet.</p>
          )}
        </div>

        {/* Readiness agent preview */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Readiness Agent — Preview</h2>
          <AgentPanel script={readinessAgentScript} />
          <p className="text-xs text-slate-400 italic text-center">Full UJ3 journey built in Step 6</p>
        </div>
      </div>
    </motion.div>
  )
}
