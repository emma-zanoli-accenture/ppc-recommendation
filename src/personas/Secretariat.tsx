import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  User,
  Send,
  Clock,
  Package,
  X,
  BarChart2,
} from 'lucide-react'
import jsPDF from 'jspdf'
import { useRecoStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import AgentPanel from '@/components/AgentPanel'
import RecoCard from '@/components/RecoCard'
import SignatureBlock, { SIG_TIERS } from '@/components/SignatureBlock'
import StatusBadge from '@/components/StatusBadge'
import ReadinessMeter from '@/components/ReadinessMeter'
import Timeline from '@/components/Timeline'
import { readinessAgentScript } from '@/agents/scripts'
import { daysUntil } from '@/lib/utils'
import { statusColors } from '@/lib/statusColors'
import type { Recommendation, RecommendationStatus, ReviewFunction } from '@/lib/types'
import type { ReadinessOutput } from '@/agents/scripts/readiness'

// ─── Types ────────────────────────────────────────────────────────────────────

type SecView = 'dashboard' | 'detail'

const PAGE = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.18 },
}

const PIPELINE_STATUSES: RecommendationStatus[] = [
  'Submitted to Chairman',
  'Ready for BoD',
  'Submitted to BoD',
]

// Statuses visible in the Chairman's dashboard (used to scope the Stats panel)
const CHAIRMAN_SCOPE: RecommendationStatus[] = [
  'All Reviews Completed',
  'Submitted to Chairman',
  'Ready for BoD',
  'Submitted to BoD',
]

const FN_LABELS: Record<ReviewFunction, string> = {
  legal: 'Legal',
  finance: 'Finance',
  compliance: 'Compliance',
}

// ─── PDF generator ────────────────────────────────────────────────────────────

function generateBodPackPDF(reco: Recommendation, packItems: string[]) {
  const doc = new jsPDF('p', 'mm', 'a4')

  // ── Layout constants ──
  const W = 210
  const ML = 18        // margin left
  const MR = 18        // margin right
  const MT = 16        // margin top (body pages)
  const FOOTER_Y = 285 // footer baseline
  const SAFE_BOTTOM = FOOTER_Y - 10  // content must not go below this
  const CW = W - ML - MR  // 174mm content width

  // ── Palette ──
  const NAVY:   [n,n,n] = [15, 39, 68]
  const ACCENT: [n,n,n] = [46, 158, 247]
  const TEXT:   [n,n,n] = [30, 41, 59]
  const MED:    [n,n,n] = [71, 85, 105]
  const LIGHT:  [n,n,n] = [148, 163, 184]
  const BORDER: [n,n,n] = [226, 232, 240]
  const WHITE:  [n,n,n] = [255, 255, 255]
  const GREEN:  [n,n,n] = [5, 150, 105]
  const AMBER:  [n,n,n] = [180, 120, 0]
  const BRAND:  [n,n,n] = [15, 39, 68]
  const BRAND_MID: [n,n,n] = [60, 90, 130]

  type n = number

  let y = 0

  // ── Sanitize: replace characters outside Latin-1 ──
  const san = (s: string): string =>
    s
      .replace(/•/g, '-')          // bullet •
      .replace(/–|—/g, '-')   // en/em dash
      .replace(/“|”/g, '"')   // curly quotes
      .replace(/‘|’/g, "'")   // curly apostrophes
      .replace(/\uD83D[\uDC00-\uDFFF]|[☀-➿]/g, '')  // emoji/symbols
      .replace(/[^\x00-\xFF]/g, '')     // strip remaining non-Latin-1
      .replace(/ {2,}/g, ' ')

  // ── Page break guard ──
  const needY = (h: number) => {
    if (y + h > SAFE_BOTTOM) { doc.addPage(); y = MT }
  }

  // ── Horizontal rule ──
  const hRule = (color: [n,n,n] = BORDER, lw = 0.2, extraGap = 3) => {
    doc.setDrawColor(...color)
    doc.setLineWidth(lw)
    doc.line(ML, y, W - MR, y)
    y += extraGap
  }

  // ── Section heading (label + optional sub-label) ──
  const heading = (label: string, sub?: string) => {
    needY(18)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...NAVY)
    doc.text(san(label).toUpperCase(), ML, y)
    y += 5
    // short accent underline
    doc.setDrawColor(...ACCENT)
    doc.setLineWidth(0.8)
    doc.line(ML, y, ML + 22, y)
    y += 4
    if (sub) {
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...LIGHT)
      doc.text(san(sub), ML, y)
      y += 5
    }
  }

  // ── Paragraph (line-by-line with page breaks, handles \n) ──
  const para = (
    text: string,
    size: number,
    color: [n,n,n] = MED,
    indent = 0,
    italic = false,
    afterGap = 4
  ) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', italic ? 'italic' : 'normal')
    doc.setTextColor(...color)
    const maxW = CW - indent
    const lh = size * 0.38 + 1.5
    const segments = san(text).split('\n')
    segments.forEach((seg, si) => {
      if (seg.trim() === '') {
        // blank line between paragraphs — small vertical gap
        if (si > 0 && si < segments.length - 1) y += lh * 0.5
        return
      }
      const wrapped = doc.splitTextToSize(seg, maxW) as string[]
      wrapped.forEach(ln => {
        needY(lh + 1)
        doc.text(ln, ML + indent, y)
        y += lh
      })
    })
    y += afterGap
  }

  // ── Footer renderer (called at the very end) ──
  const renderFooters = (totalPages: number) => {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.2)
      doc.line(ML, FOOTER_Y - 4, W - MR, FOOTER_Y - 4)
      doc.setFontSize(6.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...LIGHT)
      doc.text(
        `EIS-2026-${reco.id.slice(-4).toUpperCase()}   |   Generated by Recopilot   |   ${new Date().toLocaleDateString('en-GB')}`,
        ML, FOOTER_Y
      )
      doc.text(`Page ${i} of ${totalPages}`, W - MR, FOOTER_Y, { align: 'right' })
    }
  }

  // ════════════════════════════════════════════════
  // PAGE 1 — COVER HEADER
  // ════════════════════════════════════════════════

  // Navy band
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 55, 'F')
  doc.setFillColor(...ACCENT)
  doc.rect(0, 53.5, W, 2, 'F')

  // Eyebrow
  doc.setTextColor(...LIGHT)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('BOARD OF DIRECTORS  ·  PPC GROUP  ·  CONFIDENTIAL', ML, 13)

  // Title
  doc.setTextColor(...WHITE)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  const titleW = doc.splitTextToSize(san(reco.title), CW - 10)
  doc.text(titleW, ML, 24)

  // Meta line (below title, clamp so it doesn't overlap)
  const titleEndY = 24 + (titleW.length - 1) * (14 * 0.38 + 1.5)
  const metaY = Math.max(titleEndY + 6, 46)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(160, 190, 225)
  doc.text(
    `Board Meeting: ${san(reco.boardMeetingDate)}   ·   Deadline: ${san(reco.bodDeadline)}   ·   Readiness: ${reco.readinessScore}/100`,
    ML, Math.min(metaY, 50)
  )

  y = 62

  // ── Formal memo header block ──
  doc.setFillColor(248, 250, 252)
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.25)
  doc.roundedRect(ML, y, CW, 24, 1.5, 1.5, 'FD')

  const col1 = ML + 4, col2 = ML + 52, col3 = ML + 108, col4 = ML + 148
  const rowLabel = y + 6
  const rowVal   = rowLabel + 5.5

  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...LIGHT)
  doc.text('PROPOSING UNIT',  col1, rowLabel)
  doc.text('CONTACT / EMAIL', col2, rowLabel)
  doc.text('PROTOCOL NO.',    col3, rowLabel)
  doc.text('DATE',            col4, rowLabel)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...TEXT)
  doc.text(san(reco.businessUnit),         col1, rowVal)
  doc.text(`${san(reco.owner)}  /  trading@ppcgroup.com`, col2, rowVal)
  doc.text(`EIS-2026-${reco.id.slice(-4).toUpperCase()}`, col3, rowVal)
  doc.text(
    new Date(reco.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    col4, rowVal
  )

  // Separator between labels and values
  doc.setDrawColor(...BORDER)
  doc.setLineWidth(0.15)
  doc.line(col1, rowLabel + 1.5, W - MR - 4, rowLabel + 1.5)

  y += 30

  // ── BoD Pack Contents ──
  heading('BoD Pack Contents')
  packItems.forEach((item, i) => {
    needY(6.5)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...MED)
    doc.text(`${i + 1}.  ${san(item)}`, ML + 4, y)
    y += 6
  })

  y += 6
  hRule(BORDER, 0.25, 5)

  // ── Business Need ──
  heading('Business Need', `${san(reco.businessUnit)}  ·  ${san(reco.owner)}`)
  para(reco.businessNeed, 8.5)

  // ════════════════════════════════════════════════
  // RECOMMENDATION SECTIONS (s1 – s11)
  // ════════════════════════════════════════════════

  if (reco.contentSections.length > 0) {
    needY(20)
    hRule(BORDER, 0.25, 5)
    heading('Recommendation Document', 'Full recommendation per PPC board recommendation format')

    reco.contentSections.forEach((section, idx) => {
      needY(18)

      // Number badge
      const bSz = 5.5
      doc.setFillColor(...NAVY)
      doc.roundedRect(ML, y - bSz + 1, bSz, bSz, 0.7, 0.7, 'F')
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...WHITE)
      const n = String(idx + 1)
      doc.text(n, ML + (n.length === 1 ? 1.6 : 0.7), y - 0.5)

      // Title
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...NAVY)
      doc.text(san(section.title), ML + 8, y)
      y += 5

      // Thin underline
      doc.setDrawColor(...BORDER)
      doc.setLineWidth(0.15)
      doc.line(ML + 8, y - 0.5, W - MR, y - 0.5)
      y += 2.5

      // Body text
      if (section.id === 's11') {
        // Signature table — render dynamically from reco state
        const allSlots = SIG_TIERS.flatMap((t) => t.slots)
        const signedCount = allSlots.filter((s) => s.signed(reco)).length
        const chairmanBypassedCount = allSlots.filter((s) => s.chairmanBypassed(reco)).length
        const clearedCount = signedCount + chairmanBypassedCount

        needY(6)
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...(clearedCount === allSlots.length ? GREEN : AMBER))
        let sigSummary = `${signedCount} of ${allSlots.length} signatures collected`
        if (chairmanBypassedCount > 0) sigSummary += `  |  ${chairmanBypassedCount} authorised by Chairman`
        doc.text(sigSummary, ML + 8, y)
        y += 6

        const chairmanApprovedAt = reco.directToChairman?.approvedAt

        for (const tier of SIG_TIERS) {
          needY(8)
          doc.setFontSize(6.5)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...LIGHT)
          doc.text(san(tier.label).toUpperCase(), ML + 8, y)
          y += 4.5

          for (const slot of tier.slots) {
            const isSigned = slot.signed(reco)
            const isChairmanBypassed = slot.chairmanBypassed(reco)
            const isBypassed = slot.bypassed(reco)
            const name = isSigned ? slot.getName(reco) : null
            const ts = isSigned ? slot.getTs(reco) : undefined

            needY(7)

            if (isSigned) {
              doc.setFillColor(236, 253, 243)
              doc.roundedRect(ML + 8, y - 4.5, CW - 8, 6, 0.5, 0.5, 'F')

              doc.setFontSize(7.5)
              doc.setFont('helvetica', 'bold')
              doc.setTextColor(...TEXT)
              const nameStr = san(name ?? slot.role)
              doc.text(nameStr, ML + 11, y)

              doc.setFont('helvetica', 'normal')
              doc.setTextColor(...LIGHT)
              const roleStr = san(slot.role) + (ts ? '  ' + new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '')
              const nameW = doc.getTextWidth(nameStr)
              const roleX = ML + 11 + nameW + 3
              if (roleX < W - MR - 30) doc.text(roleStr, roleX, y)

              doc.setFont('helvetica', 'bold')
              doc.setTextColor(...GREEN)
              doc.text('SIGNED', W - MR - 4, y, { align: 'right' })
            } else if (isChairmanBypassed) {
              doc.setFillColor(232, 238, 245)
              doc.roundedRect(ML + 8, y - 4.5, CW - 8, 6, 0.5, 0.5, 'F')

              doc.setFontSize(7.5)
              doc.setFont('helvetica', 'italic')
              doc.setTextColor(...BRAND_MID)
              doc.text(san(slot.role), ML + 11, y)

              if (chairmanApprovedAt) {
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(...LIGHT)
                const roleW = doc.getTextWidth(san(slot.role))
                const dateStr = new Date(chairmanApprovedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                doc.text(dateStr, ML + 11 + roleW + 3, y)
              }

              doc.setFont('helvetica', 'bold')
              doc.setTextColor(...BRAND)
              doc.text('AUTHORISED', W - MR - 4, y, { align: 'right' })
            } else if (isBypassed) {
              doc.setFontSize(7.5)
              doc.setFont('helvetica', 'italic')
              doc.setTextColor(...AMBER)
              doc.text(san(slot.role), ML + 11, y)
              doc.setFont('helvetica', 'bold')
              doc.text('BYPASSED', W - MR - 4, y, { align: 'right' })
            } else {
              doc.setFontSize(7.5)
              doc.setFont('helvetica', 'italic')
              doc.setTextColor(...LIGHT)
              doc.text(san(slot.role), ML + 11, y)
              doc.setFont('helvetica', 'normal')
              doc.text('pending', W - MR - 4, y, { align: 'right' })
            }

            y += 7
          }
          y += 2
        }
        y += 1
      } else {
        para(section.body, 8.5, MED, 8, false, 3)
      }

      y += 2
    })
  }

  // ════════════════════════════════════════════════
  // REVIEW APPROVALS
  // ════════════════════════════════════════════════

  needY(20)
  hRule(BORDER, 0.25, 5)
  heading('Review Approvals')

  if (reco.directToChairman) {
    const rowH = 11
    const authorised = !!reco.directToChairman.chairmanApproved
    needY(rowH + 3)
    doc.setFillColor(...(authorised ? [236, 253, 243] as [n,n,n] : [255, 251, 235] as [n,n,n]))
    doc.setDrawColor(...(authorised ? GREEN : AMBER))
    doc.setLineWidth(0.2)
    doc.roundedRect(ML, y - rowH + 3, CW, rowH, 1.2, 1.2, 'FD')
    doc.setFillColor(...(authorised ? GREEN : AMBER))
    doc.rect(ML, y - rowH + 3, 2.5, rowH, 'F')
    const rowMid = y - rowH + 3 + rowH / 2 + 1
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(authorised ? GREEN : AMBER))
    doc.text(
      authorised ? 'Direct submission authorised by Chairman' : 'Direct submission — standard reviews bypassed',
      ML + 6, rowMid
    )
    if (authorised && reco.directToChairman.approvedAt) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MED)
      doc.text(san(new Date(reco.directToChairman.approvedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })), W - MR - 2, rowMid, { align: 'right' })
    }
    y += rowH + 2.5
  } else {
    ;(['legal', 'finance', 'compliance'] as ReviewFunction[]).forEach((fn) => {
      const review = reco.reviews[fn]
      const isOk = review.status.startsWith('Approved')
      const rowH = 11
      needY(rowH + 3)

      const bgR = isOk ? 236 : 254, bgG = isOk ? 253 : 243, bgB = isOk ? 243 : 199
      doc.setFillColor(bgR, bgG, bgB)
      doc.setDrawColor(...(isOk ? GREEN : AMBER))
      doc.setLineWidth(0.2)
      doc.roundedRect(ML, y - rowH + 3, CW, rowH, 1.2, 1.2, 'FD')

      doc.setFillColor(...(isOk ? GREEN : AMBER))
      doc.rect(ML, y - rowH + 3, 2.5, rowH, 'F')

      const rowMid = y - rowH + 3 + rowH / 2 + 1
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT)
      doc.text(FN_LABELS[fn], ML + 6, rowMid)

      if (review.reviewer) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...MED)
        doc.text(san(review.reviewer), ML + 30, rowMid)
      }

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...(isOk ? GREEN : AMBER))
      doc.text(san(review.status), W - MR - 2, rowMid, { align: 'right' })

      y += rowH + 2.5
    })
  }

  // ════════════════════════════════════════════════
  // DRAFT RESOLUTION (only if s10 not in sections)
  // ════════════════════════════════════════════════

  if (reco.draftResolution && !reco.contentSections.some(s => s.id === 's10')) {
    needY(20)
    y += 4
    hRule(BORDER, 0.25, 5)
    heading('Draft Board Resolution')
    para(reco.draftResolution, 8.5, TEXT, 0, true)
  }

  // ════════════════════════════════════════════════
  // REGULATORY REFERENCES
  // ════════════════════════════════════════════════

  if (reco.regulatoryRefs.length > 0) {
    needY(20)
    y += 2
    hRule(BORDER, 0.25, 5)
    heading('Regulatory References')

    const PILL_H = 6
    const PAD_H  = 3.5
    const GAP_H  = 2.5
    const GAP_V  = 3
    const PILL_BG:     [n,n,n] = [239, 246, 255]
    const PILL_BORDER: [n,n,n] = [186, 215, 248]
    const PILL_TEXT:   [n,n,n] = [37, 99, 195]

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')

    let cx = ML
    needY(PILL_H + 2)

    reco.regulatoryRefs.forEach((ref) => {
      const txt = san(ref)
      const pw  = doc.getTextWidth(txt) + PAD_H * 2

      if (cx > ML && cx + pw > W - MR) {
        y += PILL_H + GAP_V
        needY(PILL_H + 2)
        cx = ML
      }

      doc.setFillColor(...PILL_BG)
      doc.setDrawColor(...PILL_BORDER)
      doc.setLineWidth(0.15)
      doc.roundedRect(cx, y - PILL_H + 1.5, pw, PILL_H, 1, 1, 'FD')
      doc.setTextColor(...PILL_TEXT)
      doc.text(txt, cx + PAD_H, y)

      cx += pw + GAP_H
    })

    y += PILL_H + 6
  }

  // ════════════════════════════════════════════════
  // FOOTERS
  // ════════════════════════════════════════════════

  const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  renderFooters(pageCount)

  const safeName = reco.title.slice(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/ +/g, '-')
  doc.save(`BoD-Pack-${safeName}.pdf`)
}

// ─── Completeness checklist ───────────────────────────────────────────────────

function CompletenessChecklist({ reco }: { reco: Recommendation }) {
  const directApproved = !!reco.directToChairman?.chairmanApproved

  const checks = [
    {
      label: 'All content sections complete',
      pass: reco.contentSections.some((s) => s.id === 's10')
        ? reco.contentSections.length >= 11
        : reco.contentSections.length > 0,
    },
    { label: 'Draft resolution present', pass: reco.draftResolution.length > 0 },
    ...(directApproved
      ? [{ label: 'Direct submission authorised by Chairman', pass: true }]
      : [
          { label: 'Legal review approved', pass: reco.reviews.legal.status.startsWith('Approved') },
          { label: 'Finance review approved', pass: reco.reviews.finance.status.startsWith('Approved') },
          { label: 'Compliance review approved', pass: reco.reviews.compliance.status.startsWith('Approved') },
        ]
    ),
    { label: 'Regulatory references attached', pass: reco.regulatoryRefs.length > 0 },
    { label: 'BoD deadline not exceeded', pass: daysUntil(reco.bodDeadline) > 0 },
  ]

  const passed = checks.filter((c) => c.pass).length

  return (
    <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Completeness Check</p>
        <span className={`text-xs font-bold ${passed === checks.length ? 'text-emerald-600' : 'text-amber-600'}`}>
          {passed}/{checks.length}
        </span>
      </div>
      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            {c.pass ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
            <span className={`text-xs ${c.pass ? 'text-slate-600' : 'text-red-500'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stats panel ─────────────────────────────────────────────────────────────

const STATUS_ORDER: RecommendationStatus[] = [
  'Draft', 'Under Review', 'Returned for Update', 'All Reviews Completed',
  'Submitted to Chairman', 'Ready for BoD', 'Submitted to BoD',
]

function StatsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  // recommendations is pre-filtered to CHAIRMAN_SCOPE — only items visible in this dashboard
  const total = recommendations.length

  // Pipeline funnel (only Chairman stages)
  const funnel = STATUS_ORDER
    .map((s) => ({ status: s, count: recommendations.filter((r) => r.status === s).length }))
    .filter((s) => s.count > 0)

  // Deadline health — exclude already-submitted items
  const active = recommendations.filter((r) => r.status !== 'Submitted to BoD')
  const overdue = active.filter((r) => daysUntil(r.bodDeadline) <= 0).length
  const urgent  = active.filter((r) => { const d = daysUntil(r.bodDeadline); return d > 0 && d <= 7 }).length
  const onTrack = active.filter((r) => daysUntil(r.bodDeadline) > 7).length

  // By Board Meeting — all scoped items grouped by meeting date
  const meetingGroups = Object.entries(
    recommendations.reduce<Record<string, number>>((acc, r) => {
      acc[r.boardMeetingDate] = (acc[r.boardMeetingDate] ?? 0) + 1
      return acc
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b))

  // Business unit breakdown
  const byBU = Object.entries(
    recommendations.reduce<Record<string, number>>((acc, r) => {
      acc[r.businessUnit] = (acc[r.businessUnit] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])
  const maxBU = byBU[0]?.[1] ?? 1

  // Avg readiness — scoped to PIPELINE_STATUSES only (items that have had a Readiness Agent run),
  // matching the header meter so the same number appears in both places
  const assessed = recommendations.filter((r) => PIPELINE_STATUSES.includes(r.status) && r.readinessScore > 0)
  const avgReadiness = assessed.length
    ? Math.round(assessed.reduce((sum, r) => sum + r.readinessScore, 0) / assessed.length)
    : null

  // Next upcoming board meeting among scoped items
  const upcomingDates = [...new Set(
    recommendations.map((r) => r.boardMeetingDate).filter((d) => daysUntil(d) >= 0)
  )].sort()
  const nextMeeting = upcomingDates[0] ?? recommendations[0]?.boardMeetingDate ?? '—'
  const onAgenda = recommendations.filter((r) => r.status === 'Submitted to BoD').length

  const statTile = (label: string, value: React.ReactNode, sub?: string) => (
    <div className="bg-surface border border-border-subtle rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Summary tiles — 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {statTile('Total in scope', total)}
        {statTile('On BoD agenda', <span className="text-green-600">{onAgenda}</span>)}
        <div className="bg-surface border border-border-subtle rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Next board meeting</p>
          <p className="text-sm font-semibold text-slate-700 mt-1.5">{nextMeeting}</p>
        </div>
        {avgReadiness !== null && (
          <div className="bg-surface border border-border-subtle rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Avg readiness</p>
            <p className={`text-2xl font-bold mt-1 ${avgReadiness >= 90 ? 'text-emerald-600' : avgReadiness >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
              {avgReadiness}<span className="text-sm font-normal text-slate-400">/100</span>
            </p>
          </div>
        )}
      </div>

      {/* Deadline health */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deadline Health</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{overdue}</p>
            <p className="text-[10px] text-red-500 mt-0.5">Overdue</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{urgent}</p>
            <p className="text-[10px] text-amber-500 mt-0.5">Due ≤7d</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{onTrack}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">On track</p>
          </div>
        </div>
      </div>

      {/* Pipeline funnel */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pipeline Funnel</p>
        <div className="space-y-2.5">
          {funnel.map(({ status, count }) => {
            const c = statusColors[status]
            return (
              <div key={status} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.dot }} />
                <span className="text-xs text-slate-600 w-40 truncate">{status}</span>
                <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, backgroundColor: c.dot }} />
                </div>
                <span className={`text-xs font-bold w-4 text-right flex-shrink-0 ${c.text}`}>{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* By board meeting */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">By Board Meeting</p>
        <div className="space-y-3">
          {meetingGroups.map(([date, count]) => {
            const d = daysUntil(date)
            const barColor = d < 0 ? 'bg-red-400' : d <= 7 ? 'bg-amber-400' : 'bg-emerald-400'
            const textColor = d < 0 ? 'text-red-600' : d <= 7 ? 'text-amber-600' : 'text-emerald-600'
            const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Today' : `in ${d}d`
            return (
              <div key={date} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">{date}</span>
                  <span className={`text-[10px] font-semibold ${textColor}`}>{label} · {count} item{count !== 1 ? 's' : ''}</span>
                </div>
                <div className="h-1.5 bg-surface-raised rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* By business unit */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">By Business Unit</p>
        <div className="space-y-2.5">
          {byBU.map(([bu, count]) => (
            <div key={bu} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 w-36 truncate">{bu}</span>
              <div className="flex-1 h-1.5 bg-surface-raised rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-brand/50" style={{ width: `${(count / maxBU) * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700 w-4 text-right flex-shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Chairman modal ───────────────────────────────────────────────────────────

function ChairmanModal({
  reco,
  onSubmit,
  onClose,
}: {
  reco: Recommendation
  onSubmit: () => void
  onClose: () => void
}) {
  const [note, setNote] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative bg-surface border border-border-subtle rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-raised">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Chairman Review</p>
              <p className="text-[11px] text-slate-400">Chairman review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Recommendation summary */}
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
              Recommendation for BoD
            </p>
            <p className="text-base font-semibold text-slate-800">{reco.title}</p>
            <p className="text-xs text-slate-500">{reco.businessUnit} · Board Meeting: {reco.boardMeetingDate}</p>
          </div>

          {/* Review status */}
          {reco.directToChairman ? (
            reco.directToChairman.chairmanApproved ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-medium text-emerald-700">
                  Direct submission authorised by Chairman — standard reviews bypassed
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-xs font-medium text-amber-700">
                  Direct submission — standard reviews bypassed, authorisation pending
                </p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(['legal', 'finance', 'compliance'] as ReviewFunction[]).map((fn) => {
                const review = reco.reviews[fn]
                const ok = review.status === 'Approved'
                return (
                  <div
                    key={fn}
                    className={`rounded-lg p-2.5 text-center border ${ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}
                  >
                    <p className={`text-xs font-semibold ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {FN_LABELS[fn]}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {review.status}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Readiness */}
          <div className="flex items-center gap-4 bg-surface-raised rounded-xl p-3">
            <ReadinessMeter score={reco.readinessScore} size="sm" showLabel />
            <div>
              <p className="text-sm font-medium text-slate-700">Readiness Score</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {reco.readinessScore >= 90
                  ? 'Ready for Board submission'
                  : reco.readinessScore >= 75
                  ? 'Minor items outstanding'
                  : 'Significant gaps remain'}
              </p>
            </div>
          </div>

          {/* Business need snippet */}
          <div className="bg-surface-raised rounded-lg p-3">
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
              {reco.businessNeed}
            </p>
          </div>

          {/* Chairman note */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Chairman note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Any observations for the record…"
              className="w-full border border-border-strong rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-ink resize-none"
            />
          </div>

          {/* Discretion note */}
          <p className="text-[11px] text-slate-400 italic border-t border-border-subtle pt-3">
            The Chairman may proceed with submission despite residual observations, or defer the item from the agenda. This decision is recorded in the audit log.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 pb-5 gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border-strong text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-raised transition-colors"
          >
            Defer from agenda
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit to BoD
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function SecDashboard({
  recommendations,
  onView,
}: {
  recommendations: Recommendation[]
  onView: (id: string) => void
}) {
  const [buFilter, setBuFilter] = useState('All BUs')
  const [statusFilter, setStatusFilter] = useState<RecommendationStatus | 'All'>('All')
  const [statsOpen, setStatsOpen] = useState(false)

  const awaitingItems = recommendations.filter((r) => r.status === 'All Reviews Completed')

  const buValues = Array.from(new Set(recommendations.map((r) => r.businessUnit))).sort()

  const byBU = (items: Recommendation[]) =>
    buFilter === 'All BUs' ? items : items.filter((r) => r.businessUnit === buFilter)

  const sections: { label: string; status: RecommendationStatus; items: Recommendation[]; accent: string }[] = [
    {
      label: 'Awaiting submission',
      status: 'All Reviews Completed',
      items: byBU(awaitingItems),
      accent: 'text-emerald-700',
    },
    {
      label: 'In pipeline',
      status: 'Submitted to Chairman',
      items: byBU(recommendations.filter((r) => r.status === 'Submitted to Chairman')),
      accent: 'text-violet-700',
    },
    {
      label: 'Ready for BoD',
      status: 'Ready for BoD',
      items: byBU(recommendations.filter((r) => r.status === 'Ready for BoD')),
      accent: 'text-sky-700',
    },
    {
      label: 'Submitted to BoD',
      status: 'Submitted to BoD',
      items: byBU(recommendations.filter((r) => r.status === 'Submitted to BoD')),
      accent: 'text-green-700',
    },
  ]

  // Status counts after BU filter — drives the status pills
  const statusCounts = sections.reduce<Record<string, number>>((acc, s) => {
    if (s.items.length > 0) acc[s.status] = s.items.length
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Chairman</h1>
          <p className="text-slate-500 text-sm mt-1">Control tower · BoD submission pipeline</p>
        </div>
        <button
          onClick={() => setStatsOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-border-subtle rounded-lg px-2.5 py-1.5 hover:bg-surface-raised transition-colors"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Stats
        </button>
      </div>

      {/* BU filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">BU:</span>
        {['All BUs', ...buValues].map((bu) => (
          <button
            key={bu}
            onClick={() => setBuFilter(bu)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
              buFilter === bu
                ? 'bg-brand text-white border-brand'
                : 'border-border-subtle text-slate-500 hover:border-border-strong hover:text-slate-700'
            }`}
          >
            {bu}
          </button>
        ))}
      </div>

      {/* Status filter — same pill pattern as Owner and Reviewers */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <button
            onClick={() => setStatusFilter('All')}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
              statusFilter === 'All'
                ? 'bg-brand text-white border-brand'
                : 'border-border-subtle text-slate-500 hover:border-border-strong hover:text-slate-700'
            }`}
          >
            All ({sections.reduce((n, s) => n + s.items.length, 0)})
          </button>
          {Object.entries(statusCounts).map(([status, count]) => {
            const c = statusColors[status as RecommendationStatus]
            const active = statusFilter === status
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(active ? 'All' : status as RecommendationStatus)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                  active
                    ? `${c.text} ${c.bg} ${c.border} ring-2 ring-current ring-offset-1`
                    : `${c.text} bg-surface ${c.border} opacity-60 hover:opacity-100`
                }`}
              >
                {count} · {status}
              </button>
            )
          })}
        </div>
      )}

      {/* Pipeline sections */}
      <div className="space-y-8">
        {sections.map(({ label, status, items, accent }) => {
          if (statusFilter !== 'All' && status !== statusFilter) return null
          if (items.length === 0) return null
          return (
            <div key={label} className="space-y-3">
              <h2 className={`text-sm font-semibold uppercase tracking-wide ${accent}`}>
                {label} ({items.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((r, i) => (
                  <RecoCard key={r.id} recommendation={r} onClick={() => onView(r.id)} index={i} />
                ))}
              </div>
            </div>
          )
        })}

        {sections.every((s) => (statusFilter !== 'All' ? s.status !== statusFilter : false) || s.items.length === 0) && (
          <p className="text-slate-400 text-sm italic">
            No items{statusFilter !== 'All' ? ` with status "${statusFilter}"` : ' in pipeline'}
            {buFilter !== 'All BUs' ? ` for ${buFilter}` : ''}.
          </p>
        )}
      </div>

      {/* Stats drawer — slides in from the right, leaves main content untouched */}
      <AnimatePresence>
        {statsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setStatsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-surface border-l border-border-subtle shadow-2xl overflow-y-auto"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-brand" />
                    Pipeline Overview
                  </h2>
                  <button
                    onClick={() => setStatsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <StatsPanel recommendations={recommendations.filter((r) => CHAIRMAN_SCOPE.includes(r.status))} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Detail view ──────────────────────────────────────────────────────────────

function SecDetailView({ recoId, onBack }: { recoId: string; onBack: () => void }) {
  const reco = useRecoStore((s) => s.recommendations.find((r) => r.id === recoId))
  const updateReadinessScore = useRecoStore((s) => s.updateReadinessScore)
  const generateBoDPack = useRecoStore((s) => s.generateBoDPack)
  const submitToBoD = useRecoStore((s) => s.submitToBoD)
  const approveDirectSubmission = useRecoStore((s) => s.approveDirectSubmission)
  const setOpenPrecedentId = useUIStore((s) => s.setOpenPrecedentId)

  const [agentOutput, setAgentOutput] = useState<ReadinessOutput | null>(null)
  const [chairmanOpen, setChairmanOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)

  const handleAgentComplete = useCallback(
    (output: unknown) => {
      if (!output) return
      const o = output as ReadinessOutput
      setAgentOutput(o)
      updateReadinessScore(recoId, o.readinessScore)
    },
    [recoId, updateReadinessScore]
  )

  const handleGeneratePack = () => {
    const output = agentOutput ?? (readinessAgentScript.structuredOutput as ReadinessOutput)
    generateBoDPack(recoId, output.bodPackItems)
  }

  const handleDownload = () => {
    if (!reco) return
    generateBodPackPDF(reco, reco.bodPackItems ?? [])
  }

  const handleSubmitToBoD = () => {
    submitToBoD(recoId)
    setChairmanOpen(false)
  }

  if (!reco) return null

  const days = daysUntil(reco.bodDeadline)
  const hasScore = reco.readinessScore > 0
  const hasPack = (reco.bodPackItems ?? []).length > 0
  const isReady = reco.status === 'Ready for BoD'
  const isSubmitted = reco.status === 'Submitted to BoD'

  const residualGaps = agentOutput?.residualGaps ?? []
  const completedItems = agentOutput?.completedItems ?? []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <span className="text-slate-300">/</span>
        <StatusBadge status={reco.status} />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{reco.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reco.businessUnit} · {reco.owner}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className={`flex items-center gap-1.5 text-sm font-semibold ${
              days <= 0 ? 'text-red-600' : days <= 7 ? 'text-amber-600' : 'text-slate-500'
            }`}
          >
            <Clock className="w-4 h-4" />
            {days <= 0 ? 'Overdue' : `BoD in ${days}d`}
          </div>
          {reco.contentSections.length > 0 && (
            <button
              onClick={() => setDocOpen((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 border border-border-subtle rounded-lg px-3 py-1.5 hover:bg-surface-raised transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {docOpen ? 'Hide document' : 'View document'}
              <motion.span animate={{ rotate: docOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-3 h-3" />
              </motion.span>
            </button>
          )}
        </div>
      </div>

      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Submitted to Board of Directors</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              The recommendation is on the Board agenda for {reco.boardMeetingDate}.
            </p>
          </div>
        </div>
      )}

      {reco.directToChairman && (
        reco.directToChairman.chairmanApproved ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Direct submission authorised by Chairman</p>
              <p className="text-xs text-emerald-600 mt-1 leading-relaxed">
                <span className="font-medium">Stated reason:</span> {reco.directToChairman.reason}
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                Standard review functions bypassed. Completeness check updated accordingly.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Direct submission — Chairman review required</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  This recommendation bypassed the standard Legal, Finance and Compliance review functions.
                  The submitter provided the following reason:
                </p>
                <blockquote className="mt-2 pl-3 border-l-2 border-amber-300 text-sm text-amber-900 italic">
                  "{reco.directToChairman.reason}"
                </blockquote>
                <p className="text-xs text-amber-600 mt-2">
                  If you deem the reason appropriate, authorise the direct submission to update the completeness check.
                </p>
              </div>
            </div>
            {!isSubmitted && (
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => approveDirectSubmission(recoId)}
                  className="flex items-center gap-2 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Authorise direct submission
                </button>
              </div>
            )}
          </div>
        )
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: document + analysis */}
        <div className="lg:col-span-2 space-y-4">
          {/* Business need */}
          <div className="bg-surface border border-border-subtle rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
              Business Need
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{reco.businessNeed}</p>
          </div>

          {/* Regulatory refs */}
          {reco.regulatoryRefs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {reco.regulatoryRefs.map((ref) => (
                <span
                  key={ref}
                  className="bg-brand-subtle text-brand text-xs font-medium px-2.5 py-0.5 rounded-full border border-brand/20"
                >
                  {ref}
                </span>
              ))}
            </div>
          )}

          {/* Completeness checklist */}
          <CompletenessChecklist reco={reco} />

          {/* Signature block — only for recos with s11 (hero path) */}
          {reco.contentSections.some((s) => s.id === 's11') && (
            <div className="bg-surface border border-border-subtle rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-3">
                Signatures &amp; Co-signatures
              </p>
              <SignatureBlock reco={reco} />
            </div>
          )}

          {/* Readiness score */}
          <AnimatePresence>
            {hasScore && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-subtle rounded-xl p-5"
              >
                <div className="flex items-center gap-5">
                  <ReadinessMeter score={reco.readinessScore} size="lg" showLabel />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Readiness Assessment</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Score: {reco.readinessScore}/100 · BoD deadline: {reco.bodDeadline}
                      </p>
                    </div>

                    {completedItems.length > 0 && (
                      <div className="space-y-1">
                        {completedItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    {residualGaps.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                          Residual Gaps
                        </p>
                        {residualGaps.map((gap, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-amber-600">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {gap}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BoD pack items */}
          <AnimatePresence>
            {hasPack && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand" />
                    <p className="text-sm font-semibold text-slate-700">BoD Pack</p>
                    <span className="text-xs text-slate-400">({reco.bodPackItems?.length} documents)</span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 text-xs text-brand font-medium hover:text-brand-dim transition-colors border border-brand/30 px-2.5 py-1 rounded-lg hover:bg-brand-subtle"
                  >
                    <Download className="w-3 h-3" />
                    Download PDF
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {reco.bodPackItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                      <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audit log */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Activity
            </h2>
            <Timeline entries={reco.auditLog} />
          </div>
        </div>

        {/* Right: agent + actions */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Readiness Agent
          </h2>

          <AgentPanel
            key={recoId}
            script={readinessAgentScript}
            inputs={{
              recommendation: reco.title,
              sections: String(reco.contentSections.length),
              reviews: 'Legal, Finance, Compliance',
              deadline: String(days) + 'd',
            }}
            onComplete={handleAgentComplete}
            onSourceClick={setOpenPrecedentId}
          />

          {/* Actions */}
          <div className="space-y-2">
            {!hasPack && (
              <button
                onClick={handleGeneratePack}
                disabled={!hasScore && reco.readinessScore === 0}
                className="w-full bg-brand text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
              >
                <Package className="w-4 h-4" />
                Generate BoD Pack
              </button>
            )}

            {(isReady || hasPack) && !isSubmitted && (
              <>
                <button
                  onClick={() => setChairmanOpen(true)}
                  className="w-full border border-brand text-brand px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-subtle transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Share with Chairman
                </button>

                <button
                  onClick={() => submitToBoD(recoId)}
                  className="w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Submit to BoD
                </button>
              </>
            )}

            {isSubmitted && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-700">On the Board agenda</p>
                <p className="text-xs text-emerald-600 mt-1">{reco.boardMeetingDate}</p>
              </div>
            )}
          </div>

          {/* Review approvals summary */}
          <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Review Approvals
            </p>
            {reco.directToChairman?.chairmanApproved ? (
              <div className="flex items-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-emerald-700 font-medium">
                  Authorised by Chairman — standard reviews bypassed
                </span>
              </div>
            ) : (
              (['legal', 'finance', 'compliance'] as ReviewFunction[]).map((fn) => {
                const review = reco.reviews[fn]
                const ok = review.status === 'Approved'
                return (
                  <div key={fn} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{FN_LABELS[fn]}</span>
                    <div className={`flex items-center gap-1 text-xs font-medium ${ok ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {ok ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {review.status}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Draft resolution preview */}
          {reco.draftResolution && (
            <div className="bg-surface-raised border border-border-subtle rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-1.5">
                Draft Resolution
              </p>
              <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-6">
                {reco.draftResolution}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible document view */}
      <AnimatePresence>
        {docOpen && reco.contentSections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-2 border-t border-border-subtle">
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide pt-2">
                Recommendation Document
              </h2>

              {/* Formal header block */}
              <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Proposing Business Unit:</span>
                    <span className="ml-2 text-slate-700">{reco.businessUnit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Protocol No.:</span>
                    <span className="ml-2 font-mono text-slate-700">EIS-2026-{reco.id.slice(-4).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Contact:</span>
                    <span className="ml-2 text-slate-700">{reco.owner} · 210 490 0000</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date:</span>
                    <span className="ml-2 text-slate-700">
                      {new Date(reco.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="ml-2 text-slate-700">trading@ppcgroup.com</span>
                  </div>
                </div>
              </div>

              {/* Regulatory refs */}
              {reco.regulatoryRefs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {reco.regulatoryRefs.map((ref) => (
                    <span
                      key={ref}
                      className="bg-brand-subtle text-brand text-xs font-medium px-2.5 py-0.5 rounded-full border border-brand/20"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              )}

              {/* Sections — read-only */}
              <div className="space-y-3">
                {reco.contentSections.map((section, idx) => (
                  <div
                    key={section.id}
                    className="bg-surface rounded-xl p-4 border border-border-subtle"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-surface-raised text-[10px] font-bold text-slate-500 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
                    </div>
                    {section.id === 's11' ? (
                      <div className="pl-7 mt-1">
                        <SignatureBlock reco={reco} />
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed pl-7 text-slate-600 whitespace-pre-wrap">
                        {section.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Draft resolution — only if no s10 section */}
              {reco.draftResolution && !reco.contentSections.some((s) => s.id === 's10') && (
                <div className="bg-surface-raised border border-border-strong rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mb-2">
                    Draft Resolution
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed italic whitespace-pre-wrap">
                    {reco.draftResolution}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chairman modal */}
      <AnimatePresence>
        {chairmanOpen && (
          <ChairmanModal
            reco={reco}
            onSubmit={handleSubmitToBoD}
            onClose={() => setChairmanOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Secretariat() {
  const recommendations = useRecoStore((s) => s.recommendations)
  const [secView, setSecView] = useState<SecView>('dashboard')
  const [activeRecoId, setActiveRecoId] = useState<string | null>(null)

  const openDetail = (id: string) => {
    setActiveRecoId(id)
    setSecView('detail')
  }

  return (
    <motion.div {...PAGE} className="max-w-6xl mx-auto px-6 py-8">
      <AnimatePresence mode="wait">
        {secView === 'dashboard' && (
          <motion.div key="sec-dashboard" {...PAGE}>
            <SecDashboard recommendations={recommendations} onView={openDetail} />
          </motion.div>
        )}

        {secView === 'detail' && activeRecoId && (
          <motion.div key={`sec-detail-${activeRecoId}`} {...PAGE}>
            <SecDetailView
              recoId={activeRecoId}
              onBack={() => {
                setSecView('dashboard')
                setActiveRecoId(null)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
