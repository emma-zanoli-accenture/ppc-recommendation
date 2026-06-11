import { useState, useRef, useCallback, useEffect } from 'react'

// Deck legend — activity types and the cognitive layer (Perceive / Reason / Act).
export type ActivityType =
  | 'User activity'
  | 'Fully automatic'
  | 'Agentic support'
  | 'ETRM-licensed tool'
  | 'Reinvented with AI'

export type Cognition = 'Perceive' | 'Reason' | 'Act'

export interface AgentScript {
  agentId: string
  agentName: string
  steps: string[]
  result: string
  structuredOutput?: unknown
  sources?: { id: string; relevance: string }[]
  // Deck-faithful tags surfaced in "Under the Hood"
  activityType?: ActivityType
  cognition?: Cognition[]
}

export type AgentPhase = 'idle' | 'thinking' | 'stepping' | 'streaming' | 'done'

export interface AgentState {
  phase: AgentPhase
  visibleSteps: string[]
  streamedText: string
  structuredOutput?: unknown
  run: () => void
  reset: () => void
}

const THINKING_MS = 600
const STEP_MS = 300
const STREAM_CHARS = 5
const STREAM_MS = 16

export function useAgent(
  script: AgentScript,
  onComplete?: (output: unknown) => void
): AgentState {
  const [phase, setPhase] = useState<AgentPhase>('idle')
  const [visibleSteps, setVisibleSteps] = useState<string[]>([])
  const [streamedText, setStreamedText] = useState('')

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const scriptRef = useRef(script)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { scriptRef.current = script }, [script])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    return () => { timers.current.forEach(clearTimeout) }
  }, [])

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('idle')
    setVisibleSteps([])
    setStreamedText('')
  }, [])

  const run = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('thinking')
    setVisibleSteps([])
    setStreamedText('')

    const s = scriptRef.current
    let t = THINKING_MS

    // Reveal steps one by one
    timers.current.push(setTimeout(() => setPhase('stepping'), t))
    s.steps.forEach((step) => {
      t += STEP_MS
      timers.current.push(setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step])
      }, t))
    })

    // Start streaming result
    t += STEP_MS
    timers.current.push(setTimeout(() => setPhase('streaming'), t))

    const text = s.result
    const chunks = Math.ceil(text.length / STREAM_CHARS)
    for (let i = 0; i < chunks; i++) {
      const end = Math.min((i + 1) * STREAM_CHARS, text.length)
      const capturedEnd = end
      timers.current.push(setTimeout(() => {
        setStreamedText(text.slice(0, capturedEnd))
      }, t + i * STREAM_MS))
    }

    // Done
    t += chunks * STREAM_MS + STREAM_MS
    timers.current.push(setTimeout(() => {
      setStreamedText(text)
      setPhase('done')
      onCompleteRef.current?.(s.structuredOutput)
    }, t))
  }, [])

  return { phase, visibleSteps, streamedText, structuredOutput: script.structuredOutput, run, reset }
}
