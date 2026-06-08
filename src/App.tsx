import { AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import TopBar from '@/components/TopBar'
import DemoGuide from '@/components/DemoGuide'
import BusinessUnit from '@/personas/BusinessUnit'
import ReviewFunctions from '@/personas/ReviewFunctions'
import Secretariat from '@/personas/Secretariat'

export default function App() {
  const persona = useUIStore((s) => s.persona)
  const resetKey = useUIStore((s) => s.resetKey)

  return (
    <div className="min-h-screen bg-ink font-sans">
      <TopBar />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {persona === 'bu' && <BusinessUnit key={`bu-${resetKey}`} />}
          {persona === 'review' && <ReviewFunctions key={`review-${resetKey}`} />}
          {persona === 'secretariat' && <Secretariat key={`secretariat-${resetKey}`} />}
        </AnimatePresence>
      </main>
      <DemoGuide />
    </div>
  )
}
