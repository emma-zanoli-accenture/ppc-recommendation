interface Props {
  name: string
}

export default function AgentBadge({ name }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-agent-subtle text-agent text-xs px-2.5 py-0.5 rounded-full font-medium border border-agent-dim">
      <span className="w-1.5 h-1.5 rounded-full bg-agent flex-shrink-0" />
      {name}
    </span>
  )
}
