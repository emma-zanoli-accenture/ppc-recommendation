import { APP_NAME, APP_TAGLINE, PPC_CLIENT } from '@/lib/constants'
import { statusColors } from '@/lib/statusColors'
import type { RecommendationStatus } from '@/lib/types'

const paletteSwatch = [
  { label: 'ink', className: 'bg-ink border-border-strong text-slate-500' },
  { label: 'surface', className: 'bg-surface border-border-subtle text-slate-400' },
  { label: 'surface-raised', className: 'bg-surface-raised border-border-subtle text-slate-400' },
  { label: 'brand', className: 'bg-brand border-brand text-white' },
  { label: 'agent', className: 'bg-agent border-agent text-white' },
  { label: 'agent-subtle', className: 'bg-agent-subtle border-agent-dim text-agent' },
]

const statuses = Object.keys(statusColors) as RecommendationStatus[]

export default function BrandLockup() {
  return (
    <div className="flex flex-col items-center gap-10 px-8 py-16">
      {/* Brand lockup */}
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-sans text-5xl font-semibold tracking-tight select-none">
          <span className="text-brand">{APP_NAME}</span>
          <span className="text-agent mx-3 font-light">·</span>
          <span className="text-slate-400 font-normal">for {PPC_CLIENT}</span>
        </h1>
        <p className="text-slate-500 text-xs tracking-[0.25em] uppercase font-sans">{APP_TAGLINE}</p>
      </div>

      {/* Design token verification strip */}
      <div className="flex flex-col items-center gap-5 w-full max-w-2xl">
        <span className="text-slate-700 text-[10px] uppercase tracking-[0.2em]">
          Design tokens · palette verification
        </span>

        {/* Base + accent swatches */}
        <div className="flex gap-2 flex-wrap justify-center">
          {paletteSwatch.map(({ label, className }) => (
            <div
              key={label}
              className={`${className} text-[10px] font-mono px-3 py-2 rounded border`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Status color chips */}
        <div className="flex gap-2 flex-wrap justify-center">
          {statuses.map((s) => {
            const c = statusColors[s]
            return (
              <span
                key={s}
                className={`${c.bg} ${c.text} ${c.border} border text-[10px] font-medium px-3 py-1 rounded-full`}
              >
                {s}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
