import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Save } from 'lucide-react'

// Cosmetic save / auto-save indicator. The store already persists every change to localStorage,
// so this is a visual affordance that demonstrates periodic auto-saving and a manual Save action.
const AUTOSAVE_MS = 15000 // auto-save every 15s
const SAVING_MS = 900 // how long the "Saving…" state is shown

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function SaveControl() {
  const [status, setStatus] = useState<'saved' | 'saving'>('saved')
  const [lastSaved, setLastSaved] = useState<Date>(() => new Date())
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)

  const runSave = useCallback(() => {
    setStatus('saving')
    if (savingTimer.current) clearTimeout(savingTimer.current)
    savingTimer.current = setTimeout(() => {
      if (!mounted.current) return
      setStatus('saved')
      setLastSaved(new Date())
    }, SAVING_MS)
  }, [])

  useEffect(() => {
    mounted.current = true
    const interval = setInterval(runSave, AUTOSAVE_MS)
    return () => {
      mounted.current = false
      clearInterval(interval)
      if (savingTimer.current) clearTimeout(savingTimer.current)
    }
  }, [runSave])

  return (
    <div className="flex items-center gap-2.5">
      <AnimatePresence mode="wait" initial={false}>
        {status === 'saving' ? (
          <motion.span
            key="saving"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400"
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Saving…
          </motion.span>
        ) : (
          <motion.span
            key="saved"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400"
            title="All changes auto-saved"
          >
            <Check className="w-3 h-3 text-emerald-500" />
            Saved · {fmtTime(lastSaved)}
          </motion.span>
        )}
      </AnimatePresence>

      <button
        onClick={runSave}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-border-strong rounded-lg px-2.5 py-1.5 hover:bg-surface-raised hover:text-slate-800 transition-colors"
        title="Save now"
      >
        <Save className="w-3.5 h-3.5" />
        Save
      </button>
    </div>
  )
}
