import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import { KB_PAST_RECS_BY_ID } from '@/data/knowledgeBase'
import type { PrecedentSnippet } from '@/data/knowledgeBase'

const OUTCOME_STYLES = {
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Approved with conditions': 'bg-amber-50 text-amber-700 border-amber-200',
  'Deferred': 'bg-slate-100 text-slate-600 border-slate-300',
}

function SnippetItem({ snippet }: { snippet: PrecedentSnippet }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-surface-raised transition-colors"
      >
        <span className="text-sm font-medium text-slate-700">{snippet.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="px-3 pb-3 pt-1 text-xs text-slate-600 leading-relaxed border-t border-border-subtle bg-ink/40">
              {snippet.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface Props {
  id: string | null
  onClose: () => void
}

export default function PrecedentDrawer({ id, onClose }: Props) {
  const rec = id ? KB_PAST_RECS_BY_ID.get(id) : null

  return (
    <AnimatePresence>
      {rec && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 h-full w-[420px] z-50 bg-surface border-l border-border-strong shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border-subtle bg-surface shrink-0">
              <div className="space-y-1.5 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Past Recommendation</p>
                <h2 className="text-sm font-semibold text-slate-800 leading-snug">{rec.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-600 bg-surface-raised border border-border-subtle px-2 py-0.5 rounded-full">
                  {rec.businessUnit}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(rec.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${OUTCOME_STYLES[rec.outcome]}`}>
                  {rec.outcome}
                </span>
              </div>

              {/* Summary */}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1.5">Summary</p>
                <p className="text-sm text-slate-600 leading-relaxed">{rec.summary}</p>
              </div>

              {/* Regulatory refs */}
              {rec.regulatoryRefs.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">Regulatory references</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.regulatoryRefs.map((ref) => (
                      <span
                        key={ref}
                        className="bg-brand-subtle text-brand text-xs font-medium px-2.5 py-0.5 rounded-full border border-brand/20"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BoD Resolution */}
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">BoD Resolution</p>
                <div className="border-l-4 border-brand/40 pl-4 py-1 bg-brand-subtle/30 rounded-r-lg">
                  <p className="text-sm text-slate-700 leading-relaxed italic">{rec.resolution}</p>
                </div>
              </div>

              {/* Reusable snippets */}
              {rec.snippets.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                    Reusable clauses ({rec.snippets.length})
                  </p>
                  <div className="space-y-2">
                    {rec.snippets.map((snippet) => (
                      <SnippetItem key={snippet.id} snippet={snippet} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
