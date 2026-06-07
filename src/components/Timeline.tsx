import { relativeTime } from '@/lib/utils'
import type { AuditEntry } from '@/lib/types'

interface Props {
  entries: AuditEntry[]
  maxItems?: number
}

const ROLE_COLORS: Record<string, string> = {
  AI: 'bg-agent',
  Legal: 'bg-blue-400',
  Finance: 'bg-emerald-400',
  Compliance: 'bg-violet-400',
  System: 'bg-slate-300',
  'Corporate Secretariat': 'bg-brand',
}

function dotColor(role: string): string {
  return ROLE_COLORS[role] ?? 'bg-slate-400'
}

export default function Timeline({ entries, maxItems }: Props) {
  const sorted = [...entries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems)

  if (sorted.length === 0) {
    return <p className="text-sm text-slate-400 italic">No activity yet.</p>
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border-subtle" />

      <div className="space-y-4">
        {sorted.map((entry, i) => (
          <div key={entry.id ?? i} className="flex gap-3 relative">
            {/* Dot */}
            <div
              className={`w-3.5 h-3.5 rounded-full mt-0.5 flex-shrink-0 ring-2 ring-surface ${dotColor(entry.role)}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-800 truncate">{entry.action}</p>
                <span className="text-[11px] text-slate-400 shrink-0">{relativeTime(entry.timestamp)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {entry.actor}
                {entry.role && entry.role !== entry.actor && (
                  <span className="ml-1 text-slate-400">· {entry.role}</span>
                )}
              </p>
              {entry.detail && (
                <p className="text-xs text-slate-400 mt-0.5 italic line-clamp-2">{entry.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
