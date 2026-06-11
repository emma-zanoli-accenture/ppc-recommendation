// ─────────────────────────────────────────────────────────────────────────────
// Mocked supporting-document repository for the Evidence Collection Assistant.
// DISTINCT from the Knowledge Base of past recommendations (src/data/knowledgeBase.ts).
// All content is fabricated but kept consistent with the hero "cross-border energy
// trading" scenario (PPC S.A. / CEO S.A., Greece–Romania, EUR 32.5M notional,
// REMIT/EMIR/ACER/RAAEY/MiFID II/HEnEx). No real files — everything is scripted.
// ─────────────────────────────────────────────────────────────────────────────

export type DocType = 'PDF' | 'Word' | 'Excel'
export type DocRelevance = 'high' | 'medium' | 'low'

export interface DocPreviewSection {
  heading: string
  lines?: string[]
  // Excel-style documents render a small table instead of paragraph lines
  table?: { columns: string[]; rows: string[][] }
}

export interface SupportingDocument {
  id: string
  title: string
  docType: DocType
  owningUnit: string
  date: string // ISO
  protocolNo: string
  summary: string
  // Search ranking for the hero scenario
  relevance: DocRelevance
  heroRelevant: boolean
  // Part of the recommended evidence set the assistant expects to be attached
  recommended: boolean
  applicablePolicies: string[]
  preview: DocPreviewSection[]
}

export const SUPPORTING_DOCUMENTS: SupportingDocument[] = [
  // ── Recommended hero evidence (the 6 the assistant expects attached) ──────────
  {
    id: 'doc-termsheet',
    title: 'Draft Master Electricity Trading Agreement — Term Sheet',
    docType: 'Word',
    owningUnit: 'Trading & Origination',
    date: '2026-06-05',
    protocolNo: 'TO-TS-2026-0042',
    summary:
      'Indicative term sheet for the bilateral Master Electricity Trading Agreement with CEO S.A. — 500 GWh/yr, 24-month tenor, HUPX/HEnEx indexation, Greek law.',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['PPC Group Trading Policy v4.2', 'Group Authorisation Matrix (2025)'],
    preview: [
      {
        heading: 'Parties',
        lines: [
          'Seller/Buyer: Public Power Corporation S.A. (PPC S.A.), Chalkokondyli 30, Athens 104 32, Greece.',
          'Counterparty: Complexul Energetic Oltenia S.A. (CEO S.A.), Târgu Jiu, Gorj, Romania.',
        ],
      },
      {
        heading: 'Commercial Terms',
        lines: [
          'Product: physical baseload electricity across the Greek–Romanian interconnector (NTC 400 MW).',
          'Annual volume: up to 500 GWh/year. Tenor: 24 months, annual renewal option (+100 GWh uplift, 60-day notice).',
          'Price indexation: HUPX/HEnEx quarterly average. Maximum annual notional: EUR 40,000,000.',
          'Governing law: Greek law. Disputes: Athens Court of First Instance (commercial panel).',
        ],
      },
      {
        heading: 'Conditions Precedent',
        lines: [
          '(i) ACER written acknowledgement of REMIT Art. 4 pre-trade notification on file;',
          '(ii) RAAEY prior notification under L.4001/2011 Art. 11 acknowledged;',
          '(iii) Credit Support Annex (EUR 5M threshold) executed by both parties.',
        ],
      },
    ],
  },
  {
    id: 'doc-csa',
    title: 'Draft Credit Support Annex (CSA)',
    docType: 'Word',
    owningUnit: 'Finance / Treasury',
    date: '2026-06-06',
    protocolNo: 'TR-CSA-2026-0042',
    summary:
      'Two-way credit support annex governing collateral for the CEO S.A. bilateral arrangement — EUR 5M threshold, EUR 500k minimum transfer amount.',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['PPC Counterparty Risk Framework', 'EMIR Refit'],
    preview: [
      {
        heading: 'Collateral Terms',
        lines: [
          'Threshold: EUR 5,000,000 (two-way). Minimum Transfer Amount: EUR 500,000.',
          'Eligible collateral: cash (EUR), and EU sovereign debt with valuation haircuts per Schedule 2.',
          'Valuation Agent: PPC Treasury. Mark-to-market frequency: weekly.',
        ],
      },
      {
        heading: 'Counterparty',
        lines: [
          'CEO S.A. external rating Fitch BB+ — within PPC risk appetite for non-investment-grade counterparties.',
          'Maximum bilateral exposure (MtM): EUR 40,000,000, consistent with BoD framework ΔΣ-2024-05-07.',
        ],
      },
    ],
  },
  {
    id: 'doc-kyc',
    title: 'KYC / AML Due-Diligence Report — CEO S.A.',
    docType: 'PDF',
    owningUnit: 'Compliance',
    date: '2026-06-03',
    protocolNo: 'CMP-KYC-2026-0311',
    summary:
      'Know-Your-Counterparty and anti-money-laundering screening for Complexul Energetic Oltenia S.A. — clear, no adverse findings.',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['Group Anti-Bribery & Corruption Policy', 'Group Related-Party Policy'],
    preview: [
      {
        heading: 'Counterparty Identification',
        lines: [
          'Legal name: Complexul Energetic Oltenia S.A. (CEO S.A.). Reg. No. J28/11/1998, VAT RO 2814214.',
          'Ownership: Romanian State via Ministry of Energy 77.15%; listed on Bucharest Stock Exchange (OLT).',
        ],
      },
      {
        heading: 'Screening Results (3 June 2026)',
        lines: [
          'AML screening: PASS. Adverse media: none. PEP exposure: state ownership noted, no individual PEP risk.',
          'Anti-corruption due diligence: NO adverse findings. Related-Party check: NOT a related party (Group Legal, 5 Jun 2026).',
        ],
      },
      {
        heading: 'Note',
        lines: [
          'International sanctions screening (EU/UN/OFAC) is performed under a separate confirmation — see Compliance sanctions desk.',
        ],
      },
    ],
  },
  {
    id: 'doc-fxnote',
    title: 'Finance / Treasury Confirmation Note — EUR/RON Hedging',
    docType: 'Word',
    owningUnit: 'Finance / Treasury',
    date: '2026-06-07',
    protocolNo: 'TR-FX-2026-0117',
    summary:
      'Treasury confirmation of budget coverage and FX hedging plan for the CEO S.A. arrangement (the εισήγηση attachment D).',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['PPC Treasury Hedging Policy', 'MiFID II Art. 2(1)(j)'],
    preview: [
      {
        heading: 'Budget Coverage',
        lines: [
          'Estimated annual notional: EUR 32.5M (500 GWh × EUR 65/MWh, HUPX/HEnEx Q3 2026 forward curve).',
          'Cost centre CT-2400 (Trading & Origination); account 6720.004. Classification: OPEX.',
          'Within the 2026 bilateral trading budget envelope (BoD resolution ΔΣ-2025-047).',
        ],
      },
      {
        heading: 'FX Exposure & Hedging',
        lines: [
          'EUR/RON settlement basis ≈ 2.3% on quarterly cash flows.',
          'Forward FX hedge to be executed within 30 days of signature; programme cost EUR 750k p.a., within risk appetite.',
        ],
      },
    ],
  },
  {
    id: 'doc-risk',
    title: 'Market & Credit Risk Assessment — CEO S.A. Bilateral',
    docType: 'PDF',
    owningUnit: 'Risk Management',
    date: '2026-06-06',
    protocolNo: 'RM-RA-2026-0089',
    summary:
      'Four-factor risk assessment (regulatory, financial, commercial, operational) with mitigants for the cross-border bilateral.',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['PPC Counterparty Risk Framework', 'EMIR Refit'],
    preview: [
      {
        heading: 'Risk Matrix',
        table: {
          columns: ['Risk', 'Likelihood', 'Impact', 'Mitigant'],
          rows: [
            ['Regulatory (REMIT/EMIR)', 'Low', 'High', 'Conditions precedent; ACER ack. before signature'],
            ['Financial (EUR/RON FX)', 'Medium', 'Medium', 'Treasury forward hedge (EUR 750k)'],
            ['Commercial (CEO S.A. BB+)', 'Low', 'Medium', 'Credit Support Annex (EUR 5M threshold)'],
            ['Operational (curtailment)', 'Low', 'Low', 'Force majeure & quarterly capacity review'],
          ],
        },
      },
      {
        heading: 'Conclusion',
        lines: [
          'Residual risk acceptable within PPC risk appetite subject to the documented mitigants and conditions precedent.',
        ],
      },
    ],
  },
  {
    id: 'doc-regmemo',
    title: 'Regulatory Framework Memo — REMIT / EMIR / ACER / RAAEY',
    docType: 'Word',
    owningUnit: 'Legal',
    date: '2026-06-04',
    protocolNo: 'LGL-MEMO-2026-0205',
    summary:
      'Legal memorandum mapping the applicable EU and Greek/Romanian regulatory framework to the bilateral arrangement.',
    relevance: 'high',
    heroRelevant: true,
    recommended: true,
    applicablePolicies: ['REMIT Art. 4', 'EMIR Refit', 'RAAEY L.4001/2011 Art. 11', 'MiFID II Art. 2(1)(j)'],
    preview: [
      {
        heading: 'Applicable Framework',
        lines: [
          'REMIT (Reg. EU 1227/2011) Art. 4: mandatory ACER pre-trade notification before signature — hard gate.',
          'EMIR Refit (Reg. EU 2019/834) Art. 2(7): bilateral forward = OTC derivative; REGIS-TR addendum + Art. 10 clearing-threshold representation.',
          'RAAEY — L.4001/2011 Art. 11: prior notification for cross-border arrangements.',
          'MiFID II Art. 2(1)(j): commodity-derivative exemption applicable (physical delivery, commercial hedging).',
        ],
      },
      {
        heading: 'Romanian Counterparty',
        lines: [
          'Legea energiei 123/2012: CEO S.A. must hold ANRE approval for cross-border agreements > 100 GWh/yr — representation & warranty in Art. 6.',
        ],
      },
    ],
  },

  // ── High/medium relevance, found but not part of the "recommended" set ────────
  {
    id: 'doc-remit-cert',
    title: 'Counterparty REMIT Registration Certificate — CEO S.A.',
    docType: 'PDF',
    owningUnit: 'Regulatory Affairs',
    date: '2025-11-18',
    protocolNo: 'ACER-CEREMP-RO-00417',
    summary:
      'ACER/CEREMP market-participant registration certificate evidencing CEO S.A. is a registered REMIT market participant.',
    relevance: 'high',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['REMIT Art. 9'],
    preview: [
      {
        heading: 'Registration',
        lines: [
          'Market participant: Complexul Energetic Oltenia S.A. ACER code: B0001234X.RO.',
          'National registry: ANRE (CEREMP Romania). Status: ACTIVE. Registered since 2014.',
        ],
      },
      {
        heading: 'Scope',
        lines: [
          'Confirms counterparty obligations under REMIT Art. 8/9 reporting. Does not substitute the Art. 4 pre-trade notification PPC must file.',
        ],
      },
    ],
  },
  {
    id: 'doc-capex',
    title: 'Financial Impact — CAPEX / OPEX Breakdown',
    docType: 'Excel',
    owningUnit: 'Finance / Treasury',
    date: '2026-06-07',
    protocolNo: 'FIN-FX-2026-0042',
    summary:
      'Spreadsheet modelling the financial impact: notional, contribution margin, hedging cost, EMIR initial margin.',
    relevance: 'high',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['PPC Treasury Hedging Policy'],
    preview: [
      {
        heading: 'Financial Model (base case)',
        table: {
          columns: ['Line', 'Value', 'Notes'],
          rows: [
            ['Annual notional', 'EUR 32.5M', '500 GWh × EUR 65/MWh'],
            ['Net contribution margin', 'EUR 3.5–4.5M p.a.', 'base-case forward curves'],
            ['FX hedging cost', 'EUR 0.75M p.a.', 'EUR/RON forward programme'],
            ['EMIR initial margin', 'EUR 1.2M', 'within EUR 8.4M facility headroom'],
            ['Cost centre / account', 'CT-2400 / 6720.004', 'OPEX'],
          ],
        },
      },
    ],
  },
  {
    id: 'doc-policy',
    title: 'Group Policy Approval Reference — Trading Policy v4.2 & GAM',
    docType: 'PDF',
    owningUnit: 'Corporate Governance',
    date: '2025-12-01',
    protocolNo: 'CG-POL-2025-0042',
    summary:
      'Extract of the Group Authorisation Matrix and Trading Policy v4.2 confirming BoD approval level for bilateral trading > EUR 10M.',
    relevance: 'medium',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['PPC Group Trading Policy v4.2', 'Group Authorisation Matrix (2025)'],
    preview: [
      {
        heading: 'Approval Level',
        lines: [
          'Bilateral energy trading agreements above EUR 10M notional require Board of Directors approval (GAM 2025, §4.3).',
          'Permitted instruments: bilateral physical forwards with HUPX/HEnEx indexation (Trading Policy v4.2, Schedule A).',
          'No sub-delegation permitted for cross-border bilateral above EUR 10M.',
        ],
      },
    ],
  },
  {
    id: 'doc-procedure',
    title: 'Cross-Border Trading Procedure',
    docType: 'Word',
    owningUnit: 'Trading & Origination',
    date: '2025-09-10',
    protocolNo: 'TO-PROC-2025-0014',
    summary:
      'Internal procedure for concluding cross-border bilateral trades, including capacity nomination and regulatory filing steps.',
    relevance: 'medium',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['HEnEx Market Coupling Rules'],
    preview: [
      {
        heading: 'Process Steps',
        lines: [
          '1. Counterparty onboarding & KYC. 2. Term sheet & risk sign-off. 3. REMIT Art. 4 notification.',
          '4. RAAEY prior notification. 5. Capacity nomination (ENTSO-E coordinated allocation). 6. Settlement & reporting.',
        ],
      },
      {
        heading: 'Market Coupling',
        lines: [
          'Arrangements reviewed ahead of the HEnEx–HUPX market coupling milestone (mid-2027).',
        ],
      },
    ],
  },
  {
    id: 'doc-sap',
    title: 'SAP Purchase Requisition — Bilateral Trading Set-up',
    docType: 'Excel',
    owningUnit: 'Procurement',
    date: '2026-06-08',
    protocolNo: 'SAP-PR-2026-884213',
    summary:
      'SAP purchase requisition record for set-up and advisory costs associated with the bilateral trading arrangement.',
    relevance: 'medium',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['Group Authorisation Matrix (2025)'],
    preview: [
      {
        heading: 'Requisition',
        table: {
          columns: ['Field', 'Value'],
          rows: [
            ['PR number', '884213'],
            ['Cost centre', 'CT-2400'],
            ['Account', '6720.004'],
            ['Category', 'Trading set-up / legal advisory'],
            ['Estimated value', 'EUR 85,000'],
            ['Status', 'Released'],
          ],
        },
      },
    ],
  },
  {
    id: 'doc-feasibility',
    title: 'Feasibility Study — Greece–Romania Interconnector Utilisation',
    docType: 'PDF',
    owningUnit: 'Trading & Origination',
    date: '2026-03-20',
    protocolNo: 'TO-FS-2026-0008',
    summary:
      'Study assessing commercial utilisation of the Greek–Romanian interconnection capacity and the case for a bilateral arrangement.',
    relevance: 'medium',
    heroRelevant: true,
    recommended: false,
    applicablePolicies: ['HEnEx Market Coupling Rules'],
    preview: [
      {
        heading: 'Findings',
        lines: [
          'NTC 400 MW under-utilised for commercial bilateral trade; estimated EUR 3.5–4.5M p.a. margin opportunity.',
          'First-mover advantage ahead of HEnEx–HUPX coupling (2027); recommends a 500 GWh/yr bilateral with a Romanian producer.',
        ],
      },
    ],
  },

  // ── Noise — unrelated documents in the repository (search realism) ────────────
  {
    id: 'doc-fueloil',
    title: 'Megalopoli Fuel Oil Supply — Tender Evaluation Report',
    docType: 'PDF',
    owningUnit: 'Procurement',
    date: '2026-02-14',
    protocolNo: 'PRC-TND-2026-0051',
    summary: 'Competitive-tender evaluation for the annual fuel-oil supply framework (thermal plants). Unrelated to cross-border trading.',
    relevance: 'low',
    heroRelevant: false,
    recommended: false,
    applicablePolicies: ['RAAEY Supply Security Guidelines 2025'],
    preview: [
      {
        heading: 'Tender Summary',
        lines: [
          'Scope: up to 180,000 MT/year fuel oil for Megalopoli & Linoperamata. Three-year framework.',
          'Recommended bidder selected on lowest evaluated price; estimated spend EUR 145M over 3 years.',
        ],
      },
    ],
  },
  {
    id: 'doc-smartmeter',
    title: 'Smart Meter Rollout Phase 2 — Vendor SLA',
    docType: 'Word',
    owningUnit: 'IT',
    date: '2026-04-22',
    protocolNo: 'IT-SLA-2026-0099',
    summary: 'Service-level agreement for the Landis+Gyr smart-meter deployment. Unrelated to cross-border trading.',
    relevance: 'low',
    heroRelevant: false,
    recommended: false,
    applicablePolicies: ['RAAEY Smart Metering Decision 2024'],
    preview: [
      {
        heading: 'Service Levels',
        lines: [
          'Deployment: 800,000 DLMS/COSEM meters (Attica & Central Macedonia). Availability SLA 99.5%.',
          'Penalty regime for missed installation milestones; RRF co-financing conditions apply.',
        ],
      },
    ],
  },
]

export const DOCS_BY_ID: Map<string, SupportingDocument> = new Map(
  SUPPORTING_DOCUMENTS.map((d) => [d.id, d])
)

// Document ids the Evidence Collection Assistant recommends attaching for the hero scenario.
export const RECOMMENDED_DOC_IDS: string[] = SUPPORTING_DOCUMENTS.filter((d) => d.recommended).map((d) => d.id)

// Ranked search matches for the hero scenario (high → medium → a couple of low-relevance noise hits,
// so the search looks real). Deterministic.
export const EVIDENCE_MATCH_IDS: string[] = [
  'doc-termsheet',
  'doc-kyc',
  'doc-regmemo',
  'doc-risk',
  'doc-csa',
  'doc-fxnote',
  'doc-remit-cert',
  'doc-capex',
  'doc-policy',
  'doc-procedure',
  'doc-feasibility',
  'doc-sap',
  // low-relevance noise that the search still surfaces
  'doc-fueloil',
  'doc-smartmeter',
]

// Evidence the assistant expects but cannot find in the repository — actionable flags.
export interface MissingEvidence {
  label: string
  why: string
}

export const MISSING_EVIDENCE: MissingEvidence[] = [
  {
    label: 'International sanctions screening (EU/UN/OFAC) confirmation',
    why: 'The KYC report covers AML and anti-corruption, but the standalone sanctions clearance for CEO S.A. is not on file. Request it from Compliance before submission.',
  },
]
