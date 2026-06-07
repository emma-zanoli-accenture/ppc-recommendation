import { useState } from 'react'
import { useRecoStore } from '@/store'
import { useAgent } from '@/agents/engine'
import {
  draftingAgentScript,
  legalReviewAgentScript,
  financeReviewAgentScript,
  complianceReviewAgentScript,
  readinessAgentScript,
} from '@/agents/scripts'

const AGENTS = [
  { key: 'drafting', script: draftingAgentScript },
  { key: 'legal', script: legalReviewAgentScript },
  { key: 'finance', script: financeReviewAgentScript },
  { key: 'compliance', script: complianceReviewAgentScript },
  { key: 'readiness', script: readinessAgentScript },
]

function AgentRunner({ script }: { script: (typeof AGENTS)[number]['script'] }) {
  const { phase, visibleSteps, streamedText, run, reset } = useAgent(script)
  return (
    <div className="border border-border-subtle rounded p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-brand">{script.agentName}</span>
        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={phase !== 'idle' && phase !== 'done'}
            className="bg-agent text-white px-2 py-0.5 rounded disabled:opacity-40"
          >
            Run
          </button>
          <button onClick={reset} className="bg-surface-raised text-slate-600 px-2 py-0.5 rounded">
            Reset
          </button>
        </div>
      </div>
      {phase !== 'idle' && (
        <div className="space-y-1">
          <div className="text-slate-500">
            Phase: <span className="text-agent font-mono">{phase}</span>
          </div>
          {visibleSteps.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleSteps.map((s, i) => (
                <span key={i} className="bg-agent-subtle text-agent px-2 py-0.5 rounded-full text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          )}
          {streamedText && (
            <div className="bg-surface-raised rounded p-2 text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {streamedText}
              {phase === 'streaming' && <span className="animate-pulse">▌</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DevInspector() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'agents' | 'store'>('agents')
  const { recommendations, resetDemo } = useRecoStore()

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[520px] font-mono text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-brand text-white px-4 py-2 rounded-lg shadow-lg text-sm font-sans font-medium"
      >
        {open ? '✕ Close Dev Inspector' : '🔧 Dev Inspector'}
      </button>

      {open && (
        <div className="mt-2 bg-surface border border-border-subtle rounded-lg shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border-subtle">
            {(['agents', 'store'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 px-4 py-2 text-xs font-sans font-medium capitalize ${
                  tab === t ? 'bg-brand-subtle text-brand border-b-2 border-brand' : 'text-slate-500 hover:bg-surface-raised'
                }`}
              >
                {t === 'agents' ? 'Agent Scripts' : `Store (${recommendations.length})`}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-[60vh] overflow-y-auto space-y-3">
            {tab === 'agents' && (
              <>
                <p className="text-slate-400 text-[10px]">
                  Click Run to play each agent script. Verify timing, steps, and streamed output.
                </p>
                {AGENTS.map(({ key, script }) => (
                  <AgentRunner key={key} script={script} />
                ))}
              </>
            )}

            {tab === 'store' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{recommendations.length} recommendations in store</span>
                  <button
                    onClick={resetDemo}
                    className="bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded text-[10px]"
                  >
                    Reset Demo
                  </button>
                </div>
                {recommendations.map((r) => (
                  <details key={r.id} className="border border-border-subtle rounded">
                    <summary className="px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-surface-raised">
                      <span className="font-sans text-slate-700 truncate max-w-[300px]">{r.title}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{r.status}</span>
                    </summary>
                    <pre className="p-3 bg-surface-raised text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(r, null, 2)}
                    </pre>
                  </details>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
