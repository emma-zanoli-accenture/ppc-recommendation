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
                  Review Feedback
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

interface LegalComment {
  id: string
  ref: string
  severity: 'high' | 'advisory'
  description: string
  targetSectionId: string
  revisedBody: string
}

const LEGAL_COMMENTS: LegalComment[] = [
  {
    id: 'lc-1',
    ref: 'REMIT Art. 4',
    severity: 'high',
    description: 'ACER pre-trade notification must be completed and acknowledged before contract signature. Strengthen the Regulatory section with explicit ACER acknowledgement filing requirement.',
    targetSectionId: 's3',
    revisedBody:
      'The arrangement triggers obligations under: REMIT Art. 4 — pre-trade notification to ACER is mandatory before contract signature and is a hard condition precedent; written ACER acknowledgement must be obtained and filed with Regulatory Affairs prior to the Board meeting; EMIR Refit — the bilateral forward qualifies as an OTC derivative under Art. 2(7); a derivative reporting addendum designating REGIS-TR as trade repository must be executed by Treasury, and a clearing threshold non-excess representation (EMIR Art. 10) is included in the agreement; RAAEY prior notification under L.4001/2011 Art. 11; and MiFID II Art. 2(1)(j) commodity exemption — confirmed applicable by Legal following classification review.',
  },
  {
    id: 'lc-2',
    ref: 'EMIR Refit Art. 2(7)',
    severity: 'high',
    description: 'OTC derivative addendum required; designated trade repository (REGIS-TR) must be named explicitly. Add EMIR Art. 10 clearing threshold non-excess representation to the implementation timeline.',
    targetSectionId: 's5',
    revisedBody:
      'Q3 2026: Contract negotiation; REMIT Art. 4 pre-trade notification filed with ACER (target: written acknowledgement received before Board meeting); RAAEY prior notification filed under L.4001/2011 Art. 11. Q4 2026: Contract signature conditional on ACER acknowledgement on file; commencement of first physical delivery period (Greek–Romanian interconnector, 400 MW NTC). Q1 2027: EMIR OTC derivative addendum executed, designating REGIS-TR as trade repository; EMIR Art. 10 clearing threshold non-excess representation in force. Mid-2027: Review of arrangement ahead of HEnEx–HUPX market coupling milestone; EMIR compliance review completed.',
  },
  {
    id: 'lc-3',
    ref: 'Legea energiei 123/2012',
    severity: 'advisory',
    description: 'Counterparty (CEO S.A.) must obtain ANRE approval for cross-border agreements >100 GWh/year. Add representation and warranty plus PPC termination right in Art. 6 of the agreement to the stakeholder section.',
    targetSectionId: 's6',
    revisedBody:
      'Internal stakeholders: Trading & Origination (lead, counterparty management), Legal (REMIT/EMIR/MiFID II compliance, Art. 6 representation drafting), Treasury (EMIR reporting, REGIS-TR registration, FX hedging), and Regulatory Affairs (RAAEY notification, ACER filing). External stakeholders: ACER (recipient of REMIT Art. 4 pre-trade notification; written acknowledgement required before signature), RAAEY (prior notification under L.4001/2011 Art. 11), HEnEx (market coupling coordination, 2027 milestone), ANRE (Romanian regulator — CEO S.A. must obtain ANRE approval for cross-border bilateral agreements exceeding 100 GWh/year; PPC to include representation and warranty and termination right in Art. 6 of the agreement), and CEO S.A. (counterparty, Romanian electricity producer, Fitch BB+). No direct impact on PPC retail customers or tariffs.',
  },
]

const LEGAL_TARGET_IDS = new Set(LEGAL_COMMENTS.map((c) => c.targetSectionId))

function LegalCommentCard({
  comment,
  resolved,
  onApply,
  onHoverStart,
  onHoverEnd,
}: {
  comment: LegalComment
  resolved: boolean
  onApply: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const sectionTitle = SECTION_TITLE_MAP.get(comment.targetSectionId)
  const isHigh = comment.severity === 'high'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all ${
        resolved
          ? 'bg-surface-raised border-border-subtle opacity-60'
          : isHigh
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${resolved ? 'text-slate-400' : isHigh ? 'text-red-500' : 'text-blue-500'}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
            resolved ? 'bg-surface text-slate-400' : isHigh ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {comment.severity}
          </span>
          <p className={`text-xs font-medium leading-snug ${
            resolved ? 'text-slate-400' : isHigh ? 'text-red-700' : 'text-blue-700'
          }`}>
            {comment.ref}
          </p>
        </div>
        <p className={`text-[11px] leading-snug ${resolved ? 'text-slate-400' : 'text-slate-600'}`}>
          {comment.description}
        </p>
        {sectionTitle && !resolved && (
          <p className="text-[10px] text-slate-400 mt-0.5">→ {sectionTitle}</p>
        )}
        {resolved && (
          <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <Check className="w-2.5 h-2.5" />
            Resolved
          </p>
        )}
      </div>
      {!resolved && (
        <button
          onClick={onApply}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors shrink-0 ${
            isHigh ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Apply
        </button>
      )}
    </motion.div>
  )
}

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
  const acceptFeedbackChanges = useRecoStore((s) => s.acceptFeedbackChanges)

  const returnedFn = reco
    ? (['legal', 'finance', 'compliance'] as ReviewFunction[]).find(
        (fn) => reco.reviews[fn].status === 'Returned'
      )
    : undefined
  const returnedReview = reco && returnedFn ? reco.reviews[returnedFn] : undefined
  const returnedComment = returnedReview?.comments[returnedReview.comments.length - 1]

  const [resolvedIds, setResolvedIds] = useState<Set<string>>(() => {
    const sections =
      useRecoStore.getState().recommendations.find((r) => r.id === recoId)?.contentSections ?? []
    const resolved = new Set<string>()
    for (const c of LEGAL_COMMENTS) {
      const current = sections.find((s) => s.id === c.targetSectionId)?.body
      if (current && current === c.revisedBody) resolved.add(c.id)
    }
    return resolved
  })
  const [hoverSectionId, setHoverSectionId] = useState<string | null>(null)
  const [typing, setTyping] = useState<{ sectionId: string; displayText: string } | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [showFullComment, setShowFullComment] = useState(false)

  const totalComments = LEGAL_COMMENTS.length
  const resolvedCount = resolvedIds.size
  const allResolved = resolvedCount === totalComments

  const applyComment = useCallback(
    (comment: LegalComment) => {
      if (resolvedIds.has(comment.id) || !reco) return
      updateContent(recoId, {
        contentSections: reco.contentSections.map((s) =>
          s.id === comment.targetSectionId ? { ...s, body: comment.revisedBody } : s
        ),
      })
      setResolvedIds((prev) => new Set([...prev, comment.id]))
      setHoverSectionId(null)

      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      let pos = TW_CHARS
      setTyping({ sectionId: comment.targetSectionId, displayText: comment.revisedBody.slice(0, pos) })
      typingTimerRef.current = setInterval(() => {
        pos += TW_CHARS
        if (pos >= comment.revisedBody.length) {
          clearInterval(typingTimerRef.current!)
          typingTimerRef.current = null
          setTyping(null)
        } else {
          setTyping({ sectionId: comment.targetSectionId, displayText: comment.revisedBody.slice(0, pos) })
        }
      }, TW_MS)
    },
    [reco, resolvedIds, recoId, updateContent]
  )

  const addressAll = useCallback(() => {
    if (!reco) return
    const remaining = LEGAL_COMMENTS.filter((c) => !resolvedIds.has(c.id))
    if (remaining.length === 0) return
    const finalSections = reco.contentSections.map((section) => {
      const match = remaining.find((c) => c.targetSectionId === section.id)
      return match ? { ...section, body: match.revisedBody } : section
    })
    updateContent(recoId, { contentSections: finalSections })
    remaining.forEach((c, i) => {
      setTimeout(() => setResolvedIds((prev) => new Set([...prev, c.id])), i * 140)
    })
    setHoverSectionId(null)
    if (typingTimerRef.current) { clearInterval(typingTimerRef.current); typingTimerRef.current = null }
    setTyping(null)
  }, [reco, resolvedIds, recoId, updateContent])

  const handleAccept = () => {
    acceptFeedbackChanges(recoId)
    onResubmit()
  }

  if (!reco) return null

  const isTypingSection = (sectionId: string) => typing?.sectionId === sectionId
  const isHoveredSection = (sectionId: string) => hoverSectionId === sectionId
  const isResolvedSection = (sectionId: string) => {
    const comment = LEGAL_COMMENTS.find((c) => c.targetSectionId === sectionId)
    return comment ? resolvedIds.has(comment.id) : false
  }

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to review status
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Review Legal Feedback</h1>
          <p className="text-slate-500 text-sm mt-1 line-clamp-1">{reco.title}</p>
        </div>
        <StatusBadge status={reco.status} />
      </div>

      {/* Returned comment (collapsible context) */}
      {returnedComment && returnedFn && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700">
              {FN_LABELS[returnedFn]} Review — Returned
            </span>
            <span className="text-xs text-amber-500">· {returnedComment.author}</span>
          </div>
          <p className={`text-sm text-amber-700 leading-relaxed ${!showFullComment ? 'line-clamp-2' : ''}`}>
            {returnedComment.text}
          </p>
          <button
            onClick={() => setShowFullComment((v) => !v)}
            className="text-xs text-amber-600 hover:text-amber-800 mt-1.5 underline underline-offset-2 transition-colors"
          >
            {showFullComment ? 'Show less' : 'Show full comment'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Document ────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-3">
          {reco.contentSections.map((section, idx) => {
            const isTarget = LEGAL_TARGET_IDS.has(section.id)
            const typing_ = isTypingSection(section.id)
            const hovered = isHoveredSection(section.id)
            const resolved = isResolvedSection(section.id)
            const displayBody = typing_ && typing ? typing.displayText : section.body

            return (
              <motion.div
                key={section.id}
                layout
                className={`bg-surface rounded-xl p-4 border transition-all duration-200 ${
                  typing_
                    ? 'ring-2 ring-agent/60 border-agent-dim/50 shadow-sm shadow-agent/10'
                    : hovered
                    ? 'ring-1 ring-agent/30 border-agent-dim/30'
                    : resolved && isTarget
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-surface-raised text-[10px] font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
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
                  {resolved && !typing_ && !hovered && isTarget && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full font-medium ml-auto shrink-0 flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5" />
                      Updated
                    </motion.span>
                  )}
                </div>
                <p className="text-sm leading-relaxed pl-7 text-slate-600">
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

          {reco.draftResolution && (
            <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                Draft Resolution
              </p>
              <p className="text-sm text-slate-700 leading-relaxed italic">{reco.draftResolution}</p>
            </div>
          )}
        </div>

        {/* ── Right column: Legal Comments ─────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Legal Feedback</h2>

          <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface">
            <div className="px-4 py-3 bg-surface-raised border-b border-border-subtle flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs font-semibold text-slate-700">Legal Comments</p>
              <span className="ml-auto text-[10px] text-slate-400">
                {resolvedCount}/{totalComments} resolved
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    animate={{ width: `${totalComments > 0 ? (resolvedCount / totalComments) * 100 : 0}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {allResolved
                    ? 'All comments addressed — ready to accept'
                    : `${resolvedCount} of ${totalComments} resolved · ${totalComments - resolvedCount} remaining`}
                </p>
              </div>

              {/* Comment cards */}
              <div className="space-y-2">
                {LEGAL_COMMENTS.map((comment) => (
                  <LegalCommentCard
                    key={comment.id}
                    comment={comment}
                    resolved={resolvedIds.has(comment.id)}
                    onApply={() => applyComment(comment)}
                    onHoverStart={() => setHoverSectionId(comment.targetSectionId)}
                    onHoverEnd={() => setHoverSectionId(null)}
                  />
                ))}
              </div>

              {/* Address all / Verify & accept */}
              <AnimatePresence mode="wait">
                {!allResolved ? (
                  <motion.button
                    key="address-all"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={addressAll}
                    className="w-full bg-amber-500 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3 h-3" />
                    Address all comments
                  </motion.button>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">All comments addressed</p>
                        <p className="text-xs text-emerald-600 mt-0.5">
                          3 changes integrated · sections 3, 5 &amp; 6 updated
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAccept}
                      className="w-full bg-brand text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-brand-dim transition-colors inline-flex items-center justify-center gap-1.5"
                    >
                      Verify &amp; accept version
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
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
