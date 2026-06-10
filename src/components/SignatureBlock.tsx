import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import type { Recommendation, RecommendationStatus } from '@/lib/types'

// Named constants for governance-tier signatories (role placeholders; names shown when signed)
const SEC_GGD_ENERGY    = 'G. Lamprakis'
const SEC_GGD_FINANCE   = 'S. Andriopoulou'
const SEC_LEGAL_COUNSEL = 'V. Oikonomou'

const BEYOND_REVIEW = new Set<RecommendationStatus>([
  'All Reviews Completed',
  'Submitted to Secretariat',
  'Ready for BoD',
  'Submitted to BoD',
])

function fmtDate(ts: string | undefined): string {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function auditTs(reco: Recommendation, action: string): string | undefined {
  return [...reco.auditLog].reverse().find((e) => e.action === action)?.timestamp
}

export interface SigSlot {
  id: string
  role: string
  getName: (r: Recommendation) => string | null
  signed: (r: Recommendation) => boolean
  bypassed: (r: Recommendation) => boolean
  getTs: (r: Recommendation) => string | undefined
}

export interface SigTier {
  label: string
  note?: string
  slots: SigSlot[]
}

export const SIG_TIERS: SigTier[] = [
  {
    label: 'Hierarchy',
    slots: [
      {
        id: 'h1',
        role: 'Director, Trading & Origination',
        getName: (r) => r.owner,
        signed: (r) => BEYOND_REVIEW.has(r.status) || !!r.directToChairman,
        bypassed: () => false,
        getTs: (r) =>
          auditTs(r, 'Legal feedback integrated — version accepted') ??
          auditTs(r, 'Sent directly to Chairman') ??
          auditTs(r, 'Submitted to Corporate Secretariat'),
      },
    ],
  },
  {
    label: 'Parallel Bodies',
    slots: [
      {
        id: 'pb-legal',
        role: 'Director, Legal Department',
        getName: (r) => r.reviews.legal.reviewer ?? null,
        signed: (r) => r.reviews.legal.status.startsWith('Approved'),
        bypassed: (r) => !!r.directToChairman && !r.reviews.legal.status.startsWith('Approved'),
        getTs: (r) =>
          r.reviews.legal.reviewedAt ??
          auditTs(r, 'Legal review approved') ??
          auditTs(r, 'Legal feedback integrated — version accepted'),
      },
      {
        id: 'pb-finance',
        role: 'Director, Finance & Treasury',
        getName: (r) => r.reviews.finance.reviewer ?? null,
        signed: (r) => r.reviews.finance.status.startsWith('Approved'),
        bypassed: (r) => !!r.directToChairman && !r.reviews.finance.status.startsWith('Approved'),
        getTs: (r) => r.reviews.finance.reviewedAt ?? auditTs(r, 'Finance review approved'),
      },
      {
        id: 'pb-compliance',
        role: 'Director, Regulatory Affairs',
        getName: (r) => r.reviews.compliance.reviewer ?? null,
        signed: (r) => r.reviews.compliance.status.startsWith('Approved'),
        bypassed: (r) =>
          !!r.directToChairman && !r.reviews.compliance.status.startsWith('Approved'),
        getTs: (r) =>
          r.reviews.compliance.reviewedAt ?? auditTs(r, 'Compliance review approved'),
      },
    ],
  },
  {
    label: 'Group General Directors',
    note: 'Collected at Board meeting',
    slots: [
      {
        id: 'ggd1',
        role: 'Group General Director, Energy Trading & International Development',
        getName: () => SEC_GGD_ENERGY,
        signed: () => false,
        bypassed: () => false,
        getTs: () => undefined,
      },
      {
        id: 'ggd2',
        role: 'Group General Director, Finance',
        getName: () => SEC_GGD_FINANCE,
        signed: () => false,
        bypassed: () => false,
        getTs: () => undefined,
      },
    ],
  },
  {
    label: 'Legal Counsel / GD Legal Affairs & Corporate Governance',
    note: 'Collected at Board meeting',
    slots: [
      {
        id: 'lc1',
        role: 'Legal Counsel / GD Legal Affairs & Corporate Governance',
        getName: () => SEC_LEGAL_COUNSEL,
        signed: () => false,
        bypassed: () => false,
        getTs: () => undefined,
      },
    ],
  },
]

export default function SignatureBlock({ reco }: { reco: Recommendation }) {
  const allSlots = SIG_TIERS.flatMap((t) => t.slots)
  const signedCount = allSlots.filter((s) => s.signed(reco)).length
  const total = allSlots.length

  return (
    <div className="space-y-3">
      <span
        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          signedCount === total
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : signedCount === 0
            ? 'bg-surface-raised text-slate-400 border-border-subtle'
            : 'bg-brand-subtle text-brand border-brand/20'
        }`}
      >
        {signedCount} of {total} signed
      </span>

      {SIG_TIERS.map((tier) => (
        <div key={tier.label}>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {tier.label}
            </p>
            {tier.note && (
              <p className="text-[10px] text-slate-300 italic">{tier.note}</p>
            )}
          </div>
          <div className="space-y-1">
            {tier.slots.map((slot) => {
              const isSigned = slot.signed(reco)
              const isBypassed = slot.bypassed(reco)
              const name = isSigned ? slot.getName(reco) : null
              const ts = isSigned ? slot.getTs(reco) : undefined

              return (
                <motion.div
                  key={slot.id}
                  layout
                  className={`flex items-start gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    isSigned
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : isBypassed
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : 'border-dashed border-slate-200 bg-surface'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isSigned ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </motion.div>
                    ) : (
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                          isBypassed ? 'border-amber-300' : 'border-dashed border-slate-300'
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {isSigned ? (
                      <>
                        <p className="font-semibold text-slate-700 leading-snug">
                          {name ?? slot.role}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                          {slot.role}{ts ? ` · ${fmtDate(ts)}` : ''}
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className={`italic leading-snug ${
                            isBypassed ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          {slot.role}
                        </p>
                        {isBypassed && (
                          <p className="text-[10px] text-amber-500 mt-0.5">Review bypassed</p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
