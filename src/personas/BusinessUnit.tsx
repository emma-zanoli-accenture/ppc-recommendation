import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react'
import { useRecoStore } from '@/store'
import AgentPanel from '@/components/AgentPanel'
import RecoCard from '@/components/RecoCard'
import StatusBadge from '@/components/StatusBadge'
import Timeline from '@/components/Timeline'
import { draftingAgentScript } from '@/agents/scripts'
import { statusColors } from '@/lib/statusColors'
import type { ReviewFunction, Recommendation, RecommendationStatus } from '@/lib/types'
import type { DraftingOutput } from '@/agents/scripts/drafting'

// ─── Types & constants ────────────────────────────────────────────────────────

type BUView = 'dashboard' | 'create' | 'draft' | 'send' | 'feedback' | 'update'

const PAGE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.18 },
}

const EXAMPLE_TITLE = 'New cross-border energy trading agreement'
const EXAMPLE_BUSINESS_NEED =
  'PPC S.A. seeks to capitalise on its cross-border transmission capacity between Greece and Romania (ENTSO-E NTC: 400 MW) by entering into a bilateral energy trading framework with Complexul Energetic Oltenia S.A. (CEO S.A.) covering up to 500 GWh/year of physical electricity delivery. The arrangement will enable PPC to optimise generation dispatch, balance seasonal load curves, and establish a commercial foothold in the Romanian forward market ahead of the HEnEx–HUPX market coupling milestone scheduled for 2027. This recommendation seeks BoD approval for the framework agreement and associated regulatory compliance steps.'

const FN_INFO: { fn: ReviewFunction; label: string; description: string }[] = [
  { fn: 'legal', label: 'Legal', description: 'Regulatory review — REMIT, EMIR, RAAEY, MiFID II' },
  { fn: 'finance', label: 'Finance', description: 'Financial impact, budget coverage, FX risk' },
  { fn: 'compliance', label: 'Compliance', description: 'Internal policy and governance alignment' },
]

const FN_LABELS: Record<ReviewFunction, string> = {
  legal: 'Legal',
  finance: 'Finance',
  compliance: 'Compliance',
}

const REVIEW_STATUS_CLS: Record<string, string> = {
  Pending: 'text-slate-400',
  'In Review': 'text-blue-600',
  Approved: 'text-emerald-600',
  Returned: 'text-amber-600',
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function BUDashboard({
  recommendations,
  onNew,
  onView,
}: {
  recommendations: Recommendation[]
  onNew: () => void
  onView: (id: string, status: RecommendationStatus) => void
}) {
  const buRecos = recommendations.filter((r) => r.businessUnit === 'Procurement')

  const statusCounts = buRecos.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Business Unit — Procurement</h1>
          <p className="text-slate-500 text-sm mt-1">My recommendations</p>
        </div>
        <button
          onClick={onNew}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors"
        >
          + New Recommendation
        </button>
      </div>

      {Object.keys(statusCounts).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const c = statusColors[status as RecommendationStatus]
            return (
              <span
                key={status}
                className={`text-xs px-3 py-1 rounded-full border font-medium ${c.text} ${c.bg} ${c.border}`}
              >
                {count} · {status}
              </span>
            )
          })}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
          Procurement Recommendations ({buRecos.length})
        </h2>
        {buRecos.length === 0 ? (
          <p className="text-slate-400 text-sm italic">
            No recommendations yet. Create one to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...buRecos].reverse().map((r) => (
              <RecoCard
                key={r.id}
                recommendation={r}
                onClick={() => onView(r.id, r.status)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create form ──────────────────────────────────────────────────────────────

function BUCreate({ onBack, onCreate }: { onBack: () => void; onCreate: (id: string) => void }) {
  const [title, setTitle] = useState('')
  const [businessNeed, setBusinessNeed] = useState('')
  const createRecommendation = useRecoStore((s) => s.createRecommendation)

  const useExample = () => {
    setTitle(EXAMPLE_TITLE)
    setBusinessNeed(EXAMPLE_BUSINESS_NEED)
  }

  const handleCreate = () => {
    if (!title.trim() || !businessNeed.trim()) return
    const id = createRecommendation({
      title: title.trim(),
      businessNeed: businessNeed.trim(),
      businessUnit: 'Procurement',
      owner: 'D. Papadopoulos',
    })
    onCreate(id)
  }

  const isValid = title.trim().length > 0 && businessNeed.trim().length > 0

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">New Recommendation</h1>
        <p className="text-slate-500 text-sm mt-1">
          Describe the business need — Recopilot will draft the full document.
        </p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New cross-border energy trading agreement"
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors bg-ink"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Business Need</label>
          <textarea
            value={businessNeed}
            onChange={(e) => setBusinessNeed(e.target.value)}
            rows={5}
            placeholder="Describe the strategic context and what BoD approval is sought for…"
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors bg-ink resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={useExample}
            className="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-dim font-medium transition-colors border border-brand/30 px-3 py-1.5 rounded-lg hover:bg-brand-subtle"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Use example
            <span className="text-xs text-slate-400 font-normal">— cross-border trading agreement</span>
          </button>

          <button
            onClick={handleCreate}
            disabled={!isValid}
            className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            Create & Draft
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Draft view ───────────────────────────────────────────────────────────────

function BUDraftView({
  recoId,
  onBack,
  onProceed,
}: {
  recoId: string
  onBack: () => void
  onProceed: () => void
}) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const applyDraftingOutput = useRecoStore((s) => s.applyDraftingOutput)

  const handleComplete = useCallback(
    (output: unknown) => {
      if (output) applyDraftingOutput(recoId, output as DraftingOutput)
    },
    [recoId, applyDraftingOutput]
  )

  if (!reco) return null

  const hasSections = reco.contentSections.length > 0
  const gaps = (draftingAgentScript.structuredOutput as DraftingOutput | undefined)?.gaps ?? []

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
        <StatusBadge status={reco.status} />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{reco.title}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {reco.businessUnit} · {reco.owner}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content sections */}
        <div className="lg:col-span-2 space-y-4">
          {!hasSections ? (
            <div className="bg-surface border border-dashed border-border-strong rounded-xl p-10 text-center space-y-2">
              <p className="text-slate-500 text-sm font-medium">
                Run the Drafting Agent to scaffold the recommendation document.
              </p>
              <p className="text-xs text-slate-400 italic">
                7 sections · regulatory framework · draft resolution
              </p>
            </div>
          ) : (
            <>
              {/* Gap alert */}
              {gaps.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700 mb-1">Gap detected by Drafting Agent</p>
                    {gaps.map((g, i) => (
                      <p key={i} className="text-sm text-amber-600">
                        {g}
                      </p>
                    ))}
                  </div>
                </div>
              )}

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
              <div className="space-y-3">
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
                  <p className="text-sm text-slate-700 leading-relaxed italic">{reco.draftResolution}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Agent panel */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Drafting Agent</h2>
          <AgentPanel
            script={draftingAgentScript}
            inputs={{
              business_unit: 'Procurement',
              title: reco.title,
              business_need: reco.businessNeed.slice(0, 80) + '…',
            }}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Footer CTA — visible once sections are populated */}
      <AnimatePresence>
        {hasSections && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end pt-2 border-t border-border-subtle"
          >
            <button
              onClick={onProceed}
              className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors inline-flex items-center gap-1.5 mt-4"
            >
              Send for Review
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Send for review ──────────────────────────────────────────────────────────

function BUSendView({
  recoId,
  onBack,
  onSent,
}: {
  recoId: string
  onBack: () => void
  onSent: () => void
}) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const sendToFunctions = useRecoStore((s) => s.sendToFunctions)
  const sendDirectToChairman = useRecoStore((s) => s.sendDirectToChairman)

  const [selected, setSelected] = useState<Set<ReviewFunction>>(
    new Set<ReviewFunction>(['legal', 'finance', 'compliance'])
  )
  const [directMode, setDirectMode] = useState(false)
  const [reason, setReason] = useState('')

  if (!reco) return null

  const toggle = (fn: ReviewFunction) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(fn)) next.delete(fn)
      else next.add(fn)
      return next
    })

  const canSend = directMode ? reason.trim().length > 0 : selected.size > 0

  const handleSend = () => {
    if (directMode) {
      sendDirectToChairman(recoId, reason.trim())
    } else {
      sendToFunctions(recoId, [...selected])
    }
    onSent()
  }

  return (
    <div className="max-w-xl space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to draft
      </button>

      <div>
        <h1 className="text-xl font-semibold text-slate-800">Send for Review</h1>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{reco.title}</p>
      </div>

      <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
        {!directMode ? (
          <>
            <p className="text-sm font-medium text-slate-700">Select review functions</p>
            <div className="space-y-2">
              {FN_INFO.map(({ fn, label, description }) => (
                <label
                  key={fn}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selected.has(fn)
                      ? 'border-brand/50 bg-brand-subtle'
                      : 'border-border-subtle hover:border-border-strong'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(fn)}
                    onChange={() => toggle(fn)}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700">Send directly to Chairman</p>
              <p className="text-xs text-slate-500 mt-0.5">
                This bypasses specialist review functions. A mandatory reason must be recorded for the audit log.
              </p>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="State the reason for bypassing review functions…"
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-ink resize-none"
            />
          </div>
        )}

        <div className="border-t border-border-subtle pt-3">
          <button
            onClick={() => setDirectMode((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-2"
          >
            {directMode ? '← Back to review functions' : 'Send directly to Chairman instead'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          {directMode
            ? 'Send to Chairman'
            : `Send to ${selected.size} function${selected.size !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  )
}

// ─── Feedback view ────────────────────────────────────────────────────────────

function BUFeedbackView({
  recoId,
  onBack,
  onAddressFeedback,
}: {
  recoId: string
  onBack: () => void
  onAddressFeedback: () => void
}) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const submitToSecretariat = useRecoStore((s) => s.submitToSecretariat)

  if (!reco) return null

  const isReturned = reco.status === 'Returned for Update'
  const allDone = reco.status === 'All Reviews Completed'
  const isSubmitted = ['Submitted to Secretariat', 'Ready for BoD', 'Submitted to BoD'].includes(
    reco.status
  )

  const activeReviews = (['legal', 'finance', 'compliance'] as ReviewFunction[]).filter(
    (fn) => reco.reviews[fn].status !== 'Pending'
  )

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{reco.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reco.businessUnit} · {reco.owner}
          </p>
        </div>
        <StatusBadge status={reco.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Review status */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Review Status
          </h2>

          {activeReviews.length === 0 ? (
            <div className="bg-surface border border-border-subtle rounded-xl p-6 text-center">
              <p className="text-slate-400 text-sm italic">
                Reviews are in progress. Check back after the review functions complete their assessment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(['legal', 'finance', 'compliance'] as ReviewFunction[]).map((fn) => {
                const review = reco.reviews[fn]
                if (review.status === 'Pending') return null
                const cls = REVIEW_STATUS_CLS[review.status] ?? 'text-slate-500'

                return (
                  <div key={fn} className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{FN_LABELS[fn]}</span>
                        {review.reviewer && (
                          <span className="text-xs text-slate-400">· {review.reviewer}</span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 text-sm font-medium ${cls}`}>
                        {review.status === 'Approved' && <CheckCircle2 className="w-4 h-4" />}
                        {review.status === 'Returned' && <XCircle className="w-4 h-4" />}
                        {review.status}
                      </div>
                    </div>

                    {review.comments.length > 0 && (
                      <div className="space-y-2">
                        {review.comments.map((c) => (
                          <div key={c.id} className="bg-surface-raised rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-medium text-slate-600">{c.author}</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Action area */}
          {!isSubmitted && (
            <div className="flex gap-3 pt-1">
              {isReturned && (
                <button
                  onClick={onAddressFeedback}
                  className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors inline-flex items-center gap-1.5"
                >
                  Address Feedback
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {allDone && (
                <button
                  onClick={() => {
                    submitToSecretariat(recoId)
                    onBack()
                  }}
                  className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors inline-flex items-center gap-1.5"
                >
                  Submit to Secretariat
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {isSubmitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Submitted to Corporate Secretariat
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  The Readiness Agent will assess completeness and prepare the BoD pack.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Activity log */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Activity</h2>
          <Timeline entries={reco.auditLog} />
        </div>
      </div>
    </div>
  )
}

// ─── Update / address feedback ────────────────────────────────────────────────

function BUUpdateView({
  recoId,
  onBack,
  onResubmit,
}: {
  recoId: string
  onBack: () => void
  onResubmit: () => void
}) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const updateContent = useRecoStore((s) => s.updateContent)
  const resubmitForReview = useRecoStore((s) => s.resubmitForReview)

  const returnedFn = reco
    ? (['legal', 'finance', 'compliance'] as ReviewFunction[]).find(
        (fn) => reco.reviews[fn].status === 'Returned'
      )
    : undefined

  const returnedReview = reco && returnedFn ? reco.reviews[returnedFn] : undefined
  const returnedComment =
    returnedReview?.comments[returnedReview.comments.length - 1]

  const financialSection = reco?.contentSections.find((s) =>
    s.title.toLowerCase().includes('financial')
  )

  const SUGGESTED_BODY =
    'Estimated annual contract value: EUR 32.5M, confirmed by Finance/Treasury (budget clearance obtained 7 June 2026). Primary financial risks: EUR/RON FX basis (~2.3%), mitigated via forward hedging programme approved by Treasury. Interconnector capacity curtailment and counterparty credit risk (CEO S.A., rated Fitch BB+) are within PPC risk appetite. A credit support annex will be executed alongside the master agreement.'

  const [financialBody, setFinancialBody] = useState(financialSection?.body ?? '')

  if (!reco) return null

  const handleResubmit = () => {
    if (financialSection && financialBody !== financialSection.body) {
      updateContent(recoId, {
        contentSections: reco.contentSections.map((s) =>
          s.id === financialSection.id ? { ...s, body: financialBody } : s
        ),
      })
    }
    resubmitForReview(recoId)
    onResubmit()
  }

  return (
    <div className="max-w-2xl space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to review status
      </button>

      <div>
        <h1 className="text-xl font-semibold text-slate-800">Address Feedback</h1>
        <p className="text-slate-500 text-sm mt-1 line-clamp-1">{reco.title}</p>
      </div>

      {/* Returned comment */}
      {returnedComment && returnedFn && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">
              {FN_LABELS[returnedFn]} Review — Returned
            </span>
            <span className="text-xs text-amber-500">· {returnedComment.author}</span>
          </div>
          <p className="text-sm text-amber-700 leading-relaxed">{returnedComment.text}</p>
        </div>
      )}

      {/* Edit section */}
      {financialSection && (
        <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">{financialSection.title}</p>
            </div>
            <button
              onClick={() => setFinancialBody(SUGGESTED_BODY)}
              className="text-xs text-agent font-medium hover:text-agent-dim transition-colors"
            >
              Apply suggested update ↗
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Update to address the reviewer's comments before resubmitting.
          </p>
          <textarea
            value={financialBody}
            onChange={(e) => setFinancialBody(e.target.value)}
            rows={5}
            className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-ink resize-none leading-relaxed"
          />
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleResubmit}
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors inline-flex items-center gap-1.5"
        >
          Save & Resubmit for Review
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BusinessUnit() {
  const recommendations = useRecoStore((s) => s.recommendations)
  const [view, setView] = useState<BUView>('dashboard')
  const [activeRecoId, setActiveRecoId] = useState<string | null>(null)

  const goTo = (v: BUView, id?: string) => {
    if (id !== undefined) setActiveRecoId(id)
    setView(v)
  }

  const onView = (id: string, status: RecommendationStatus) => {
    setActiveRecoId(id)
    setView(status === 'Draft' ? 'draft' : 'feedback')
  }

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" {...PAGE}>
            <BUDashboard
              recommendations={recommendations}
              onNew={() => goTo('create')}
              onView={onView}
            />
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div key="create" {...PAGE}>
            <BUCreate onBack={() => goTo('dashboard')} onCreate={(id) => goTo('draft', id)} />
          </motion.div>
        )}

        {view === 'draft' && activeRecoId && (
          <motion.div key="draft" {...PAGE}>
            <BUDraftView
              recoId={activeRecoId}
              onBack={() => goTo('dashboard')}
              onProceed={() => goTo('send')}
            />
          </motion.div>
        )}

        {view === 'send' && activeRecoId && (
          <motion.div key="send" {...PAGE}>
            <BUSendView
              recoId={activeRecoId}
              onBack={() => goTo('draft')}
              onSent={() => goTo('dashboard')}
            />
          </motion.div>
        )}

        {view === 'feedback' && activeRecoId && (
          <motion.div key="feedback" {...PAGE}>
            <BUFeedbackView
              recoId={activeRecoId}
              onBack={() => goTo('dashboard')}
              onAddressFeedback={() => goTo('update')}
            />
          </motion.div>
        )}

        {view === 'update' && activeRecoId && (
          <motion.div key="update" {...PAGE}>
            <BUUpdateView
              recoId={activeRecoId}
              onBack={() => goTo('feedback')}
              onResubmit={() => goTo('feedback')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
