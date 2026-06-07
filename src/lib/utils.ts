// Pinned to demo date for consistent relative times on stage
const DEMO_NOW = new Date('2026-06-07T12:00:00Z')

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date(DEMO_NOW)
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

export function relativeTime(isoStr: string): string {
  const date = new Date(isoStr)
  const diffMs = DEMO_NOW.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffMins < 2) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  if (diffMonths < 12) return `${diffMonths}mo ago`
  return `${Math.floor(diffMonths / 12)}y ago`
}

export function formatDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
