import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { DOCS_BY_ID } from '@/data/documentRepository'
import { APP_NAME, PPC_CLIENT } from '@/lib/constants'
import { DOC_META } from './AttachmentList'

interface Props {
  id: string | null
  onClose: () => void
}

export default function DocumentDrawer({ id, onClose }: Props) {
  const doc = id ? DOCS_BY_ID.get(id) : null
  const meta = doc ? DOC_META[doc.docType] : null

  return (
    <AnimatePresence>
      {doc && meta && (
        <>
          {/* Backdrop */}
          <motion.div
            key="doc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="doc-drawer"
            initial={{ x: 460, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 460, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed right-0 top-0 h-full w-[460px] z-50 bg-surface border-l border-border-strong shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-border-subtle bg-surface shrink-0">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex-shrink-0">
                  <meta.Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    Supporting Document · {meta.label}
                  </p>
                  <h2 className="text-sm font-semibold text-slate-800 leading-snug">{doc.title}</h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 transition-colors shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body — rendered as a document preview */}
            <div className="flex-1 overflow-y-auto bg-ink/40 p-5">
              <div className="bg-white border border-border-strong rounded-lg shadow-sm mx-auto max-w-full p-6 space-y-5">
                {/* Faux document letterhead */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <p className="font-semibold text-sm text-brand tracking-tight">
                      {APP_NAME}
                      <span className="text-slate-300 font-light mx-1">·</span>
                      <span className="text-slate-400 font-normal text-xs">for {PPC_CLIENT}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{doc.owningUnit}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 leading-relaxed">
                    <p className="font-mono text-slate-500">{doc.protocolNo}</p>
                    <p>
                      {new Date(doc.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="uppercase tracking-widest text-slate-300">Confidential</p>
                  </div>
                </div>

                {/* Title + summary */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug">{doc.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{doc.summary}</p>
                </div>

                {/* Body sections */}
                <div className="space-y-4">
                  {doc.preview.map((section, i) => (
                    <div key={i}>
                      <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                        {section.heading}
                      </p>
                      {section.table ? (
                        <div className="overflow-x-auto border border-slate-200 rounded">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                {section.table.columns.map((c) => (
                                  <th key={c} className="text-left font-semibold text-slate-600 px-2.5 py-1.5">
                                    {c}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {section.table.rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-slate-100 last:border-0">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="px-2.5 py-1.5 text-slate-600 align-top">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {section.lines?.map((line, li) => (
                            <p key={li} className="text-[11px] text-slate-600 leading-relaxed">
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Applicable policies footer */}
                {doc.applicablePolicies.length > 0 && (
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-1.5">
                      Applicable policies / regulations
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {doc.applicablePolicies.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] font-medium text-brand bg-brand-subtle border border-brand/20 px-2 py-0.5 rounded-full"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-[9px] text-slate-300 italic text-center pt-2">
                  Mocked document — generated for demonstration purposes.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
