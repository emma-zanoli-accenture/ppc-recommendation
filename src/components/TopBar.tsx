import { Users, Scale, Crown, BookOpen, RotateCcw } from 'lucide-react'
import { useUIStore, type Persona } from '@/store/uiStore'
import { useRecoStore } from '@/store'
import { APP_NAME, PPC_CLIENT } from '@/lib/constants'

const PERSONAS: { id: Persona; label: string; sublabel: string; icon: React.ElementType }[] = [
  { id: 'bu', label: 'Business Unit', sublabel: 'Procurement', icon: Users },
  { id: 'review', label: 'Legal / Finance', sublabel: '/ Compliance', icon: Scale },
  { id: 'secretariat', label: 'Corporate', sublabel: 'Secretariat', icon: Crown },
]

export default function TopBar() {
  const { persona, setPersona, demoGuideOpen, toggleDemoGuide } = useUIStore()
  const resetDemo = useRecoStore((s) => s.resetDemo)

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-surface border-b border-border-subtle flex items-center px-4 gap-4 shadow-sm">
      {/* Brand lockup */}
      <div className="flex items-center gap-0 shrink-0 select-none">
        <span className="font-sans font-semibold text-lg text-brand tracking-tight">{APP_NAME}</span>
        <span className="text-agent mx-2 text-lg font-light">·</span>
        <span className="text-slate-400 text-sm font-normal">for {PPC_CLIENT}</span>
      </div>

      {/* Persona selector — centered */}
      <nav className="flex-1 flex justify-center">
        <div className="inline-flex items-center bg-surface-raised rounded-xl p-1 gap-1 border border-border-subtle">
          {PERSONAS.map(({ id, label, sublabel, icon: Icon }) => {
            const active = persona === id
            return (
              <button
                key={id}
                onClick={() => setPersona(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="leading-none">
                  <span className="block font-semibold">{label}</span>
                  <span className={`block text-[11px] font-normal ${active ? 'text-white/70' : 'text-slate-400'}`}>
                    {sublabel}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleDemoGuide}
          title="Demo Guide"
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all ${
            demoGuideOpen
              ? 'bg-agent-subtle text-agent border-agent-dim/50'
              : 'text-slate-500 border-border-subtle hover:bg-surface-raised'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        <button
          onClick={resetDemo}
          title="Reset Demo"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 px-3 py-2 rounded-lg border border-border-subtle hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  )
}
