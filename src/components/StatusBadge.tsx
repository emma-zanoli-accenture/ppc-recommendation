import type { RecommendationStatus } from '@/lib/types'
import { statusColors } from '@/lib/statusColors'

interface Props {
  status: RecommendationStatus
}

export default function StatusBadge({ status }: Props) {
  const c = statusColors[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} ${c.border} border text-xs px-2.5 py-0.5 rounded-full font-medium`}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
      {status}
    </span>
  )
}
