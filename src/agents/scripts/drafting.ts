import type { AgentScript } from '../engine'
import type { ContentSection } from '@/lib/types'

export interface DraftSuggestion {
  id: string
  type: 'suggestion' | 'gap'
  label: string
  targetSectionId: string
  body: string
}

export interface DraftingOutput {
  templateSections: ContentSection[]
  draftResolution: string
  regulatoryRefs: string[]
  suggestions: DraftSuggestion[]
  gaps: DraftSuggestion[]
}

// ─── Template (stub) sections ─────────────────────────────────────────────────
// s1 & s2 are inferred from the business need — complete from the start.
// s3, s4, s5, s6, s7 are stubs that the assisted-drafting items fill in.

const templateSections: ContentSection[] = [
  {
    id: 's1',
    title: 'Strategic Context & Business Justification',
    body: 'PPC S.A. seeks to capitalise on its cross-border transmission capacity between Greece and Romania to optimise generation dispatch and improve commercial margins. A bilateral energy trading framework with Complexul Energetic Oltenia S.A. (CEO S.A.) covering up to 500 GWh/year will enable PPC to balance seasonal load curves and establish a foothold in the emerging Romanian forward market ahead of HEnEx market coupling in 2027.',
  },
  {
    id: 's2',
    title: 'Scope & Commercial Terms',
    body: 'The agreement covers bilateral forward trades of electricity at the Greek–Romanian high-voltage interconnector (ENTSO-E NTC: 400 MW), with quarterly physical delivery and HUPX/HEnEx spot price indexation. Tenor: 24 months, renewable annually. Estimated notional value: approximately EUR 30–35M per annum at current forward curve.',
  },
  {
    id: 's3',
    title: 'Regulatory & Legal Framework',
    body: 'Cross-border arrangement — regulatory assessment pending. Framework involves international physical delivery; REMIT, EMIR, RAAEY, and MiFID II applicability to be confirmed by Legal review.',
  },
  {
    id: 's4',
    title: 'Financial Impact & Risk Assessment',
    body: '[Pending Finance/Treasury input] Initial estimate: EUR 30–35M p.a. based on current forward curve. FX exposure (EUR/RON) and counterparty credit risk assessment outstanding.',
  },
  {
    id: 's5',
    title: 'Implementation Timeline',
    body: 'Implementation timeline to be determined following completion of Legal review and RAAEY prior notification. Estimated contract commencement: Q4 2026.',
  },
  {
    id: 's6',
    title: 'Stakeholder Impact',
    body: 'Internal stakeholders: Trading & Origination (lead), Legal, Treasury, and Regulatory Affairs. External stakeholder mapping pending.',
  },
  {
    id: 's7',
    title: 'Risk Matrix',
    body: 'Risk matrix to be completed following regulatory and financial assessment. Key risk categories: regulatory compliance, counterparty credit, market/price, and operational.',
  },
]

// ─── Assisted-drafting items ──────────────────────────────────────────────────
// 3 suggested integrations + 2 information gaps; each targets a unique section.

const suggestions: DraftSuggestion[] = [
  {
    id: 'sug-1',
    type: 'suggestion',
    label: 'Regulatory analysis — REMIT / EMIR / RAAEY / MiFID II',
    targetSectionId: 's3',
    body: 'The arrangement triggers obligations under: REMIT Art. 4 (pre-trade ACER notification mandatory before contract signature — built into the draft resolution as a condition precedent); EMIR Refit (OTC derivative reporting and clearing threshold assessment — a derivative reporting addendum is required and Treasury must register trades with a designated trade repository such as REGIS-TR or DTCC); RAAEY prior notification under L.4001/2011 Art. 11 given the cross-border nature; and MiFID II Art. 2(1)(j) financial instrument classification review — Legal to confirm whether the commodity exemption applies. Romanian ANRE approval is the counterparty\'s responsibility under the bilateral framework.',
  },
  {
    id: 'sug-2',
    type: 'suggestion',
    label: 'Implementation milestones — Q3–Q4 2026',
    targetSectionId: 's5',
    body: 'Q3 2026: Contract negotiation and completion of REMIT Art. 4 pre-trade notification to ACER; RAAEY prior notification filing under L.4001/2011 Art. 11. Q4 2026: Contract signature and commencement of first physical delivery period (Greek–Romanian interconnector). Q1 2027: EMIR OTC derivative addendum execution and trade repository registration (REGIS-TR or DTCC). Mid-2027: Scheduled review of the arrangement ahead of the HEnEx–HUPX market coupling milestone.',
  },
  {
    id: 'sug-3',
    type: 'suggestion',
    label: 'Risk matrix — 4-risk framework',
    targetSectionId: 's7',
    body: 'Key risks: (1) Regulatory — REMIT/EMIR compliance gaps (Likelihood: Low, Impact: High — mitigant: conditions precedent built into draft resolution); (2) Commercial — counterparty default (CEO S.A., Fitch BB+) (Likelihood: Low, Impact: Medium — mitigant: credit support annex to be executed alongside master agreement); (3) Market — adverse EUR/RON price movement (Likelihood: Medium, Impact: Medium — mitigant: quarterly settlement with price review mechanism); (4) Operational — interconnector outage or capacity curtailment (Likelihood: Low, Impact: Low — mitigant: force majeure clause). All risks assessed as within PPC risk appetite.',
  },
]

const gaps: DraftSuggestion[] = [
  {
    id: 'gap-1',
    type: 'gap',
    label: 'Financial Impact: quantified values required',
    targetSectionId: 's4',
    body: 'Estimated annual contract value: EUR 32.5M, confirmed by Finance/Treasury (budget clearance obtained 7 June 2026). Primary financial risks: EUR/RON FX basis (~2.3%), mitigated via forward hedging programme approved by Treasury. Interconnector capacity curtailment and counterparty credit risk (CEO S.A., rated Fitch BB+) are within PPC risk appetite. A credit support annex will be executed alongside the master agreement.',
  },
  {
    id: 'gap-2',
    type: 'gap',
    label: 'Stakeholder map: external regulatory contacts missing',
    targetSectionId: 's6',
    body: 'Internal stakeholders: Trading & Origination (lead, counterparty management), Legal (REMIT/EMIR/MiFID II compliance), Treasury (EMIR reporting, FX hedging), and Regulatory Affairs (RAAEY notification). External stakeholders: ACER (recipient of REMIT Art. 4 pre-trade notification), RAAEY (prior notification under L.4001/2011 Art. 11), HEnEx (market coupling coordination, 2027 milestone), and CEO S.A. (counterparty, Romanian electricity producer). No direct impact on PPC retail customers or tariffs.',
  },
]

// ─── Draft resolution ─────────────────────────────────────────────────────────

const draftResolution = `The Board of Directors of PPC S.A. hereby approves the entry into a bilateral energy trading framework agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for the exchange of up to 500 GWh per annum of electrical energy across the Greek–Romanian high-voltage interconnector, subject to: (i) completion of the REMIT pre-trade notification to ACER prior to contract signature; (ii) prior notification to RAAEY pursuant to Article 11 of L.4001/2011; (iii) execution of the EMIR-compliant OTC derivative reporting addendum by the Treasury function; and (iv) satisfaction of all conditions precedent set forth in the agreement. The Board further authorises the Chief Executive Officer to execute all documents and take all actions necessary to implement this resolution.`

const regulatoryRefs = [
  'REMIT Art. 4',
  'EMIR Refit',
  'ACER Guidance 2025',
  'RAAEY L.4001/2011 Art. 11',
  'MiFID II Art. 2(1)(j)',
  'HEnEx Market Coupling Rules',
]

// ─── Agent script ─────────────────────────────────────────────────────────────

export const draftingAgentScript: AgentScript = {
  agentId: 'drafting-agent',
  agentName: 'Drafting Agent',
  steps: [
    'Loading Procurement template — cross-border commercial agreement',
    'Parsing business need: Greece–Romania interconnector capacity',
    'Identifying REMIT Art. 4 wholesale market disclosure obligations',
    'Flagging EMIR Refit OTC derivative reporting threshold',
    'Referencing ACER guidance on cross-border capacity allocation',
    'Adding RAAEY prior notification requirement (L.4001/2011 Art. 11)',
    'Assessing MiFID II Art. 2(1)(j) financial instrument classification risk',
    'Incorporating HEnEx market coupling transition provisions',
    'Generating mandatory draft resolution with conditions precedent',
    'Running gap analysis — 2 gaps detected',
  ],
  result: `Template scaffolded across 7 sections. Sections 1 and 2 are fully drafted from the business need. Four sections require completion via the assisted-drafting items below.

3 suggested integrations identified: regulatory analysis (REMIT/EMIR/RAAEY/MiFID II), implementation milestones, and a 4-risk framework matrix. 2 information gaps detected: quantified financial figures pending Finance/Treasury confirmation, and external stakeholder contacts missing.

Click "Apply" on each item to insert the pre-written content, or click "Auto-complete draft" to resolve all at once.`,
  structuredOutput: {
    templateSections,
    draftResolution,
    regulatoryRefs,
    suggestions,
    gaps,
  } satisfies DraftingOutput,
  sources: [
    { id: 'pb-4', relevance: 'Section structure and regulatory scaffolding modelled on this precedent' },
    { id: 'pb-5', relevance: 'Bilateral offtake template and draft resolution wording' },
    { id: 'pb-2', relevance: 'FX exposure section and Treasury sign-off language' },
  ],
}
