import type { RecommendationStatus } from './types'

export interface StatusStyle {
  text: string
  bg: string
  border: string
  dot: string
}

export const statusColors: Record<RecommendationStatus, StatusStyle> = {
  Draft: {
    text: 'text-slate-400',
    bg: 'bg-slate-800',
    border: 'border-slate-600',
    dot: '#94A3B8',
  },
  'Under Review': {
    text: 'text-blue-300',
    bg: 'bg-blue-900/60',
    border: 'border-blue-700',
    dot: '#93C5FD',
  },
  'Returned for Update': {
    text: 'text-amber-400',
    bg: 'bg-amber-900/50',
    border: 'border-amber-700',
    dot: '#FBBF24',
  },
  'All Reviews Completed': {
    text: 'text-emerald-400',
    bg: 'bg-emerald-900/50',
    border: 'border-emerald-700',
    dot: '#34D399',
  },
  // Intentionally reuses agent violet — this is the handoff point into the agentic workflow
  'Submitted to Secretariat': {
    text: 'text-violet-400',
    bg: 'bg-violet-900/50',
    border: 'border-violet-700',
    dot: '#A78BFA',
  },
  'Ready for BoD': {
    text: 'text-sky-300',
    bg: 'bg-sky-900/50',
    border: 'border-sky-700',
    dot: '#7DD3FC',
  },
  'Submitted to BoD': {
    text: 'text-green-300',
    bg: 'bg-green-900/50',
    border: 'border-green-700',
    dot: '#86EFAC',
  },
}
