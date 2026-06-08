import { Bot } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
  name: string
  isRunning?: boolean
}

export default function AgentBadge({ name, isRunning = false }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-agent-subtle text-agent text-xs px-2.5 py-1 rounded-full font-medium border border-agent-dim/30">
      <motion.span
        className="flex items-center"
        animate={isRunning ? { scale: [1, 1.18, 1] } : {}}
        transition={isRunning ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <Bot className="w-3 h-3 flex-shrink-0" />
      </motion.span>
      {name}
      {isRunning && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-agent flex-shrink-0"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </span>
  )
}
