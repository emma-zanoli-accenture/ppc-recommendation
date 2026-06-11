import { FileText, FileType, FileSpreadsheet, ExternalLink, X } from 'lucide-react'
import { DOCS_BY_ID, type DocType } from '@/data/documentRepository'
import { useUIStore } from '@/store/uiStore'

// Shared doc-type icon + colour (reused by the drawer and the evidence panel)
export const DOC_META: Record<DocType, { Icon: React.ElementType; color: string; label: string }> = {
  PDF: { Icon: FileText, color: 'text-red-500', label: 'PDF' },
  Word: { Icon: FileType, color: 'text-blue-500', label: 'DOCX' },
  Excel: { Icon: FileSpreadsheet, color: 'text-emerald-600', label: 'XLSX' },
}

interface Props {
  docIds: string[]
  // Enumerate as A, B, C… to mirror the εισήγηση attachment lettering
  lettered?: boolean
  emptyHint?: string
  onDetach?: (id: string) => void
}

export default function AttachmentList({ docIds, lettered = true, emptyHint, onDetach }: Props) {
  const setOpenDocumentId = useUIStore((s) => s.setOpenDocumentId)

  if (docIds.length === 0) {
    return emptyHint ? <p className="text-xs text-slate-400 italic">{emptyHint}</p> : null
  }

  return (
    <div className="space-y-1.5">
      {docIds.map((id, i) => {
        const doc = DOCS_BY_ID.get(id)
        if (!doc) return null
        const { Icon, color, label } = DOC_META[doc.docType]
        return (
          <div
            key={id}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border-subtle bg-surface hover:border-brand/40 transition-colors"
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
            <button
              onClick={() => setOpenDocumentId(id)}
              className="flex-1 min-w-0 text-left"
              title="Open preview"
            >
              <span className="text-xs font-medium text-slate-700 group-hover:text-brand transition-colors truncate block">
                {lettered ? `${String.fromCharCode(65 + i)}. ` : ''}
                {doc.title}
              </span>
              <span className="text-[10px] text-slate-400">
                {doc.owningUnit} · {doc.protocolNo}
              </span>
            </button>
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400 bg-surface-raised border border-border-subtle px-1.5 py-0.5 rounded">
              {label}
            </span>
            <button
              onClick={() => setOpenDocumentId(id)}
              className="text-slate-300 hover:text-brand transition-colors flex-shrink-0"
              title="Open preview"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {onDetach && (
              <button
                onClick={() => onDetach(id)}
                className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
