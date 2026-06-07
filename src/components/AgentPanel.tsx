import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Play, RotateCcw } from 'lucide-react'
import { useAgent } from '@/agents/engine'
import type { AgentScript } from '@/agents/engine'
import AgentBadge from './AgentBadge'

interface Props {
  script: AgentScript
  inputs?: Record<string, string>
  onComplete?: (output: unknown) => void
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

export default function AgentPanel({ script, inputs, onComplete, className = '' }: Props) {
  const [underHood, setUnderHood] = useState(false)
  const { phase, visibleSteps, streamedText, run, reset } = useAgent(script, onComplete)

  const isRunning = phase === 'thinking' || phase === 'stepping' || phase === 'streaming'
  const hasOutput = phase === 'streaming' || phase === 'done'

  return (
    <div className={`border border-agent-dim/30 rounded-xl overflow-hidden bg-surface ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-agent-subtle/40 border-b border-agent-dim/20">
        <AgentBadge name={script.agentName} />
        <button
          onClick={() => setUnderHood((v) => !v)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-agent transition-colors"
        >
          Under the Hood
          <motion.span animate={{ rotate: underHood ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.span>
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Thinking indicator */}
        {phase === 'thinking' && <ThinkingDots />}

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
                  className="inline-flex items-center gap-1 bg-agent-subtle text-agent border border-agent-dim/40 text-xs px-2 py-0.5 rounded-full"
                >
                  <Check className="w-2.5 h-2.5 flex-shrink-0" />
                  {step}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Streamed result */}
        {hasOutput && streamedText && (
          <div className="bg-ink rounded-lg p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
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
          </div>
        )}

        {/* Idle placeholder */}
        {phase === 'idle' && (
          <p className="text-sm text-slate-400 italic">
            Ready to run {script.agentName}.
          </p>
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
            <span className="text-xs text-slate-400 italic">Running…</span>
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

      {/* Under the Hood panel */}
      <AnimatePresence>
        {underHood && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-border-subtle bg-ink/60 p-4 space-y-4 font-mono text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Orchestrator</p>
                <p className="text-slate-500">Recopilot called:</p>
                <p className="text-agent mt-0.5">{script.agentName} <span className="text-slate-400 text-[10px]">· {script.agentId}</span></p>
              </div>

              {inputs && Object.keys(inputs).length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Inputs</p>
                  <div className="space-y-0.5">
                    {Object.entries(inputs).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-brand shrink-0">{k}:</span>
                        <span className="text-slate-500 truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                  Reasoning steps ({script.steps.length})
                </p>
                <ol className="space-y-0.5">
                  {script.steps.map((s, i) => (
                    <li key={i} className="text-slate-500">
                      <span className="text-brand mr-1.5">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>

              {script.structuredOutput != null && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Structured output</p>
                  <pre className="text-slate-500 text-[10px] overflow-x-auto max-h-48 leading-relaxed">
                    {JSON.stringify(script.structuredOutput, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
