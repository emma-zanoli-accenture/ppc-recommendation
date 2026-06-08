import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, X } from 'lucide-react'
import { PAST_RECOMMENDATIONS } from '@/data/knowledgeBase'
import PrecedentDrawer from '@/components/PrecedentDrawer'
import { useUIStore } from '@/store/uiStore'

const OUTCOME_STYLES = {
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Approved with conditions': 'bg-amber-50 text-amber-700 border-amber-200',
  'Deferred': 'bg-slate-100 text-slate-600 border-slate-300',
}

const ALL_BUS = Array.from(new Set(PAST_RECOMMENDATIONS.map((r) => r.businessUnit))).sort()
const ALL_REFS = Array.from(new Set(PAST_RECOMMENDATIONS.flatMap((r) => r.regulatoryRefs))).sort()

export default function KnowledgeBase() {
  const setKbOpen = useUIStore((s) => s.setKbOpen)
  const [selectedBU, setSelectedBU] = useState<string | null>(null)
  const [selectedRef, setSelectedRef] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = PAST_RECOMMENDATIONS.filter((r) => {
    if (selectedBU && r.businessUnit !== selectedBU) return false
    if (selectedRef && !r.regulatoryRefs.includes(selectedRef)) return false
    return true
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-5xl mx-auto px-4 py-8 space-y-6"
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-brand" />
            <h1 className="text-2xl font-semibold text-slate-800">Knowledge Base</h1>
            <span className="text-sm font-medium text-slate-400 bg-surface-raised border border-border-subtle px-2.5 py-0.5 rounded-full">
              {PAST_RECOMMENDATIONS.length} past recommendations
            </span>
          </div>
          <p className="text-sm text-slate-500 pl-7">
            Structured archive of past BoD recommendations and their resolutions — powering agent grounding and precedent citations.
          </p>
        </div>
        <button
          onClick={() => setKbOpen(false)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors shrink-0 border border-border-subtle rounded-lg px-3 py-1.5 hover:bg-surface-raised"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">Business unit</span>
          <button
            onClick={() => setSelectedBU(null)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
              !selectedBU ? 'bg-brand text-white border-brand' : 'bg-surface text-slate-500 border-border-subtle hover:border-slate-300'
            }`}
          >
            All
          </button>
          {ALL_BUS.map((bu) => (
            <button
              key={bu}
              onClick={() => setSelectedBU(selectedBU === bu ? null : bu)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                selectedBU === bu ? 'bg-brand text-white border-brand' : 'bg-surface text-slate-500 border-border-subtle hover:border-slate-300'
              }`}
            >
              {bu}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">Regulatory ref</span>
          <button
            onClick={() => setSelectedRef(null)}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
              !selectedRef ? 'bg-brand text-white border-brand' : 'bg-surface text-slate-500 border-border-subtle hover:border-slate-300'
            }`}
          >
            All
          </button>
          {ALL_REFS.map((ref) => (
            <button
              key={ref}
              onClick={() => setSelectedRef(selectedRef === ref ? null : ref)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${
                selectedRef === ref ? 'bg-brand text-white border-brand' : 'bg-brand-subtle text-brand border-brand/20 hover:border-brand/50'
              }`}
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rec, i) => (
          <motion.button
            key={rec.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: i * 0.04 }}
            onClick={() => setSelectedId(rec.id)}
            className="bg-surface border border-border-subtle rounded-xl p-4 text-left flex flex-col gap-3 hover:border-brand/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${OUTCOME_STYLES[rec.outcome]}`}>
                {rec.outcome}
              </span>
              <span className="text-[11px] text-slate-400 shrink-0">
                {new Date(rec.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{rec.title}</h3>

            {/* Summary excerpt */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{rec.summary}</p>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-[11px] text-slate-400 font-medium">{rec.businessUnit}</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {rec.regulatoryRefs.slice(0, 3).map((ref) => (
                  <span
                    key={ref}
                    className="bg-brand-subtle text-brand text-[10px] font-medium px-2 py-0.5 rounded-full border border-brand/20"
                  >
                    {ref}
                  </span>
                ))}
                {rec.regulatoryRefs.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{rec.regulatoryRefs.length - 3}</span>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          No past recommendations match the selected filters.
        </div>
      )}

      <PrecedentDrawer id={selectedId} onClose={() => setSelectedId(null)} />
    </motion.div>
  )
}
