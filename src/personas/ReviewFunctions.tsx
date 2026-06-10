import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  Scale,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { useRecoStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import AgentPanel from '@/components/AgentPanel'
import RecoCard from '@/components/RecoCard'
import StatusBadge from '@/components/StatusBadge'
import Timeline from '@/components/Timeline'
import {
  legalReviewAgentScript,
  financeReviewAgentScript,
  complianceReviewAgentScript,
} from '@/agents/scripts'
import { daysUntil } from '@/lib/utils'
import type { AgentScript } from '@/agents/engine'
import type { ReviewFunction, Recommendation } from '@/lib/types'
import type { LegalReviewOutput } from '@/agents/scripts/legalReview'
import type { FinanceReviewOutput } from '@/agents/scripts/financeReview'
import type { ComplianceReviewOutput } from '@/agents/scripts/complianceReview'

// ─── Types & config ───────────────────────────────────────────────────────────

type Fn = ReviewFunction
type RFView = 'dashboard' | 'review'

const PAGE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.18 },
}

interface FnConfig {
  label: string
  icon: React.ElementType
  agent: AgentScript
  reviewer: string
}

const FN_CONFIG: Record<Fn, FnConfig> = {
  legal: {
    label: 'Legal',
    icon: Scale,
    agent: legalReviewAgentScript,
    reviewer: 'M. Stavrou',
  },
  finance: {
    label: 'Finance',
    icon: TrendingUp,
    agent: financeReviewAgentScript,
    reviewer: 'K. Economou',
  },
  compliance: {
    label: 'Compliance',
    icon: ShieldCheck,
    agent: complianceReviewAgentScript,
    reviewer: 'A. Nikolaou',
  },
}

// ─── Comment generator (from agent structured output) ─────────────────────────

function generateComment(fn: Fn, output: unknown): string {
  if (fn === 'legal') {
    const o = output as LegalReviewOutput
    const lines = o.criticalItems
      .map((item) => `• [${item.severity.toUpperCase()}] ${item.ref}: ${item.description}`)
      .join('\n')
    return `Critical items identified by Legal Review Agent:\n\n${lines}\n\nThe Financial Impact section must confirm Finance/Treasury budget coverage before resubmission (hard gate per internal policy). REMIT pre-trade ACER notification timeline must also be on file. Returning for update.`
  }
  if (fn === 'finance') {
    const o = output as FinanceReviewOutput
    const notes = o.financialNotes.map((n) => `• ${n}`).join('\n')
    return `Budget coverage confirmed (${o.estimatedAnnualValue} within Trading & Origination envelope).\n\n${notes}\n\n${o.verdict}.`
  }
  const o = output as ComplianceReviewOutput
  const passed = o.policyChecks.filter((c) => c.status === 'pass')
  const recs = o.recommendations.map((r) => `• ${r}`).join('\n')
  return `All ${passed.length} policy checks passed (no flags).\n\nRecommendation:\n${recs}\n\n${o.verdict}.`
}

// ─── Structured output panels ─────────────────────────────────────────────────

function LegalOutputPanel({ output }: { output: LegalReviewOutput }) {
  const SEV_CLS: Record<string, string> = {
    high: 'bg-red-50 border-red-200 text-red-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    advisory: 'bg-blue-50 border-blue-200 text-blue-700',
  }
  const SEV_BADGE: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    advisory: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
          Critical Items ({output.criticalItems.length})
        </p>
        {output.criticalItems.map((item, i) => (
          <div key={i} className={`rounded-lg p-3 border ${SEV_CLS[item.severity]}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${SEV_BADGE[item.severity]}`}>
                {item.severity}
              </span>
              <span className="text-xs font-mono font-medium">{item.ref}</span>
            </div>
            <p className="text-xs leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
      {output.suggestedIntegrations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Suggested Integrations
          </p>
          {output.suggestedIntegrations.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <ChevronRight className="w-3 h-3 text-agent mt-0.5 flex-shrink-0" />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FinanceOutputPanel({ output }: { output: FinanceReviewOutput }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface-raised rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-slate-800">{output.estimatedAnnualValue}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Annual contract value</p>
        </div>
        <div className="bg-surface-raised rounded-lg p-3 text-center">
          <p className={`text-lg font-bold ${output.budgetCoverage ? 'text-emerald-600' : 'text-red-600'}`}>
            {output.budgetCoverage ? 'Confirmed' : 'Unconfirmed'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Budget coverage</p>
        </div>
      </div>
      {output.financialNotes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Notes</p>
          {output.financialNotes.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ComplianceOutputPanel({ output }: { output: ComplianceReviewOutput }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
          Policy Checks
        </p>
        {output.policyChecks.map((check, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-slate-600 truncate flex-1 mr-2">{check.policy}</span>
            {check.status === 'pass' ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Pass
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-medium flex-shrink-0">
                <AlertTriangle className="w-3 h-3" /> Flag
              </span>
            )}
          </div>
        ))}
      </div>
      {output.recommendations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Recommendations
          </p>
          {output.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <ChevronRight className="w-3 h-3 text-agent mt-0.5 flex-shrink-0" />
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Priority helpers ─────────────────────────────────────────────────────────

interface PriorityTag {
  label: string
  color: 'red' | 'amber' | 'emerald' | 'brand' | 'slate' | 'purple'
}

const TAG_CLS: Record<string, string> = {
  red:     'bg-red-50 text-red-700 border-red-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  brand:   'bg-brand-subtle text-brand border-brand/20',
  slate:   'bg-surface-raised text-slate-500 border-border-subtle',
  purple:  'bg-agent-subtle text-agent border-agent/20',
}

function getPriorityScore(reco: Recommendation, fn: Fn): number {
  const days = daysUntil(reco.bodDeadline)
  let score = 0

  if (days <= 3) score += 50
  else if (days <= 7) score += 35
  else if (days <= 14) score += 15
  else if (days <= 21) score += 5

  if (fn === 'legal') {
    score += Math.min(reco.regulatoryRefs.length * 10, 25)
    const othersActive =
      (reco.reviews.finance.status !== 'Pending' ? 1 : 0) +
      (reco.reviews.compliance.status !== 'Pending' ? 1 : 0)
    score += othersActive * 5
  }

  if (fn === 'finance') {
    if (reco.reviews.legal.status.startsWith('Approved')) score += 30
    if (reco.regulatoryRefs.includes('EMIR')) score += 15
    if (reco.businessUnit === 'Finance/Treasury') score += 10
  }

  if (fn === 'compliance') {
    const lDone = reco.reviews.legal.status !== 'Pending' && reco.reviews.legal.status !== 'In Review'
    const fDone = reco.reviews.finance.status !== 'Pending' && reco.reviews.finance.status !== 'In Review'
    if (lDone && fDone) score += 40
    else if (lDone || fDone) score += 20
    if (reco.regulatoryRefs.length > 0) score += 10
  }

  return score
}

function getPriorityTags(reco: Recommendation, fn: Fn): PriorityTag[] {
  const tags: PriorityTag[] = []
  const days = daysUntil(reco.bodDeadline)

  if (days <= 7) tags.push({ label: `BoD in ${days}d`, color: 'red' })
  else if (days <= 14) tags.push({ label: `BoD in ${days}d`, color: 'amber' })

  if (fn === 'legal') {
    const regs = reco.regulatoryRefs.filter((r) =>
      ['REMIT', 'EMIR', 'ACER', 'RAAEY'].includes(r)
    )
    if (regs.length > 0) tags.push({ label: regs.slice(0, 2).join(' · '), color: 'brand' })
    const othersActive =
      reco.reviews.finance.status !== 'Pending' ||
      reco.reviews.compliance.status !== 'Pending'
    if (othersActive) tags.push({ label: 'Parallel reviews active', color: 'slate' })
  }

  if (fn === 'finance') {
    if (reco.reviews.legal.status.startsWith('Approved'))
      tags.push({ label: 'Legal cleared', color: 'emerald' })
    if (reco.regulatoryRefs.includes('EMIR'))
      tags.push({ label: 'EMIR — derivatives', color: 'brand' })
    if (reco.businessUnit === 'Finance/Treasury')
      tags.push({ label: 'Own BU', color: 'slate' })
  }

  if (fn === 'compliance') {
    const lDone =
      reco.reviews.legal.status.startsWith('Approved') ||
      reco.reviews.legal.status === 'Returned'
    const fDone =
      reco.reviews.finance.status.startsWith('Approved') ||
      reco.reviews.finance.status === 'Returned'
    if (lDone && fDone) tags.push({ label: 'Final gate', color: 'purple' })
    else if (lDone) tags.push({ label: 'Legal cleared', color: 'emerald' })
    else if (fDone) tags.push({ label: 'Finance cleared', color: 'emerald' })
    if (reco.regulatoryRefs.length > 0)
      tags.push({ label: 'Regulatory scope', color: 'brand' })
  }

  return tags.slice(0, 3)
}

function getNewestId(items: Recommendation[]): string | null {
  if (items.length === 0) return null
  return items.reduce((latest, r) => {
    const ts = r.auditLog[r.auditLog.length - 1]?.timestamp ?? ''
    const latestTs = latest.auditLog[latest.auditLog.length - 1]?.timestamp ?? ''
    return ts > latestTs ? r : latest
  }).id
}

// ─── Priority row ─────────────────────────────────────────────────────────────

function PriorityRow({
  reco,
  rank,
  fn,
  isNewest,
  onOpen,
}: {
  reco: Recommendation
  rank: number
  fn: Fn
  isNewest: boolean
  onOpen: () => void
}) {
  const tags = getPriorityTags(reco, fn)
  const days = daysUntil(reco.bodDeadline)
  const isTop = rank === 1
  const otherFns = (['legal', 'finance', 'compliance'] as Fn[]).filter((f) => f !== fn)

  const REVIEW_DOT: Record<string, string> = {
    Pending: 'bg-slate-300',
    'In Review': 'bg-blue-400',
    Approved: 'bg-emerald-500',
    'Approved with Conditions': 'bg-emerald-400',
    'Approved with Note': 'bg-emerald-400',
    Returned: 'bg-amber-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: (rank - 1) * 0.05 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer group ${
        isTop
          ? 'bg-brand-subtle/50 border-l-[3px] border-l-brand border-brand/25'
          : 'bg-surface border-border-subtle hover:border-border-strong hover:bg-surface-raised/40'
      }`}
      onClick={onOpen}
    >
      {/* Rank */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
          rank === 1
            ? 'bg-brand text-white'
            : rank === 2
            ? 'bg-brand/15 text-brand'
            : 'bg-surface-raised text-slate-400'
        }`}
      >
        {rank}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p
            className={`text-sm font-semibold truncate ${
              isTop ? 'text-brand' : 'text-slate-800'
            }`}
          >
            {reco.title}
          </p>
          {isNewest && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand text-white uppercase tracking-wide flex-shrink-0 leading-none">
              New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400">
            {reco.businessUnit} · {reco.owner}
          </span>
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded border leading-none ${TAG_CLS[tag.color]}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Parallel reviewer dots */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5"
        title="Status of parallel reviewers"
      >
        {otherFns.map((f) => {
          const status = reco.reviews[f].status
          return (
            <div key={f} className="flex items-center gap-0.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${REVIEW_DOT[status] ?? 'bg-slate-300'}`}
                title={`${FN_CONFIG[f].label}: ${status}`}
              />
              <span className="text-[10px] text-slate-400">{FN_CONFIG[f].label[0]}</span>
            </div>
          )
        })}
      </div>

      {/* Deadline */}
      <div
        className={`flex-shrink-0 flex items-center gap-1 text-[11px] font-medium min-w-[36px] justify-end ${
          days <= 7 ? 'text-red-600' : days <= 14 ? 'text-amber-600' : 'text-slate-400'
        }`}
      >
        <Clock className="w-3 h-3" />
        {days}d
      </div>

      {/* CTA */}
      <div className="flex-shrink-0">
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
            isTop
              ? 'bg-brand text-white group-hover:bg-brand-dim'
              : 'bg-surface-raised text-slate-600 group-hover:bg-border-subtle group-hover:text-slate-800'
          }`}
        >
          Review
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function RFDashboard({
  recommendations,
  activeFn,
  onView,
}: {
  recommendations: Recommendation[]
  activeFn: Fn
  onView: (id: string) => void
}) {
  const [showCompleted, setShowCompleted] = useState(false)

  const fnCfg = FN_CONFIG[activeFn]
  const Icon = fnCfg.icon

  const actionItems = recommendations
    .filter((r) => r.reviews[activeFn].status === 'In Review')
    .sort((a, b) => getPriorityScore(b, activeFn) - getPriorityScore(a, activeFn))

  const completedItems = recommendations.filter((r) => {
    const s = r.reviews[activeFn].status
    return s !== 'Pending' && s !== 'In Review'
  })

  const newestId = getNewestId(actionItems)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Reviewers</h1>
        <p className="text-slate-500 text-sm mt-1">Specialist review functions</p>
      </div>

      {/* Priority worklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              {fnCfg.label} — needs your attention
            </h2>
          </div>
          {actionItems.length > 0 && (
            <span className="text-xs text-slate-400">
              {actionItems.length} item{actionItems.length > 1 ? 's' : ''} · sorted by priority
            </span>
          )}
        </div>

        {actionItems.length === 0 ? (
          <div className="bg-surface border border-border-subtle rounded-xl p-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              Queue is clear — no items awaiting your review.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionItems.map((r, idx) => (
              <PriorityRow
                key={r.id}
                reco={r}
                rank={idx + 1}
                fn={activeFn}
                isNewest={r.id === newestId}
                onOpen={() => onView(r.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Already reviewed */}
      {completedItems.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span
              className={`inline-block transition-transform duration-150 ${
                showCompleted ? 'rotate-90' : ''
              }`}
            >
              ▶
            </span>
            Already reviewed by you ({completedItems.length})
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {completedItems.map((r, i) => {
                    const reviewStatus = r.reviews[activeFn].status
                    return (
                      <div key={r.id} className="relative">
                        <RecoCard
                          recommendation={r}
                          onClick={() => onView(r.id)}
                          index={i}
                        />
                        <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border pointer-events-none ${
                          reviewStatus === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {reviewStatus === 'Approved' ? '✓ Reviewed' : '↩ Returned'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// ─── Review detail view ───────────────────────────────────────────────────────

function RFReviewView({
  recoId,
  activeFn,
  onBack,
}: {
  recoId: string
  activeFn: Fn
  onBack: () => void
}) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const approveReview = useRecoStore((s) => s.approveReview)
  const returnForUpdate = useRecoStore((s) => s.returnForUpdate)
  const setOpenPrecedentId = useUIStore((s) => s.setOpenPrecedentId)

  const [comment, setComment] = useState('')
  const [agentOutput, setAgentOutput] = useState<unknown>(null)
  const [submitted, setSubmitted] = useState(false)

  const fnCfg = FN_CONFIG[activeFn]
  const currentReview = reco?.reviews[activeFn]

  const handleAgentComplete = useCallback(
    (output: unknown) => {
      setAgentOutput(output)
      if (output) setComment(generateComment(activeFn, output))
    },
    [activeFn]
  )

  if (!reco) return null

  const days = daysUntil(reco.bodDeadline)
  const alreadyReviewed =
    currentReview?.status === 'Approved' || currentReview?.status === 'Returned'

  const otherFns = (['legal', 'finance', 'compliance'] as Fn[]).filter((f) => f !== activeFn)

  const REVIEW_STATUS_CLS: Record<string, string> = {
    Pending: 'text-slate-400 bg-slate-100 border-slate-200',
    'In Review': 'text-blue-600 bg-blue-50 border-blue-200',
    Approved: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    Returned: 'text-amber-600 bg-amber-50 border-amber-200',
  }

  const handleApprove = () => {
    approveReview(recoId, activeFn, fnCfg.reviewer)
    setSubmitted(true)
  }

  const handleReturn = () => {
    if (!comment.trim()) return
    returnForUpdate(recoId, activeFn, fnCfg.reviewer, comment.trim())
    setSubmitted(true)
  }

  if (submitted) {
    const wasReturned = reco.reviews[activeFn].status === 'Returned'
    return (
      <div className="max-w-2xl space-y-6">
        <div
          className={`rounded-xl p-6 border flex items-start gap-4 ${
            wasReturned
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          {wasReturned ? (
            <RotateCcw className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-semibold ${wasReturned ? 'text-amber-700' : 'text-emerald-700'}`}>
              {wasReturned ? 'Returned to Business Unit for update' : `${fnCfg.label} review approved`}
            </p>
            <p className={`text-sm mt-1 ${wasReturned ? 'text-amber-600' : 'text-emerald-600'}`}>
              {wasReturned
                ? 'The recommendation status is now "Returned for Update". The Business Unit will see your comments and can address them.'
                : 'Your approval has been recorded. Once all assigned reviewers approve, the status will advance to "All Reviews Completed".'}
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-600">{fnCfg.label} Review</span>
      </div>

      {/* Already-reviewed banner — full-width, shown before the 2-col layout */}
      {alreadyReviewed && (
        <div className={`rounded-xl px-4 py-3 border flex items-center gap-3 ${
          currentReview?.status === 'Approved'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          {currentReview?.status === 'Approved' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          ) : (
            <RotateCcw className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )}
          <p className={`text-sm font-medium ${
            currentReview?.status === 'Approved' ? 'text-emerald-700' : 'text-amber-700'
          }`}>
            {currentReview?.status === 'Approved'
              ? `${fnCfg.label} review submitted — Approved.`
              : `${fnCfg.label} review submitted — Returned for update.`}
            {' '}This record is read-only.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <StatusBadge status={reco.status} />
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                days <= 7 ? 'text-red-600' : days <= 14 ? 'text-amber-600' : 'text-slate-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              BoD in {days}d
            </div>
          </div>
          <h1 className="text-xl font-semibold text-slate-800">{reco.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reco.businessUnit} · {reco.owner}
          </p>
        </div>

        {/* Other reviewers' status */}
        <div className="flex-shrink-0 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium text-right">
            Other reviewers
          </p>
          <div className="flex gap-1.5">
            {otherFns.map((fn) => {
              const review = reco.reviews[fn]
              const cls = REVIEW_STATUS_CLS[review.status] ?? REVIEW_STATUS_CLS.Pending
              return (
                <span
                  key={fn}
                  title={`${FN_CONFIG[fn].label}: ${review.status}`}
                  className={`text-[10px] font-bold px-2 py-1 rounded border ${cls}`}
                >
                  {FN_CONFIG[fn].label[0]} · {review.status}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document sections */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Document
          </h2>

          {reco.contentSections.length === 0 ? (
            <div className="bg-surface border border-border-subtle rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm italic">
                No document sections available yet.
              </p>
            </div>
          ) : (
            <>
              {/* Business need */}
              <div className="bg-surface border border-border-subtle rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                  Business Need
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{reco.businessNeed}</p>
              </div>

              {/* Regulatory refs */}
              {reco.regulatoryRefs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {reco.regulatoryRefs.map((ref) => (
                    <span
                      key={ref}
                      className="bg-brand-subtle text-brand text-xs font-medium px-2.5 py-0.5 rounded-full border border-brand/20"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}

              {/* Content sections */}
              <div className="space-y-2">
                {reco.contentSections.map((section, idx) => (
                  <div key={section.id} className="bg-surface border border-border-subtle rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-surface-raised text-[10px] font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed pl-7">{section.body}</p>
                  </div>
                ))}
              </div>

              {/* Draft resolution */}
              {reco.draftResolution && (
                <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                    Draft Resolution
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed italic">
                    {reco.draftResolution}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Activity */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Activity
            </h2>
            <Timeline entries={reco.auditLog} />
          </div>
        </div>

        {/* Right: agent + action */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            {fnCfg.label} Review Agent
          </h2>

          <AgentPanel
            key={`${recoId}-${activeFn}`}
            script={fnCfg.agent}
            inputs={{
              document_title: reco.title,
              regulatory_refs: reco.regulatoryRefs.join(', ') || 'none',
              reviewer: fnCfg.reviewer,
            }}
            onComplete={handleAgentComplete}
            onSourceClick={setOpenPrecedentId}
          />

          {/* Structured output panel */}
          <AnimatePresence>
            {agentOutput != null && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3"
              >
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                  Agent Analysis
                </p>
                {activeFn === 'legal' && (
                  <LegalOutputPanel output={agentOutput as LegalReviewOutput} />
                )}
                {activeFn === 'finance' && (
                  <FinanceOutputPanel output={agentOutput as FinanceReviewOutput} />
                )}
                {activeFn === 'compliance' && (
                  <ComplianceOutputPanel output={agentOutput as ComplianceReviewOutput} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action area */}
          <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              {alreadyReviewed ? 'Review submitted' : 'Your review'}
            </p>

            {alreadyReviewed ? (
              <div
                className={`rounded-lg p-3 text-sm font-medium flex items-center gap-2 ${
                  currentReview?.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {currentReview?.status === 'Approved' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <RotateCcw className="w-4 h-4 flex-shrink-0" />
                )}
                {currentReview?.status}
              </div>
            ) : (
              <>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder={
                    agentOutput
                      ? 'Findings pre-filled from agent analysis. Edit as needed…'
                      : 'Run the agent above for AI-assisted analysis, or enter findings manually…'
                  }
                  className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-ink resize-none leading-relaxed"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleReturn}
                    disabled={!comment.trim()}
                    className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Return
                  </button>
                  <button
                    onClick={handleApprove}
                    className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center">
                  {activeFn === 'legal'
                    ? 'Standard path: Return with REMIT/EMIR comments'
                    : 'Standard path: Approve'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReviewFunctions() {
  const recommendations = useRecoStore((s) => s.recommendations)

  const [activeFn, setActiveFn] = useState<Fn>('legal')
  const [rfView, setRfView] = useState<RFView>('dashboard')
  const [activeRecoId, setActiveRecoId] = useState<string | null>(null)

  const openReview = (id: string) => {
    setActiveRecoId(id)
    setRfView('review')
  }

  const handleFnChange = (fn: Fn) => {
    setActiveFn(fn)
    setRfView('dashboard')
    setActiveRecoId(null)
  }

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Function tabs — always visible */}
      {rfView === 'dashboard' && (
        <div className="flex gap-1 bg-surface-raised rounded-xl p-1 w-fit border border-border-subtle">
          {(Object.keys(FN_CONFIG) as Fn[]).map((fn) => {
            const Ic = FN_CONFIG[fn].icon
            const inQueue = recommendations.filter(
              (r) => r.reviews[fn].status === 'In Review'
            ).length
            return (
              <button
                key={fn}
                onClick={() => handleFnChange(fn)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  activeFn === fn
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-surface'
                }`}
              >
                <Ic className="w-3.5 h-3.5" />
                {FN_CONFIG[fn].label}
                {inQueue > 0 && (
                  <span
                    className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                      activeFn === fn
                        ? 'bg-white/20 text-white'
                        : 'bg-brand/10 text-brand'
                    }`}
                  >
                    {inQueue}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {rfView === 'dashboard' && (
          <motion.div key={`rf-dashboard-${activeFn}`} {...PAGE}>
            <RFDashboard
              recommendations={recommendations}
              activeFn={activeFn}
              onView={openReview}
            />
          </motion.div>
        )}

        {rfView === 'review' && activeRecoId && (
          <motion.div key={`rf-review-${activeRecoId}-${activeFn}`} {...PAGE}>
            <RFReviewView
              recoId={activeRecoId}
              activeFn={activeFn}
              onBack={() => {
                setRfView('dashboard')
                setActiveRecoId(null)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
