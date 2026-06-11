import type { RecommendationStatus } from './types'

export interface StatusStyle {
  text: string
  bg: string
  border: string
  dot: string
}

export const statusColors: Record<RecommendationStatus, StatusStyle> = {
  Draft: {
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-300',
    dot: '#94A3B8',
  },
  'Under Review': {
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dot: '#3B82F6',
  },
  'Returned for Update': {
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: '#D97706',
  },
  'All Reviews Completed': {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: '#059669',
  },
  // Intentionally reuses agent violet — this is the handoff point into the agentic workflow
  'Submitted to Secretariat': {
    text: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    dot: '#7C3AED',
  },
  'Ready for BoD': {
    text: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: '#0284C7',
  },
  'Submitted to BoD': {
    text: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dot: '#16A34A',
  },
}
