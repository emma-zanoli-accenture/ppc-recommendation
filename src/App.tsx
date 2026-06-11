import { AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import TopBar from '@/components/TopBar'
import DemoGuide from '@/components/DemoGuide'
import PrecedentDrawer from '@/components/PrecedentDrawer'
import DocumentDrawer from '@/components/DocumentDrawer'
import BusinessUnit from '@/personas/BusinessUnit'
import ReviewFunctions from '@/personas/ReviewFunctions'
import Secretariat from '@/personas/Secretariat'
import KnowledgeBase from '@/personas/KnowledgeBase'

export default function App() {
  const persona = useUIStore((s) => s.persona)
  const resetKey = useUIStore((s) => s.resetKey)
  const kbOpen = useUIStore((s) => s.kbOpen)
  const openPrecedentId = useUIStore((s) => s.openPrecedentId)
  const setOpenPrecedentId = useUIStore((s) => s.setOpenPrecedentId)
  const openDocumentId = useUIStore((s) => s.openDocumentId)
  const setOpenDocumentId = useUIStore((s) => s.setOpenDocumentId)

  return (
    <div className="min-h-screen bg-ink font-sans">
      <TopBar />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          {kbOpen && <KnowledgeBase key="kb" />}
          {!kbOpen && persona === 'bu' && <BusinessUnit key={`bu-${resetKey}`} />}
          {!kbOpen && persona === 'review' && <ReviewFunctions key={`review-${resetKey}`} />}
          {!kbOpen && persona === 'secretariat' && <Secretariat key={`secretariat-${resetKey}`} />}
        </AnimatePresence>
      </main>
      <DemoGuide />
      <PrecedentDrawer id={openPrecedentId} onClose={() => setOpenPrecedentId(null)} />
      <DocumentDrawer id={openDocumentId} onClose={() => setOpenDocumentId(null)} />
    </div>
  )
}
