import { motion } from 'framer-motion'

interface Props {
  score: number // 0–100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const SIZES = {
  sm: { r: 22, stroke: 4, text: 'text-sm font-semibold', box: 56 },
  md: { r: 36, stroke: 6, text: 'text-xl font-bold', box: 88 },
  lg: { r: 52, stroke: 8, text: 'text-3xl font-bold', box: 120 },
}

function scoreColor(score: number): string {
  if (score >= 80) return '#059669' // emerald-600
  if (score >= 50) return '#2563EB' // blue-600
  if (score > 0) return '#D97706' // amber-600
  return '#CBD5E1' // slate-300
}

function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 50) return 'Fair'
  return 'Incomplete'
}

export default function ReadinessMeter({ score, size = 'md', showLabel = false }: Props) {
  const { r, stroke, text, box } = SIZES[size]
  const circumference = 2 * Math.PI * r
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference
  const color = scoreColor(score)
  const center = box / 2

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={box} height={box} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <motion.circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
        />
        {/* Score label — counter-rotate so it reads upright */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${center}px ${center}px`,
            fill: color,
          }}
          className={text}
        >
          {score}
        </text>
      </svg>
      {showLabel && (
        <span className="text-xs text-slate-500 font-medium">{scoreLabel(score)}</span>
      )}
    </div>
  )
}
