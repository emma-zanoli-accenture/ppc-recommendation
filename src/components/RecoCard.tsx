import { motion } from 'framer-motion'
import { daysUntil } from '@/lib/utils'
import { statusColors } from '@/lib/statusColors'
import StatusBadge from './StatusBadge'
import ReadinessMeter from './ReadinessMeter'
import type { Recommendation } from '@/lib/types'

interface Props {
  recommendation: Recommendation
  onClick?: () => void
  index?: number
}

const REVIEW_LABELS = { legal: 'Legal', finance: 'Finance', compliance: 'Compliance' }

const REVIEW_STATUS_CLASSES: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-400 border-slate-200',
  'In Review': 'bg-blue-50 text-blue-600 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Returned: 'bg-amber-50 text-amber-600 border-amber-200',
}

function DeadlineChip({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr)
  let cls = 'text-slate-500'
  let label = `${days}d`
  if (days < 0) { cls = 'text-red-600 font-semibold'; label = 'Overdue' }
  else if (days <= 7) cls = 'text-red-500 font-medium'
  else if (days <= 14) cls = 'text-amber-600'
  return (
    <span className={`text-[11px] ${cls}`}>BoD in {label}</span>
  )
}

export default function RecoCard({ recommendation: r, onClick, index = 0 }: Props) {
  const c = statusColors[r.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onClick}
      className={`bg-surface border border-border-subtle rounded-xl p-4 flex flex-col gap-3 transition-all duration-150 ${onClick ? 'cursor-pointer hover:border-brand/40 hover:shadow-md hover:-translate-y-0.5' : ''}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <StatusBadge status={r.status} />
        <span className="text-[11px] text-slate-400 font-medium shrink-0">{r.businessUnit}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{r.title}</h3>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-auto pt-1">
        {/* Review chips */}
        <div className="flex items-center gap-1">
          {(Object.keys(REVIEW_LABELS) as (keyof typeof REVIEW_LABELS)[]).map((fn) => {
            const status = r.reviews[fn].status
            return (
              <span
                key={fn}
                title={`${REVIEW_LABELS[fn]}: ${status}`}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${REVIEW_STATUS_CLASSES[status] ?? REVIEW_STATUS_CLASSES.Pending}`}
              >
                {REVIEW_LABELS[fn]}
              </span>
            )
          })}
        </div>

        {/* Readiness + deadline */}
        <div className="flex items-center gap-3">
          <DeadlineChip dateStr={r.bodDeadline} />
          <ReadinessMeter score={r.readinessScore} size="sm" />
        </div>
      </div>
    </motion.div>
  )
}
