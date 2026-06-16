import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  Check,
  Zap,
  Pencil,
  Scale,
  ExternalLink,
  Search,
  Paperclip,
  Star,
  ScrollText,
} from 'lucide-react'
import { useRecoStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import AgentPanel from '@/components/AgentPanel'
import RecoCard from '@/components/RecoCard'
import SignatureBlock from '@/components/SignatureBlock'
import StatusBadge from '@/components/StatusBadge'
import Timeline from '@/components/Timeline'
import {
  draftingAgentScript,
  knowledgeRetrievalAssistantScript,
  resolutionAssistantScript,
  evidenceCollectionAgentScript,
  reviewPlanningAgentScript,
  reviewWorkflowAgentScript,
  complianceReviewAgentScript,
} from '@/agents/scripts'
import { statusColors } from '@/lib/statusColors'
import type { ReviewFunction, Recommendation, RecommendationStatus } from '@/lib/types'
import { RESOLUTION_STUB } from '@/agents/scripts/drafting'
import type { DraftingOutput, DraftSuggestion } from '@/agents/scripts/drafting'
import type { ResolutionOutput, EvidenceOutput } from '@/agents/scripts/assistants'
import { DOC_META } from '@/components/AttachmentList'
import SaveControl from '@/components/SaveControl'
import {
  DOCS_BY_ID,
  EVIDENCE_MATCH_IDS,
  RECOMMENDED_DOC_IDS,
  MISSING_EVIDENCE,
} from '@/data/documentRepository'

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

const FN_INFO: { fn: ReviewFunction; label: string; description: string; mandatory?: boolean }[] = [
  { fn: 'legal', label: 'Legal', description: 'Regulatory review — REMIT, EMIR, RAAEY, MiFID II' },
  { fn: 'finance', label: 'Finance', description: 'Financial impact, budget coverage, FX risk' },
  { fn: 'compliance', label: 'Compliance', description: 'Internal policy and governance alignment' },
  { fn: 'chairman', label: 'Chairman', description: 'Mandatory final sign-off — unlocked automatically after Legal, Finance and Compliance approve', mandatory: true },
]

const FN_LABELS: Record<ReviewFunction, string> = {
  legal: 'Legal',
  finance: 'Finance',
  compliance: 'Compliance',
  chairman: 'Chairman',
}

const REVIEW_STATUS_CLS: Record<string, string> = {
  Pending: 'text-slate-400',
  'In Review': 'text-blue-600',
  Approved: 'text-emerald-600',
  Returned: 'text-amber-600',
}

// ─── Regulatory reference data & badge ───────────────────────────────────────

const REG_REF_INFO: Record<string, { fullName: string; description: string; source: string }> = {
  'REMIT Art. 4': {
    fullName: 'REMIT — Regulation (EU) No 1227/2011',
    description: 'Wholesale Energy Market Integrity & Transparency. Mandatory pre-trade notification to ACER before contract signature; non-compliance constitutes market manipulation.',
    source: 'EU Regulation · European Parliament & Council',
  },
  'EMIR Refit': {
    fullName: 'EMIR Refit — Regulation (EU) 2019/834',
    description: 'European Market Infrastructure Regulation. OTC derivative reporting, clearing threshold assessment, and trade repository registration (REGIS-TR or DTCC).',
    source: 'EU Regulation · European Parliament & Council',
  },
  'ACER Guidance 2025': {
    fullName: 'ACER — Agency for the Cooperation of Energy Regulators',
    description: 'Cross-border capacity allocation oversight and REMIT enforcement guidance. Recipient of pre-trade notifications under REMIT Art. 4.',
    source: 'ACER Market Monitoring Report 2025',
  },
  'RAAEY L.4001/2011 Art. 11': {
    fullName: 'RAAEY — Regulatory Authority for Energy',
    description: 'Greek national energy regulator (successor to RAE). Prior notification required under Law 4001/2011 Art. 11 for cross-border commercial arrangements.',
    source: 'Greek Law · Ministry of Environment & Energy',
  },
  'MiFID II Art. 2(1)(j)': {
    fullName: 'MiFID II — Directive 2014/65/EU',
    description: 'Markets in Financial Instruments Directive. Art. 2(1)(j) commodity derivative exemption — classification review required for bilateral energy forwards.',
    source: 'EU Directive · European Parliament & Council',
  },
  'HEnEx Market Coupling Rules': {
    fullName: 'HEnEx — Hellenic Energy Exchange',
    description: 'Cross-border capacity allocation and market coupling rules. HEnEx–HUPX coupling scheduled for 2027; bilateral arrangements must align with coupling timeline.',
    source: 'HEnEx Exchange Rules · 2025',
  },
}

function RegulatoryRefBadge({
  refKey,
  isOpen,
  onToggle,
}: {
  refKey: string
  isOpen: boolean
  onToggle: () => void
}) {
  const info = REG_REF_INFO[refKey]
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
          isOpen
            ? 'bg-brand text-white border-brand shadow-sm'
            : 'bg-brand-subtle text-brand border-brand/20 hover:border-brand/50 hover:bg-brand/10'
        }`}
      >
        <Scale className="w-3 h-3 flex-shrink-0" />
        <span className="font-mono">{refKey}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 z-30 w-64 bg-surface border border-border-strong rounded-xl shadow-lg p-3 space-y-1.5"
          >
            <p className="text-xs font-semibold text-slate-800 leading-snug">{info?.fullName ?? refKey}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{info?.description}</p>
            <p className="text-[10px] text-slate-400 border-t border-border-subtle pt-1.5 flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              {info?.source}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Internal policy reference data & badge ──────────────────────────────────
// Distinct from regulations: internal PPC policies, shown in a slate/document style so they
// are not confused with the (brand-blue) external regulation badges.

const POLICY_REF_INFO: Record<string, { fullName: string; description: string; source: string }> = {
  'PPC Group Trading Policy v4.2': {
    fullName: 'PPC Group Trading Policy v4.2',
    description: 'Internal policy defining permitted trading instruments (Schedule A), commercial thresholds and approval levels for energy trading activity.',
    source: 'Internal Policy · PPC Group Corporate Governance',
  },
  'Group Authorisation Matrix (2025)': {
    fullName: 'Group Authorisation Matrix (GAM) — 2025 revision',
    description: 'Delegation-of-authority matrix setting approval levels by value and transaction type. Bilateral trading agreements above EUR 10M require Board of Directors approval; no sub-delegation permitted.',
    source: 'Internal Policy · PPC Group Corporate Governance',
  },
}

function PolicyBadge({
  policyKey,
  isOpen,
  onToggle,
}: {
  policyKey: string
  isOpen: boolean
  onToggle: () => void
}) {
  const info = POLICY_REF_INFO[policyKey]
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all ${
          isOpen
            ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
            : 'bg-surface-raised text-slate-600 border-border-strong hover:border-slate-400 hover:bg-surface'
        }`}
      >
        <ScrollText className="w-3 h-3 flex-shrink-0" />
        <span>{policyKey}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3 flex-shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 z-30 w-64 bg-surface border border-border-strong rounded-xl shadow-lg p-3 space-y-1.5"
          >
            <p className="text-xs font-semibold text-slate-800 leading-snug">{info?.fullName ?? policyKey}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{info?.description}</p>
            <p className="text-[10px] text-slate-400 border-t border-border-subtle pt-1.5 flex items-center gap-1">
              <ScrollText className="w-2.5 h-2.5 flex-shrink-0" />
              {info?.source}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
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
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'All'>('All')

  const statusCounts = buRecos.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const filtered = statusFilter === 'All' ? buRecos : buRecos.filter((r) => r.status === statusFilter)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Recommendation Owner</h1>
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Filter:</span>
          <button
            onClick={() => setStatusFilter('All')}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
              statusFilter === 'All'
                ? 'bg-brand text-white border-brand'
                : 'border-border-subtle text-slate-500 hover:border-border-strong hover:text-slate-700'
            }`}
          >
            All ({buRecos.length})
          </button>
          {Object.entries(statusCounts).map(([status, count]) => {
            const c = statusColors[status as RecommendationStatus]
            const active = statusFilter === status
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(active ? 'All' : status as RecommendationStatus)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                  active
                    ? `${c.text} ${c.bg} ${c.border} ring-2 ring-current ring-offset-1`
                    : `${c.text} bg-surface ${c.border} opacity-60 hover:opacity-100`
                }`}
              >
                {count} · {status}
              </button>
            )
          })}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
          My Recommendations
          {statusFilter !== 'All' && <span className="ml-1.5 font-normal normal-case text-slate-400">· {statusFilter}</span>}
          <span className="ml-1.5 font-normal text-slate-400">
            ({filtered.length}{statusFilter !== 'All' ? ` of ${buRecos.length}` : ''})
          </span>
        </h2>
        {filtered.length === 0 ? (
          <p className="text-slate-400 text-sm italic">
            {buRecos.length === 0
              ? 'No recommendations yet. Create one to get started.'
              : `No recommendations with status "${statusFilter}".`}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...filtered].reverse().map((r, i) => (
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
  const setOpenPrecedentId = useUIStore((s) => s.setOpenPrecedentId)

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

      {/* Step 1 · Knowledge Retrieval Assistant — precedent retrieval */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Knowledge Retrieval Assistant</h2>
          <p className="text-[11px] text-slate-400 mt-0.5 normal-case">
            retrieves similar past recommendations as precedent · orchestrated by Recopilot
          </p>
        </div>
        <AgentPanel
          script={knowledgeRetrievalAssistantScript}
          inputs={{
            business_need: (businessNeed || EXAMPLE_BUSINESS_NEED).slice(0, 80) + '…',
            scope: 'Cross-border energy trading · Greece–Romania',
          }}
          onSourceClick={setOpenPrecedentId}
        />
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

// ─── Evidence Collection — repository search results panel ──────────────────────

const RELEVANCE_CLS: Record<string, string> = {
  high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-surface-raised text-slate-400 border-border-subtle',
}

const EVIDENCE_POLICIES = (evidenceCollectionAgentScript.structuredOutput as EvidenceOutput).applicablePolicies

function EvidenceResultsPanel({
  attached,
  requested,
  onAttach,
  onAttachAll,
  onDetach,
  onRequest,
  onOpen,
}: {
  attached: Set<string>
  requested: Set<string>
  onAttach: (id: string) => void
  onAttachAll: () => void
  onDetach: (id: string) => void
  onRequest: (label: string) => void
  onOpen: (id: string) => void
}) {
  const attachedRecommended = RECOMMENDED_DOC_IDS.filter((id) => attached.has(id)).length
  const total = RECOMMENDED_DOC_IDS.length
  const allRecommendedAttached = attachedRecommended === total
  const [activeRef, setActiveRef] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="border border-border-subtle rounded-xl overflow-hidden bg-surface"
    >
      <div className="px-4 py-3 bg-surface-raised border-b border-border-subtle flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-agent" />
        <p className="text-xs font-semibold text-slate-700">Repository Search</p>
        <span className="ml-auto text-[10px] text-slate-400">
          {attachedRecommended}/{total} recommended attached
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-agent rounded-full"
              animate={{ width: `${total > 0 ? (attachedRecommended / total) * 100 : 0}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            {allRecommendedAttached
              ? 'All recommended documents attached'
              : `${attachedRecommended} of ${total} recommended documents attached`}
          </p>
        </div>

        {/* Search results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Search results ({EVIDENCE_MATCH_IDS.length})
            </p>
            {!allRecommendedAttached && (
              <button
                onClick={onAttachAll}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-agent hover:bg-agent-dim px-2 py-1 rounded-md transition-colors"
              >
                <Paperclip className="w-3 h-3" />
                Attach all recommended
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {EVIDENCE_MATCH_IDS.map((docId) => {
              const doc = DOCS_BY_ID.get(docId)
              if (!doc) return null
              const meta = DOC_META[doc.docType]
              const isAttached = attached.has(docId)
              return (
                <div
                  key={docId}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                    isAttached ? 'bg-emerald-50/40 border-emerald-200' : 'bg-surface border-border-subtle hover:border-brand/40'
                  }`}
                >
                  <meta.Icon className={`w-4 h-4 flex-shrink-0 ${meta.color}`} />
                  <button onClick={() => onOpen(docId)} className="flex-1 min-w-0 text-left" title="Open preview">
                    <span className="text-xs font-medium text-slate-700 truncate flex items-center gap-1">
                      {doc.title}
                      {doc.recommended && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />}
                    </span>
                    <span className="text-[10px] text-slate-400">{doc.owningUnit}</span>
                  </button>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded border ${RELEVANCE_CLS[doc.relevance]}`}>
                    {doc.relevance}
                  </span>
                  {isAttached ? (
                    <button
                      onClick={() => onDetach(docId)}
                      className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-1 flex-shrink-0"
                      title="Attached — click to remove"
                    >
                      <Check className="w-3 h-3" />
                      Attached
                    </button>
                  ) : (
                    <button
                      onClick={() => onAttach(docId)}
                      className="text-[10px] font-bold text-white bg-agent hover:bg-agent-dim px-2 py-1 rounded-md transition-colors flex-shrink-0"
                    >
                      Attach
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Applicable policies */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
            Applicable policies &amp; regulations
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {EVIDENCE_POLICIES.map((p) =>
              REG_REF_INFO[p] ? (
                <RegulatoryRefBadge
                  key={p}
                  refKey={p}
                  isOpen={activeRef === p}
                  onToggle={() => setActiveRef(activeRef === p ? null : p)}
                />
              ) : POLICY_REF_INFO[p] ? (
                <PolicyBadge
                  key={p}
                  policyKey={p}
                  isOpen={activeRef === p}
                  onToggle={() => setActiveRef(activeRef === p ? null : p)}
                />
              ) : (
                <span
                  key={p}
                  className="text-[10px] font-medium text-brand bg-brand-subtle border border-brand/20 px-2 py-0.5 rounded-full"
                >
                  {p}
                </span>
              )
            )}
          </div>
        </div>

        {/* Missing evidence — flagged by the assistant, actionable by the owner */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-amber-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Missing evidence ({MISSING_EVIDENCE.length})
          </p>
          {MISSING_EVIDENCE.map((m, i) => {
            const isRequested = requested.has(m.label)
            return (
              <div
                key={i}
                className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                  isRequested ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                {isRequested ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium leading-snug ${isRequested ? 'text-blue-700' : 'text-amber-700'}`}>
                    {m.label}
                  </p>
                  <p className={`text-[10px] leading-snug mt-0.5 ${isRequested ? 'text-blue-600/80' : 'text-amber-600/80'}`}>
                    {isRequested ? 'Requested — awaiting receipt. Logged to the audit trail.' : m.why}
                  </p>
                </div>
                {!isRequested && (
                  <button
                    onClick={() => onRequest(m.label)}
                    className="text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 px-2 py-1 rounded-md transition-colors flex-shrink-0"
                  >
                    Request
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
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
  const attachDocuments = useRecoStore((s) => s.attachDocuments)
  const detachDocument = useRecoStore((s) => s.detachDocument)
  const requestEvidence = useRecoStore((s) => s.requestEvidence)
  const setOpenPrecedentId = useUIStore((s) => s.setOpenPrecedentId)
  const setOpenDocumentId = useUIStore((s) => s.setOpenDocumentId)

  // Evidence Collection: reveal the repository-search results once the assistant has run
  const [evidenceRun, setEvidenceRun] = useState<boolean>(
    () => (useRecoStore.getState().recommendations.find((r) => r.id === recoId)?.attachments?.length ?? 0) > 0
  )

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
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [activeRef, setActiveRef] = useState<string | null>(null)

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

  // Resolution Assistant populates section 10 (the Co-Pilot left it as a structural placeholder)
  const handleResolutionComplete = useCallback(
    (output: unknown) => {
      const o = output as ResolutionOutput | null
      const current = useRecoStore.getState().recommendations.find((r) => r.id === recoId)
      if (!o?.draftResolution || !current) return
      updateContent(recoId, {
        contentSections: current.contentSections.map((s) =>
          s.id === 's10' ? { ...s, body: o.draftResolution } : s
        ),
        draftResolution: o.draftResolution,
      })
      // Typewriter the resolution into section 10
      if (typingTimerRef.current) clearInterval(typingTimerRef.current)
      let pos = TW_CHARS
      setTyping({ sectionId: 's10', displayText: o.draftResolution.slice(0, pos) })
      typingTimerRef.current = setInterval(() => {
        pos += TW_CHARS
        if (pos >= o.draftResolution.length) {
          clearInterval(typingTimerRef.current!)
          typingTimerRef.current = null
          setTyping(null)
        } else {
          setTyping({ sectionId: 's10', displayText: o.draftResolution.slice(0, pos) })
        }
      }, TW_MS)
    },
    [recoId, updateContent]
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

  const saveDraftEdit = useCallback((sectionId: string, body: string) => {
    if (!reco) return
    updateContent(recoId, {
      contentSections: reco.contentSections.map((s) =>
        s.id === sectionId ? { ...s, body } : s
      ),
    })
    setEditingSectionId(null)
  }, [reco, recoId, updateContent])

  if (!reco) return null

  const hasSections = reco.contentSections.length > 0
  const isStub = (sectionId: string) =>
    ALL_DRAFT_ITEMS.some((item) => item.targetSectionId === sectionId && !appliedIds.has(item.id))
  const isTyping = (sectionId: string) => typing?.sectionId === sectionId
  const isHovered = (sectionId: string) => hoverSectionId === sectionId

  return (
    <div className="space-y-6 lg:space-y-0 lg:h-[calc(100vh-8rem)] lg:flex lg:flex-col">
      {/* Top: breadcrumb + title (fixed) */}
      <div className="shrink-0 space-y-4 lg:pb-4">
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
          {hasSections && (
            <div className="ml-auto">
              <SaveControl />
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{reco.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{reco.businessUnit} · {reco.owner}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0">
        {/* ── Document (left pane, scrolls independently) ──────────── */}
        <div className="lg:col-span-2 space-y-4 lg:overflow-y-auto lg:min-h-0 lg:pr-2">
          {!hasSections ? (
            <div className="bg-surface border border-dashed border-border-strong rounded-xl p-10 text-center space-y-2">
              <p className="text-slate-500 text-sm font-medium">
                Run the Recommendation Assistant to scaffold the recommendation document.
              </p>
              <p className="text-xs text-slate-400 italic">
                11 sections (PPC εισήγηση format) · regulatory framework · draft resolution
              </p>
            </div>
          ) : (
            <>
              {/* Formal header block */}
              <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Proposing Business Unit:</span>
                    <span className="ml-2 text-slate-700">{reco.businessUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Protocol No.:</span>
                    <span className="ml-2 font-mono text-slate-700">EIS-2026-{reco.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Contact:</span>
                    <span className="ml-2 text-slate-700">{reco.owner} · 210 490 0000</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="ml-2 text-slate-700">
                      {new Date(reco.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="ml-2 text-slate-700">trading@ppcgroup.com</span>
                  </div>
                </div>
              </div>

              {/* Regulatory refs */}
              {reco.regulatoryRefs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reco.regulatoryRefs.map((ref) => (
                    <RegulatoryRefBadge
                      key={ref}
                      refKey={ref}
                      isOpen={activeRef === ref}
                      onToggle={() => setActiveRef(activeRef === ref ? null : ref)}
                    />
                  ))}
                </div>
              )}

              {/* Content sections */}
              <div className="space-y-3">
                {reco.contentSections.map((section, idx) => {
                  const stub = isStub(section.id) || (section.id === 's10' && section.body === RESOLUTION_STUB)
                  const typing_ = isTyping(section.id)
                  const hovered = isHovered(section.id)
                  // What to display: live typewriter text > store body
                  const displayBody = typing_ && typing ? typing.displayText : section.body
                  return (
                    <motion.div
                      key={section.id}
                      layout
                      className={`group bg-surface rounded-xl p-4 transition-all duration-200 border ${
                        typing_
                          ? 'ring-2 ring-agent/60 border-agent-dim/50 shadow-sm shadow-agent/10'
                          : hovered
                          ? 'ring-1 ring-agent/30 border-agent-dim/30'
                          : editingSectionId === section.id
                          ? 'ring-2 ring-brand/40 border-brand/40'
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
                        <div className="ml-auto flex items-center gap-1.5 shrink-0">
                          {stub && !typing_ && !hovered && editingSectionId !== section.id && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                              pending
                            </span>
                          )}
                          {hovered && !typing_ && (
                            <motion.span
                              initial={{ opacity: 0, x: 4 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-[10px] text-agent bg-agent-subtle border border-agent-dim/30 px-1.5 py-0.5 rounded-full font-medium"
                            >
                              ← will insert here
                            </motion.span>
                          )}
                          {typing_ && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
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
                          {!typing_ && editingSectionId !== section.id && section.id !== 's11' && (
                            <button
                              onClick={() => { setEditingSectionId(section.id); setEditBody(displayBody) }}
                              title="Edit manually"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 p-0.5 rounded"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {section.id === 's11' ? (
                        <div className="pl-7 mt-1">
                          <SignatureBlock reco={reco} />
                        </div>
                      ) : editingSectionId === section.id ? (
                        <div className="pl-7 space-y-1.5">
                          <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            autoFocus
                            rows={4}
                            className="w-full border border-brand/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-ink resize-none leading-relaxed"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingSectionId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveDraftEdit(section.id, editBody)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-white bg-brand hover:bg-brand-dim px-2.5 py-1 rounded-md transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Done
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm leading-relaxed pl-7 whitespace-pre-wrap ${
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
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Draft resolution — shown only when no s10 section */}
              {reco.draftResolution && !reco.contentSections.some((s) => s.id === 's10') && (
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

        {/* ── Right pane: agents + tasks (scrolls independently) ───── */}
        <div className="space-y-4 lg:overflow-y-auto lg:min-h-0 lg:pr-1">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Recommendation Assistant</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 normal-case">drafting specialist · orchestrated by Recopilot</p>
          </div>
          <AgentPanel
            script={draftingAgentScript}
            inputs={{
              business_unit: 'Procurement',
              title: reco.title,
              business_need: reco.businessNeed.slice(0, 80) + '…',
            }}
            onComplete={handleComplete}
            onSourceClick={setOpenPrecedentId}
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

          {/* Step 3 · Resolution Assistant + Step 4 · Evidence Collection Assistant */}
          <AnimatePresence>
            {hasSections && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Resolution Assistant</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 normal-case">draft-resolution options · section 10</p>
                </div>
                <AgentPanel
                  script={resolutionAssistantScript}
                  onComplete={handleResolutionComplete}
                  onSourceClick={setOpenPrecedentId}
                />

                <div>
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Evidence Collection Assistant</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 normal-case">searches the document repository & attaches supporting evidence</p>
                </div>
                <AgentPanel
                  script={evidenceCollectionAgentScript}
                  onComplete={() => setEvidenceRun(true)}
                  onSourceClick={setOpenPrecedentId}
                />

                {/* Repository search results — attach supporting documents */}
                <AnimatePresence>
                  {evidenceRun && (
                    <EvidenceResultsPanel
                      attached={new Set(reco.attachments ?? [])}
                      requested={new Set(reco.evidenceRequests ?? [])}
                      onAttach={(docId) => attachDocuments(recoId, [docId])}
                      onAttachAll={() => attachDocuments(recoId, RECOMMENDED_DOC_IDS)}
                      onDetach={(docId) => detachDocument(recoId, docId)}
                      onRequest={(label) => requestEvidence(recoId, label)}
                      onOpen={setOpenDocumentId}
                    />
                  )}
                </AnimatePresence>

                <div>
                  <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Compliance Review Agent</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5 normal-case">policy alignment · governance & AML screening · self-check before submission</p>
                </div>
                <AgentPanel
                  script={complianceReviewAgentScript}
                  inputs={{
                    document_title: reco.title,
                    regulatory_refs: reco.regulatoryRefs.join(', ') || 'none',
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer CTA (fixed) */}
      <AnimatePresence>
        {hasSections && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 flex items-center justify-between pt-4 lg:mt-4 border-t border-border-subtle"
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
    new Set<ReviewFunction>(['legal', 'finance', 'compliance', 'chairman'])
  )
  const [directMode, setDirectMode] = useState(false)
  const [reason, setReason] = useState('')

  if (!reco) return null

  const isMandatory = (fn: ReviewFunction) => FN_INFO.find((f) => f.fn === fn)?.mandatory ?? false

  const toggle = (fn: ReviewFunction) => {
    if (isMandatory(fn)) return // Chairman cannot be deselected
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(fn)) next.delete(fn)
      else next.add(fn)
      return next
    })
  }

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

      {!directMode && (
        <div className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Review Planning</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 normal-case">
              approval timing & reviewer routing · orchestrated by Recopilot
            </p>
          </div>
          <AgentPanel
            script={reviewPlanningAgentScript}
            inputs={{
              board_meeting: reco.boardMeetingDate,
              bod_deadline: reco.bodDeadline,
              notional: '> EUR 10M (cross-border, multi-year)',
            }}
          />
          <AgentPanel
            script={reviewWorkflowAgentScript}
            inputs={{
              recommendation_type: 'Cross-border bilateral energy trading',
              governance_rule: 'Group Authorisation Matrix · BoD threshold',
            }}
          />
        </div>
      )}

      <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
        {!directMode ? (
          <>
            <p className="text-sm font-medium text-slate-700">Select reviewers</p>
            <div className="space-y-2">
              {FN_INFO.map(({ fn, label, description, mandatory }) => (
                <label
                  key={fn}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    mandatory ? 'cursor-default' : 'cursor-pointer'
                  } ${
                    selected.has(fn)
                      ? 'border-brand/50 bg-brand-subtle'
                      : 'border-border-subtle hover:border-border-strong'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(fn)}
                    onChange={() => toggle(fn)}
                    disabled={mandatory}
                    className="mt-0.5 accent-brand disabled:opacity-70"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      {label}
                      {mandatory && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-brand text-white leading-none">
                          Mandatory
                        </span>
                      )}
                    </p>
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
            : (() => {
                const n = [...selected].filter((f) => f !== 'chairman').length
                return `Send to ${n} reviewer${n !== 1 ? 's' : ''} · Chairman signs off last`
              })()}
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
  const [docOpen, setDocOpen] = useState(false)
  const [activeRef, setActiveRef] = useState<string | null>(null)

  if (!reco) return null

  const isReturned = reco.status === 'Returned for Update'
  const allDone = reco.status === 'All Reviews Completed'
  const isSubmitted = ['Submitted to Secretariat', 'Ready for BoD', 'Submitted to BoD'].includes(
    reco.status
  )

  const activeReviews = (['legal', 'finance', 'compliance', 'chairman'] as ReviewFunction[]).filter(
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
        <div className="flex items-center gap-2.5 shrink-0">
          <StatusBadge status={reco.status} />
          {reco.contentSections.length > 0 && (
            <button
              onClick={() => setDocOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-border-subtle rounded-lg px-3 py-1.5 hover:bg-surface-raised transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {docOpen ? 'Hide document' : 'View document'}
              <motion.span animate={{ rotate: docOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            </button>
          )}
        </div>
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
                {reco.directToChairman
                  ? 'Sent directly to Chairman — standard review functions were bypassed.'
                  : 'Reviews are in progress. Check back after the review functions complete their assessment.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {(['legal', 'finance', 'compliance', 'chairman'] as ReviewFunction[]).map((fn) => {
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
                        {review.status === 'Returned' && <RotateCcw className="w-4 h-4" />}
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
                  Submitted to Secretariat
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

      {/* Collapsible document view */}
      <AnimatePresence>
        {docOpen && reco.contentSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 border-t border-border-subtle">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide pt-2">
                Recommendation Document
              </h2>

              {/* Formal header block */}
              <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Proposing Business Unit:</span>
                    <span className="ml-2 text-slate-700">{reco.businessUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Protocol No.:</span>
                    <span className="ml-2 font-mono text-slate-700">EIS-2026-{reco.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Contact:</span>
                    <span className="ml-2 text-slate-700">{reco.owner} · 210 490 0000</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="ml-2 text-slate-700">
                      {new Date(reco.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="ml-2 text-slate-700">trading@ppcgroup.com</span>
                  </div>
                </div>
              </div>

              {/* Regulatory refs */}
              {reco.regulatoryRefs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reco.regulatoryRefs.map((ref) => (
                    <RegulatoryRefBadge
                      key={ref}
                      refKey={ref}
                      isOpen={activeRef === ref}
                      onToggle={() => setActiveRef(activeRef === ref ? null : ref)}
                    />
                  ))}
                </div>
              )}

              {/* Sections — read-only */}
              <div className="space-y-3">
                {reco.contentSections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="bg-surface rounded-xl p-4 border border-border-subtle"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-surface-raised text-[10px] font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
                    </div>
                    {section.id === 's11' ? (
                      <div className="pl-7 mt-1">
                        <SignatureBlock reco={reco} />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed pl-7 text-slate-600 whitespace-pre-wrap">
                        {section.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Draft resolution — only if no s10 section */}
              {reco.draftResolution && !reco.contentSections.some((s) => s.id === 's10') && (
                <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                    Draft Resolution
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed italic">{reco.draftResolution}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    description: 'ACER pre-trade notification must be completed and acknowledged before contract signature. Add explicit condition precedent language in the Object section (sec. 3) and strengthen the risk analysis.',
    targetSectionId: 's3',
    revisedBody:
      'Scope: PPC S.A. seeks BoD authorisation to enter into a Bilateral Master Electricity Trading Agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for the physical exchange of up to 500 GWh/year of electricity across the Greek–Romanian interconnector (400 MW NTC). Tenor: 24 months with annual renewal option. Price indexation: HUPX/HEnEx quarterly average. Governing law: Greek law. Dispute resolution: Athens Court of First Instance (commercial disputes panel).\n\nAlternatives considered: (1) Exchange-based trading via HEnEx/HUPX — excluded due to insufficient liquidity for volumes above 200 GWh/year on the cross-border order book; (2) Capacity auction via ENTSO-E coordinated allocation — excluded as this mechanism does not support bilateral price indexation; (3) No-action — excluded due to identified commercial opportunity (EUR 3.5–4.5M p.a. net margin).\n\nKey transaction terms: Duration 24 months, annual renewal option. Penalty clauses: EUR 500,000 per occurrence for force majeure abuse. Option rights: annual volume uplift option of +100 GWh with 60-day notice. CONDITION PRECEDENT (REMIT Art. 4): Contract signature is subject to the written ACER acknowledgement of the pre-trade notification being on file with Regulatory Affairs and the Corporate Secretary, not less than 5 business days before the Board meeting.\n\nRisk analysis & mitigation: (1) Regulatory — REMIT/EMIR non-compliance (Likelihood: Low, Impact: High) — mitigated by conditions precedent in draft resolution; ACER acknowledgement is a hard regulatory gate; non-compliance would constitute market manipulation under REMIT Art. 8; (2) Financial — EUR/RON FX basis ~2.3% (Likelihood: Medium, Impact: Medium) — mitigated by Treasury forward hedging programme (EUR 750K cost, within budget); (3) Commercial — CEO S.A. Fitch BB+ default (Likelihood: Low, Impact: Medium) — mitigated by Credit Support Annex (EUR 5M threshold); (4) Operational — interconnector curtailment (Likelihood: Low, Impact: Low) — mitigated by force majeure clause and quarterly capacity review clause.',
  },
  {
    id: 'lc-2',
    ref: 'EMIR Refit Art. 2(7)',
    severity: 'high',
    description: 'OTC derivative addendum required; REGIS-TR must be named explicitly. Add EMIR addendum execution as a Q4 2026 milestone in the Timeline section (sec. 6).',
    targetSectionId: 's6',
    revisedBody:
      'Q3 2026: Contract negotiation and term sheet finalisation; REMIT Art. 4 pre-trade notification filed with ACER (written acknowledgement must be on file before BoD meeting — 5 business days\' notice requirement); RAAEY prior notification filed under L.4001/2011 Art. 11.\nQ4 2026: Contract signature — conditional on ACER written acknowledgement and RAAEY acknowledgement both on file; commencement of first physical delivery period (Greek–Romanian interconnector, 400 MW NTC). Within 30 days of signature: EMIR OTC derivative addendum executed designating REGIS-TR as trade repository per Board resolution ΔΣ-2023-015; EMIR Art. 10 clearing threshold non-excess representation in force.\nQ1 2027: Initial EMIR compliance review and clearing threshold recalculation; ANRE representation from CEO S.A. confirmed current.\nMid-2027: Scheduled review of arrangement ahead of HEnEx–HUPX market coupling milestone; Trading & Origination to provide updated impact assessment to BoD 6 months before coupling go-live.',
  },
  {
    id: 'lc-3',
    ref: 'Legea energiei 123/2012',
    severity: 'advisory',
    description: 'Counterparty (CEO S.A.) must obtain ANRE approval for cross-border agreements >100 GWh/year. Add representation and warranty plus PPC termination right in the Counterparty section (sec. 8).',
    targetSectionId: 's8',
    revisedBody:
      '8.1 Counterparty Identification: Complexul Energetic Oltenia S.A. (CEO S.A.), registered in Romania (Registration No. J28/11/1998, VAT RO 2814214). Ownership: Romanian state via Ministry of Energy 77.15%; listed on Bucharest Stock Exchange (ticker: OLT). Credit rating: Fitch BB+ (stable outlook), confirmed June 2026.\n\nKYC completed 3 June 2026: AML screening — PASS; international sanctions (EU/UN/OFAC) — CLEAR; anti-corruption due diligence — NO adverse findings. Related-Party check: NOT a Related Party per PPC Group Related-Party Policy (confirmed Group Legal, 5 June 2026).\n\nANRE representation & warranty: pursuant to Art. 6 of the Master Agreement, CEO S.A. represents and warrants that it holds all requisite ANRE approvals for cross-border bilateral electricity agreements of this type and volume (>100 GWh/year under Legea energiei 123/2012). PPC has an express contractual termination right in the event that ANRE approval is withdrawn or suspended during the contract term.\n\n8.2 Authorizations: The CEO of PPC S.A. is authorised to execute all transaction documents up to EUR 40M notional. The CTO is authorised to execute the EMIR OTC derivative addendum; sub-delegation to Group Treasurer is permitted in writing. The Board of Directors shall be informed within 10 business days of execution and satisfaction of all conditions precedent set out in the draft resolution.',
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
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [activeRef, setActiveRef] = useState<string | null>(null)

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

  const saveUpdateEdit = useCallback((sectionId: string, body: string) => {
    if (!reco) return
    updateContent(recoId, {
      contentSections: reco.contentSections.map((s) =>
        s.id === sectionId ? { ...s, body } : s
      ),
    })
    setEditingSectionId(null)
  }, [reco, recoId, updateContent])

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
    <div className="space-y-6 lg:space-y-0 lg:h-[calc(100vh-8rem)] lg:flex lg:flex-col">
      {/* Top: back + title + returned context (fixed) */}
      <div className="shrink-0 space-y-4 lg:pb-4">
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
        <div className="flex items-center gap-3 shrink-0">
          <SaveControl />
          <StatusBadge status={reco.status} />
        </div>
      </div>

      {/* Returned comment (collapsible context) */}
      {returnedComment && returnedFn && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4 text-amber-500" />
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0">
        {/* ── Document (left pane, scrolls independently) ──────────── */}
        <div className="lg:col-span-2 space-y-3 lg:overflow-y-auto lg:min-h-0 lg:pr-2">
          {/* Formal header block */}
          {reco.contentSections.length > 0 && (
            <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Proposing Business Unit:</span>
                  <span className="ml-2 text-slate-700">{reco.businessUnit}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Protocol No.:</span>
                  <span className="ml-2 font-mono text-slate-700">EIS-2026-{reco.id.slice(-4).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Contact:</span>
                  <span className="ml-2 text-slate-700">{reco.owner} · 210 490 0000</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Date:</span>
                  <span className="ml-2 text-slate-700">
                    {new Date(reco.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="ml-2 text-slate-700">trading@ppcgroup.com</span>
                </div>
              </div>
            </div>
          )}
          {reco.regulatoryRefs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reco.regulatoryRefs.map((ref) => (
                <RegulatoryRefBadge
                  key={ref}
                  refKey={ref}
                  isOpen={activeRef === ref}
                  onToggle={() => setActiveRef(activeRef === ref ? null : ref)}
                />
              ))}
            </div>
          )}
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
                className={`group bg-surface rounded-xl p-4 border transition-all duration-200 ${
                  typing_
                    ? 'ring-2 ring-agent/60 border-agent-dim/50 shadow-sm shadow-agent/10'
                    : hovered
                    ? 'ring-1 ring-agent/30 border-agent-dim/30'
                    : editingSectionId === section.id
                    ? 'ring-2 ring-brand/40 border-brand/40'
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
                  <div className="ml-auto flex items-center gap-1.5 shrink-0">
                    {hovered && !typing_ && (
                      <motion.span
                        initial={{ opacity: 0, x: 4 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] text-agent bg-agent-subtle border border-agent-dim/30 px-1.5 py-0.5 rounded-full font-medium"
                      >
                        ← will insert here
                      </motion.span>
                    )}
                    {typing_ && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                    {resolved && !typing_ && !hovered && isTarget && editingSectionId !== section.id && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1"
                      >
                        <Check className="w-2.5 h-2.5" />
                        Updated
                      </motion.span>
                    )}
                    {!typing_ && editingSectionId !== section.id && section.id !== 's11' && (
                      <button
                        onClick={() => { setEditingSectionId(section.id); setEditBody(displayBody) }}
                        title="Edit manually"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                {section.id === 's11' ? (
                  <div className="pl-7 mt-1">
                    <SignatureBlock reco={reco} />
                  </div>
                ) : editingSectionId === section.id ? (
                  <div className="pl-7 space-y-1.5">
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      autoFocus
                      rows={4}
                      className="w-full border border-brand/30 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 bg-ink resize-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingSectionId(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveUpdateEdit(section.id, editBody)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white bg-brand hover:bg-brand-dim px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed pl-7 text-slate-600 whitespace-pre-wrap">
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
                )}
              </motion.div>
            )
          })}

          {reco.draftResolution && !reco.contentSections.some((s) => s.id === 's10') && (
            <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                Draft Resolution
              </p>
              <p className="text-sm text-slate-700 leading-relaxed italic">{reco.draftResolution}</p>
            </div>
          )}
        </div>

        {/* ── Right pane: Feedback Co-Pilot (scrolls independently) ── */}
        <div className="space-y-4 lg:overflow-y-auto lg:min-h-0 lg:pr-1">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Legal Feedback</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 normal-case">consolidated by the Feedback Co-Pilot · orchestrated by Recopilot</p>
          </div>

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
                          3 changes integrated · sections 3, 6 &amp; 8 updated
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
