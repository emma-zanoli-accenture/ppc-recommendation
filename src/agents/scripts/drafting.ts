import type { AgentScript } from '../engine'
import type { ContentSection } from '@/lib/types'

export interface DraftingOutput {
  contentSections: ContentSection[]
  draftResolution: string
  regulatoryRefs: string[]
  gaps: string[]
}

const contentSections: ContentSection[] = [
  {
    id: 's1',
    title: 'Strategic Context & Business Justification',
    body: 'PPC S.A. seeks to capitalise on its cross-border transmission capacity between Greece and Romania to optimise generation dispatch and improve commercial margins. A bilateral energy trading framework with Complexul Energetic Oltenia S.A. (CEO S.A.) covering up to 500 GWh/year will enable PPC to balance seasonal load curves and establish a foothold in the emerging Romanian forward market ahead of HEnEx market coupling in 2027.',
  },
  {
    id: 's2',
    title: 'Scope & Commercial Terms',
    body: 'The agreement covers bilateral forward trades of electricity at the Greek–Romanian high-voltage interconnector (ENTSO-E NTC: 400 MW), with quarterly physical delivery and HUPX/HEnEx spot price indexation. Tenor: 24 months, renewable annually. Estimated notional value: approximately EUR 32.5M per annum at current forward curve.',
  },
  {
    id: 's3',
    title: 'Regulatory & Legal Framework',
    body: 'The arrangement triggers obligations under: REMIT Art. 4 (pre-trade ACER notification, mandatory before contract signature); EMIR Refit (OTC derivative reporting and clearing threshold assessment — a derivative addendum is required); RAAEY prior notification under L.4001/2011 Art. 11; and MiFID II Art. 2(1)(j) financial instrument classification review. Romanian ANRE approval is the counterparty\'s responsibility.',
  },
  {
    id: 's4',
    title: 'Financial Impact & Risk Assessment',
    body: 'Estimated annual contract value: EUR 32.5M. Primary financial risks: EUR/RON FX basis (~2.3%), interconnector capacity curtailment, and counterparty credit risk (CEO S.A., rated Fitch BB+). Budget coverage confirmation from Finance/Treasury is required before final submission.',
  },
  {
    id: 's5',
    title: 'Implementation Timeline',
    body: 'Q3 2026: Contract negotiation and completion of REMIT/RAAEY notifications. Q4 2026: Contract signature and commencement of first delivery period. Q1 2027: EMIR derivative addendum execution and trade repository registration. Mid-2027: Review of arrangement ahead of scheduled HEnEx market coupling milestone.',
  },
  {
    id: 's6',
    title: 'Stakeholder Impact',
    body: 'Internal stakeholders: Trading & Origination (lead), Legal, Treasury, and Regulatory Affairs. External stakeholders: ACER (REMIT notification), RAAEY (prior notification), HEnEx (market coupling coordination), and CEO S.A. (counterparty). No direct impact on end customers or retail tariffs.',
  },
  {
    id: 's7',
    title: 'Risk Matrix',
    body: 'Key risks: (1) Regulatory — REMIT/EMIR compliance gaps (Likelihood: Low, Impact: High, Mitigant: conditions precedent in draft resolution); (2) Commercial — counterparty default (Likelihood: Low, Impact: Medium, Mitigant: credit support annex); (3) Market — adverse price movement (Likelihood: Medium, Impact: Medium, Mitigant: quarterly settlement with price review); (4) Operational — interconnector outage (Likelihood: Low, Impact: Low, Mitigant: force majeure clause). All risks assessed as within PPC risk appetite.',
  },
]

const draftResolution = `The Board of Directors of PPC S.A. hereby approves the entry into a bilateral energy trading framework agreement with Complexul Energetic Oltenia S.A. (CEO S.A.) for the exchange of up to 500 GWh per annum of electrical energy across the Greek–Romanian high-voltage interconnector, subject to: (i) completion of the REMIT pre-trade notification to ACER prior to contract signature; (ii) prior notification to RAAEY pursuant to Article 11 of L.4001/2011; (iii) execution of the EMIR-compliant OTC derivative reporting addendum by the Treasury function; and (iv) satisfaction of all conditions precedent set forth in the agreement. The Board further authorises the Chief Executive Officer, or such other officers as may be designated in writing, to execute all documents and take all actions necessary or appropriate to implement this resolution.`

const regulatoryRefs = [
  'REMIT Art. 4',
  'EMIR Refit',
  'ACER Guidance 2025',
  'RAAEY L.4001/2011 Art. 11',
  'MiFID II Art. 2(1)(j)',
  'HEnEx Market Coupling Rules',
]

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
    'Generating mandatory draft resolution',
    'Running gap analysis',
  ],
  result: `I've drafted a complete recommendation structure for the cross-border energy trading agreement. The document includes 7 content sections covering strategic context, commercial terms, regulatory framework, financial impact, implementation timeline, stakeholder impact, and risk matrix.

Key regulatory scaffolding applied: REMIT Art. 4 requires pre-trade ACER notification before contract signature — this is a hard gate and has been built into the draft resolution as a condition precedent. The bilateral forward structure triggers EMIR Refit OTC derivative reporting obligations; Treasury must execute a reporting addendum and register with a designated trade repository (REGIS-TR or DTCC).

RAAEY prior notification is mandatory under L.4001/2011 Art. 11 given the cross-border nature of the arrangement. I have also flagged a MiFID II Art. 2(1)(j) classification risk: depending on the precise structuring, the arrangement may qualify as a financial instrument. Legal review should confirm whether the commodity exemption applies.

The mandatory draft resolution has been generated and is structurally valid. One gap detected: the Financial Impact section currently contains estimated figures pending Finance/Treasury budget confirmation. This section should be completed before the recommendation is submitted for review.`,
  structuredOutput: {
    contentSections,
    draftResolution,
    regulatoryRefs,
    gaps: ['Financial Impact section requires Finance/Treasury budget confirmation'],
  } satisfies DraftingOutput,
}
