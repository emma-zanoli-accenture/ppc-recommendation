import { useState, useCallback, useRef } from 'react'
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
  Bot,
  Check,
  Zap,
} from 'lucide-react'
import { useRecoStore } from '@/store'
import AgentPanel from '@/components/AgentPanel'
import RecoCard from '@/components/RecoCard'
import StatusBadge from '@/components/StatusBadge'
import Timeline from '@/components/Timeline'
import { draftingAgentScript } from '@/agents/scripts'
import { statusColors } from '@/lib/statusColors'
import type { ReviewFunction, Recommendation, RecommendationStatus } from '@/lib/types'
import type { DraftingOutput, DraftSuggestion } from '@/agents/scripts/drafting'

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
            {[...buRecos].reverse().map((r, i) => (
              <RecoCard
                key={r.id}
                recommendation={r}
                onClick={() => onView(r.id, r.status)}
                index={i}
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

const SCRIPT_OUTPUT = draftingAgentScript.structuredOutput as DraftingOutput
const TEMPLATE_MAP = new Map(SCRIPT_OUTPUT.templateSections.map((s) => [s.id, s.body]))
const SECTION_TITLE_MAP = new Map(SCRIPT_OUTPUT.templateSections.map((s) => [s.id, s.title]))
const ALL_DRAFT_ITEMS = [...SCRIPT_OUTPUT.suggestions, ...SCRIPT_OUTPUT.gaps]

// Typewriter speed: ~280 chars/sec feels like live writing without being tedious
const TW_CHARS = 7
const TW_MS = 25

function SuggestionCard({
  item,
  applied,
  onApply,
  onHoverStart,
  onHoverEnd,
}: {
  item: DraftSuggestion
  applied: boolean
  onApply: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const isSuggestion = item.type === 'suggestion'
  const sectionTitle = SECTION_TITLE_MAP.get(item.targetSectionId)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all ${
        applied
          ? 'bg-surface-raised border-border-subtle opacity-60'
          : isSuggestion
          ? 'bg-agent-subtle/40 border-agent-dim/30'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${isSuggestion ? 'text-agent' : 'text-amber-500'}`}>
        {isSuggestion ? <Bot className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium leading-snug ${
          applied ? 'text-slate-400' : isSuggestion ? 'text-agent' : 'text-amber-700'
        }`}>
          {item.label}
        </p>
        {sectionTitle && !applied && (
          <p className="text-[10px] text-slate-400 mt-0.5">→ {sectionTitle}</p>
        )}
        {applied && (
          <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <Check className="w-2.5 h-2.5" />
            Applied
          </p>
        )}
      </div>
      {!applied && (
        <button
          onClick={onApply}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors shrink-0 ${
            isSuggestion
              ? 'bg-agent text-white hover:bg-agent-dim'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          Apply
        </button>
      )}
    </motion.div>
  )
}

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
  const updateContent = useRecoStore((s) => s.updateContent)

  // Pre-populate appliedIds on mount by comparing section bodies to template stubs
  const [appliedIds, setAppliedIds] = useState<Set<string>>(() => {
    const sections =
      useRecoStore.getState().recommendations.find((r) => r.id === recoId)?.contentSections ?? []
    const applied = new Set<string>()
    for (const item of ALL_DRAFT_ITEMS) {
      const current = sections.find((s) => s.id === item.targetSectionId)?.body
      const stub = TEMPLATE_MAP.get(item.targetSectionId)
      if (current && stub && current !== stub) applied.add(item.id)
    }
    return applied
  })
  // sectionId being typed into (hover preview) or actively typing
  const [hoverSectionId, setHoverSectionId] = useState<string | null>(null)
  // typewriter: live display text while a section is being written in
  const [typing, setTyping] = useState<{ sectionId: string; displayText: string } | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalItems = ALL_DRAFT_ITEMS.length
  const appliedCount = appliedIds.size
  const allApplied = appliedCount === totalItems

  const handleComplete = useCallback(
    (output: unknown) => {
      if (!output) return
      const o = output as DraftingOutput
      applyDraftingOutput(recoId, {
        contentSections: o.templateSections,
        draftResolution: o.draftResolution,
        regulatoryRefs: o.regulatoryRefs,
      })
    },
    [recoId, applyDraftingOutput]
  )

  const applyItem = useCallback(
    (item: DraftSuggestion) => {
      if (appliedIds.has(item.id) || !reco) return
      // Update store immediately (source of truth)
      updateContent(recoId, {
        contentSections: reco.contentSections.map((s) =>
          s.id === item.targetSectionId ? { ...s, body: item.body } : s
        ),
      })
      setAppliedIds((prev) => new Set([...prev, item.id]))
      setHoverSectionId(null)

      // Typewriter: stream the text into the section visually
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      let pos = TW_CHARS
      setTyping({ sectionId: item.targetSectionId, displayText: item.body.slice(0, pos) })
      typingTimerRef.current = setInterval(() => {
        pos += TW_CHARS
        if (pos >= item.body.length) {
          clearInterval(typingTimerRef.current!)
          typingTimerRef.current = null
          setTyping(null)
        } else {
          setTyping({ sectionId: item.targetSectionId, displayText: item.body.slice(0, pos) })
        }
      }, TW_MS)
    },
    [reco, appliedIds, recoId, updateContent]
  )

  const applyAll = useCallback(() => {
    if (!reco) return
    const remaining = ALL_DRAFT_ITEMS.filter((item) => !appliedIds.has(item.id))
    if (remaining.length === 0) return
    // Single store update with all pending changes
    const finalSections = reco.contentSections.map((section) => {
      const match = remaining.find((item) => item.targetSectionId === section.id)
      return match ? { ...section, body: match.body } : section
    })
    updateContent(recoId, { contentSections: finalSections })
    // Stagger applied badges; no typewriter for bulk (too many at once)
    remaining.forEach((item, i) => {
      setTimeout(() => {
        setAppliedIds((prev) => new Set([...prev, item.id]))
      }, i * 140)
    })
    setHoverSectionId(null)
    if (typingTimerRef.current) { clearInterval(typingTimerRef.current); typingTimerRef.current = null }
    setTyping(null)
  }, [reco, appliedIds, recoId, updateContent])

  if (!reco) return null

  const hasSections = reco.contentSections.length > 0
  const isStub = (sectionId: string) =>
    ALL_DRAFT_ITEMS.some((item) => item.targetSectionId === sectionId && !appliedIds.has(item.id))
  const isTyping = (sectionId: string) => typing?.sectionId === sectionId
  const isHovered = (sectionId: string) => hoverSectionId === sectionId

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
        <p className="text-slate-500 text-sm mt-1">{reco.businessUnit} · {reco.owner}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Document ────────────────────────────────────────────── */}
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
                {reco.contentSections.map((section, idx) => {
                  const stub = isStub(section.id)
                  const typing_ = isTyping(section.id)
                  const hovered = isHovered(section.id)
                  // What to display: live typewriter text > store body
                  const displayBody = typing_ && typing ? typing.displayText : section.body
                  return (
                    <motion.div
                      key={section.id}
                      layout
                      className={`bg-surface rounded-xl p-4 transition-all duration-200 border ${
                        typing_
                          ? 'ring-2 ring-agent/60 border-agent-dim/50 shadow-sm shadow-agent/10'
                          : hovered
                          ? 'ring-1 ring-agent/30 border-agent-dim/30'
                          : stub
                          ? 'border-dashed border-slate-300'
                          : 'border-border-subtle'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-5 h-5 rounded-full bg-surface-raised text-[10px] font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
                        {stub && !typing_ && !hovered && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0">
                            pending
                          </span>
                        )}
                        {hovered && !typing_ && (
                          <motion.span
                            initial={{ opacity: 0, x: 4 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] text-agent bg-agent-subtle border border-agent-dim/30 px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0"
                          >
                            ← will insert here
                          </motion.span>
                        )}
                        {typing_ && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-[10px] text-agent bg-agent-subtle border border-agent-dim/30 px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0 flex items-center gap-1"
                          >
                            <motion.span
                              animate={{ opacity: [1, 0.3, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="w-1.5 h-1.5 rounded-full bg-agent"
                            />
                            Writing…
                          </motion.span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed pl-7 ${
                        stub && !typing_ ? 'text-slate-400 italic' : 'text-slate-600'
                      }`}>
                        {displayBody}
                        {typing_ && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                            className="text-agent font-medium"
                          >
                            ▌
                          </motion.span>
                        )}
                      </p>
                    </motion.div>
                  )
                })}
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

        {/* ── Right column: Agent + Assisted drafting ──────────────── */}
        <div className="space-y-4">
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

          {/* Assisted-drafting panel — appears after agent produces the template */}
          <AnimatePresence>
            {hasSections && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border border-border-subtle rounded-xl overflow-hidden bg-surface"
              >
                {/* Panel header */}
                <div className="px-4 py-3 bg-surface-raised border-b border-border-subtle flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-agent" />
                  <p className="text-xs font-semibold text-slate-700">Assisted Drafting</p>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {appliedCount}/{totalItems} applied
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-agent rounded-full"
                        animate={{ width: `${totalItems > 0 ? (appliedCount / totalItems) * 100 : 0}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {allApplied
                        ? 'All suggestions applied — draft complete'
                        : `${appliedCount} of ${totalItems} applied · ${totalItems - appliedCount} remaining`}
                    </p>
                  </div>

                  {/* Suggested integrations */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                      Suggested integrations
                    </p>
                    {SCRIPT_OUTPUT.suggestions.map((item) => (
                      <SuggestionCard
                        key={item.id}
                        item={item}
                        applied={appliedIds.has(item.id)}
                        onApply={() => applyItem(item)}
                        onHoverStart={() => setHoverSectionId(item.targetSectionId)}
                        onHoverEnd={() => setHoverSectionId(null)}
                      />
                    ))}
                  </div>

                  {/* Information gaps */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                      Information gaps
                    </p>
                    {SCRIPT_OUTPUT.gaps.map((item) => (
                      <SuggestionCard
                        key={item.id}
                        item={item}
                        applied={appliedIds.has(item.id)}
                        onApply={() => applyItem(item)}
                        onHoverStart={() => setHoverSectionId(item.targetSectionId)}
                        onHoverEnd={() => setHoverSectionId(null)}
                      />
                    ))}
                  </div>

                  {/* Apply all */}
                  {!allApplied && (
                    <button
                      onClick={applyAll}
                      className="w-full bg-agent text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-agent-dim transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3 h-3" />
                      Auto-complete draft
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer CTA */}
      <AnimatePresence>
        {hasSections && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-4 border-t border-border-subtle"
          >
            <div>
              <AnimatePresence mode="wait">
                {allApplied ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Draft complete — ready for review
                  </motion.div>
                ) : appliedCount > 0 ? (
                  <motion.p key="partial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500">
                    {appliedCount} of {totalItems} suggestions applied · you can still send for review
                  </motion.p>
                ) : (
                  <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-500">
                    Apply suggestions to complete the document, or send for review now
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={onProceed}
              className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors inline-flex items-center gap-1.5"
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
    'Estimated annual contract value: EUR 32.5M — Finance/Treasury budget clearance formally confirmed 7 June 2026 (satisfies Legal review hard gate per internal policy). EUR/RON FX basis risk (~2.3%) mitigated via Treasury-approved forward hedging programme. Counterparty credit risk: CEO S.A. rated Fitch BB+, within PPC risk appetite; credit support annex to be executed alongside master agreement. REMIT Art. 4 ACER pre-trade notification filed 5 June 2026; written acknowledgement received and on file with Regulatory Affairs — condition precedent to contract signature is met.'

  const [financialBody, setFinancialBody] = useState(financialSection?.body ?? '')
  const [typing, setTyping] = useState<string | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const applyUpdate = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current)
    let pos = TW_CHARS
    setTyping(SUGGESTED_BODY.slice(0, pos))
    typingTimerRef.current = setInterval(() => {
      pos += TW_CHARS
      if (pos >= SUGGESTED_BODY.length) {
        clearInterval(typingTimerRef.current!)
        typingTimerRef.current = null
        setFinancialBody(SUGGESTED_BODY)
        setTyping(null)
      } else {
        setTyping(SUGGESTED_BODY.slice(0, pos))
      }
    }, TW_MS)
  }

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
        <div className={`bg-surface border rounded-xl p-5 space-y-3 transition-all duration-200 ${
          typing !== null
            ? 'ring-2 ring-agent/60 border-agent-dim/50 shadow-sm shadow-agent/10'
            : 'border-border-subtle'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">{financialSection.title}</p>
              <AnimatePresence>
                {typing !== null && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-[10px] text-agent bg-agent-subtle border border-agent-dim/30 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-agent"
                    />
                    Writing…
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            {typing === null && (
              <button
                onClick={applyUpdate}
                className="text-xs text-agent font-medium hover:text-agent-dim transition-colors"
              >
                Apply suggested update ↗
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Update to address the reviewer's comments before resubmitting.
          </p>
          <div className="relative">
            <textarea
              value={typing ?? financialBody}
              onChange={(e) => { if (typing === null) setFinancialBody(e.target.value) }}
              readOnly={typing !== null}
              rows={5}
              className={`w-full border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none bg-ink resize-none leading-relaxed transition-all duration-200 ${
                typing !== null
                  ? 'border-agent-dim/50 text-slate-700'
                  : 'border-border-strong focus:ring-2 focus:ring-brand/30 focus:border-brand'
              }`}
            />
            {typing !== null && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-3 right-3 text-agent font-medium text-sm pointer-events-none"
              >
                ▌
              </motion.span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleResubmit}
          disabled={typing !== null}
          className="bg-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
