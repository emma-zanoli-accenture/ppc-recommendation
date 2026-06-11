import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Play, RotateCcw, Zap, Package, ListOrdered, Code2, ArrowRight, BookOpen, ExternalLink, Layers } from 'lucide-react'
import { useAgent } from '@/agents/engine'
import type { AgentScript, Cognition } from '@/agents/engine'
import { KB_PAST_RECS_BY_ID } from '@/data/knowledgeBase'
import AgentBadge from './AgentBadge'

// Cognitive-layer badge colours (deck legend: Perceive / Reason / Act)
const COG_CLS: Record<Cognition, string> = {
  Perceive: 'bg-blue-50 text-blue-600 border-blue-200',
  Reason: 'bg-agent-subtle text-agent border-agent-dim/30',
  Act: 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

interface Props {
  script: AgentScript
  inputs?: Record<string, string>
  onComplete?: (output: unknown) => void
  onSourceClick?: (id: string) => void
  className?: string
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-agent"
            animate={{ opacity: [0.25, 1, 0.25], y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <span className="text-sm text-slate-400 italic">Analysing…</span>
    </div>
  )
}

function ThinkingShimmer() {
  return (
    <div className="space-y-3">
      <ThinkingDots />
      <div className="space-y-2 pt-1">
        {[88, 72, 60].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-agent-subtle"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}

function StatusPill({ phase }: { phase: string }) {
  const isRunning = phase === 'thinking' || phase === 'stepping' || phase === 'streaming'
  const isDone = phase === 'done'

  if (phase === 'idle') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-surface-raised px-2 py-0.5 rounded-full border border-border-subtle">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        Ready
      </span>
    )
  }

  if (isDone) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <Check className="w-2.5 h-2.5" />
        Done
      </span>
    )
  }

  if (isRunning) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-agent bg-agent-subtle px-2 py-0.5 rounded-full border border-agent-dim/30">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-agent flex-shrink-0"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        Running
      </span>
    )
  }

  return null
}

function UnderTheHoodPanel({
  script,
  inputs,
  onSourceClick,
}: {
  script: AgentScript
  inputs?: Record<string, string>
  onSourceClick?: (id: string) => void
}) {
  return (
    <div className="border-t border-border-subtle bg-ink/60 p-5 space-y-5 font-mono text-xs">
      {/* Orchestration flow */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          Orchestration
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-brand-subtle text-brand px-2.5 py-1 rounded-lg border border-brand/20 text-[11px] font-semibold">
            <Zap className="w-3 h-3" />
            Recopilot
          </span>
          <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <span className="inline-flex items-center gap-1.5 bg-agent-subtle text-agent px-2.5 py-1 rounded-lg border border-agent-dim/30 text-[11px] font-medium">
            {script.agentName}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
          agent id: <span className="text-slate-500">{script.agentId}</span>
        </p>
      </div>

      {/* Classification — deck legend: activity type + cognitive layer (P/R/A) */}
      {(script.activityType || (script.cognition && script.cognition.length > 0)) && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3 h-3" />
            Classification
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pl-1">
            {script.activityType && (
              <span className="inline-flex items-center gap-1 bg-agent-subtle text-agent border border-agent-dim/30 px-2 py-0.5 rounded-md text-[10px] font-medium">
                {script.activityType}
              </span>
            )}
            {script.cognition?.map((c) => {
              const cls = COG_CLS[c]
              return (
                <span
                  key={c}
                  title={`Cognitive layer: ${c}`}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${cls}`}
                >
                  {c[0]}
                  <span className="font-medium">{c}</span>
                </span>
              )
            })}
          </div>
          <p className="text-[9px] text-slate-400 mt-1.5 pl-1">
            Cognitive layer — <span className="text-blue-500 font-semibold">P</span>erceive ·{' '}
            <span className="text-agent font-semibold">R</span>eason ·{' '}
            <span className="text-emerald-600 font-semibold">A</span>ct
          </p>
        </div>
      )}

      {/* Inputs */}
      {inputs && Object.keys(inputs).length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            Inputs
          </p>
          <div className="space-y-1 pl-1">
            {Object.entries(inputs).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-brand shrink-0 min-w-[80px]">{k}:</span>
                <span className="text-slate-500 truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning steps */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
          <ListOrdered className="w-3 h-3" />
          Reasoning steps ({script.steps.length})
        </p>
        <ol className="space-y-1 pl-1">
          {script.steps.map((s, i) => (
            <li key={i} className="flex gap-2 text-slate-500">
              <span className="text-brand shrink-0 w-4 text-right">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Knowledge base sources */}
      {script.sources && script.sources.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3 h-3" />
            Knowledge base sources ({script.sources.length})
          </p>
          <div className="space-y-1.5 pl-1">
            {script.sources.map((src) => {
              const rec = KB_PAST_RECS_BY_ID.get(src.id)
              return (
                <div key={src.id} className="flex gap-2">
                  <span className="text-brand shrink-0 font-mono text-[10px] mt-0.5">{src.id}</span>
                  <div>
                    {rec && (
                      <button
                        onClick={() => onSourceClick?.(src.id)}
                        className="text-slate-600 hover:text-brand transition-colors text-left"
                      >
                        {rec.title}
                      </button>
                    )}
                    <p className="text-slate-400 text-[10px] leading-snug mt-0.5">{src.relevance}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Structured output */}
      {script.structuredOutput != null && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
            <Code2 className="w-3 h-3" />
            Structured output
          </p>
          <pre className="text-slate-500 text-[10px] overflow-x-auto max-h-48 leading-relaxed bg-surface rounded-lg p-3 border border-border-subtle">
            {JSON.stringify(script.structuredOutput, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function AgentPanel({ script, inputs, onComplete, onSourceClick, className = '' }: Props) {
  const [underHood, setUnderHood] = useState(false)
  const { phase, visibleSteps, streamedText, run, reset } = useAgent(script, onComplete)

  const isRunning = phase === 'thinking' || phase === 'stepping' || phase === 'streaming'
  const hasOutput = phase === 'streaming' || phase === 'done'

  return (
    <motion.div
      className={`border rounded-xl overflow-hidden bg-surface ${className} ${
        isRunning ? 'border-agent-dim/50 shadow-sm shadow-agent/10' : 'border-agent-dim/20'
      }`}
      animate={isRunning ? { borderColor: 'rgba(109, 40, 217, 0.5)' } : { borderColor: 'rgba(109, 40, 217, 0.2)' }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated top bar during run */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            className="h-0.5 bg-gradient-to-r from-agent-subtle via-agent to-agent-subtle"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ originX: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-agent-subtle/30 border-b border-agent-dim/15">
        <div className="flex items-center gap-2.5">
          <AgentBadge name={script.agentName} isRunning={isRunning} />
          <StatusPill phase={phase} />
        </div>
        <div className="flex items-center gap-2">
          {/* Compact re-run when panel is collapsed in done state */}
          {phase === 'done' && !underHood && (
            <button
              onClick={run}
              title="Re-run agent"
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setUnderHood((v) => !v)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              underHood ? 'text-agent font-medium' : 'text-slate-400 hover:text-agent'
            }`}
          >
            Under the Hood
            <motion.span animate={{ rotate: underHood ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
        </div>
      </div>

      {/* Body — always visible while running; collapses when done and Under the Hood is off */}
      <AnimatePresence initial={false}>
        {(phase !== 'done' || underHood) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
        <div className="p-4 space-y-3">
        {/* Thinking indicator with shimmer skeleton */}
        {phase === 'thinking' && <ThinkingShimmer />}

        {/* Reasoning step chips */}
        {(phase === 'stepping' || hasOutput) && visibleSteps.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {visibleSteps.map((step, i) => (
                <motion.span
                  key={step + i}
                  initial={{ opacity: 0, scale: 0.82, x: -6 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="inline-flex items-center gap-1.5 bg-agent-subtle text-agent border border-agent-dim/30 text-xs px-2.5 py-0.5 rounded-full"
                >
                  <span className="text-agent/50 font-mono text-[10px]">{i + 1}</span>
                  <Check className="w-2.5 h-2.5 flex-shrink-0" />
                  {step}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Streamed result */}
        {hasOutput && streamedText && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ink rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line border-l-2 border-agent"
          >
            {streamedText}
            {phase === 'streaming' && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.55, repeat: Infinity, ease: 'linear' }}
                className="text-agent font-medium"
              >
                ▌
              </motion.span>
            )}
          </motion.div>
        )}

        {/* Idle placeholder */}
        {phase === 'idle' && (
          <p className="text-sm text-slate-400 italic">Ready to run {script.agentName}.</p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-1">
          {(phase === 'idle' || phase === 'done') && (
            <button
              onClick={run}
              className="inline-flex items-center gap-1.5 bg-brand text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-brand-dim transition-colors"
            >
              <Play className="w-3 h-3" />
              {phase === 'done' ? 'Re-run' : `Run ${script.agentName}`}
            </button>
          )}
          {isRunning && (
            <span className="text-xs text-slate-400 italic animate-pulse">Running…</span>
          )}
          {phase !== 'idle' && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grounded in — always visible when done and sources exist */}
      <AnimatePresence>
        {phase === 'done' && script.sources && script.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-3"
          >
            <div className="bg-brand-subtle/60 border border-brand/15 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-brand/70 font-semibold mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" />
                Grounded in · {script.sources.length} past recommendation{script.sources.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {script.sources.map((src) => {
                  const rec = KB_PAST_RECS_BY_ID.get(src.id)
                  if (!rec) return null
                  return (
                    <button
                      key={src.id}
                      onClick={() => onSourceClick?.(src.id)}
                      title={src.relevance}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border bg-surface text-brand border-brand/20 hover:border-brand/50 hover:bg-brand/5 transition-all"
                    >
                      <span className="truncate max-w-[160px]">{rec.title}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Under the Hood panel */}
      <AnimatePresence>
        {underHood && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <UnderTheHoodPanel script={script} inputs={inputs} onSourceClick={onSourceClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
