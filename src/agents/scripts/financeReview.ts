import type { AgentScript } from '../engine'

export interface FinanceReviewOutput {
  estimatedAnnualValue: string
  budgetCoverage: boolean
  financialNotes: string[]
  verdict: 'Approved' | 'Approved with note' | 'Returned'
}

export const financeReviewAgentScript: AgentScript = {
  agentId: 'finance-review-agent',
  agentName: 'Finance Review Agent',
  activityType: 'Agentic support',
  cognition: ['Perceive', 'Reason'],
  steps: [
    'Retrieving FY2026 budget — Trading & Origination division',
    'Reviewing section 7 (Budget/Expense) — cost centre, account, CAPEX/OPEX classification',
    'Modelling contract value: 500 GWh × EUR 65/MWh forward curve',
    'Assessing counterparty credit risk — CEO S.A. (Fitch BB+)',
    'Quantifying EMIR initial margin requirement',
    'Computing EUR/RON basis risk and FX exposure',
    'Verifying compliance with PPC Treasury Hedging Policy',
  ],
  result: `Finance review complete. Budget coverage is confirmed within the Trading & Origination envelope for FY2026–2027.

Estimated annual contract value: EUR 32.5M (500 GWh × EUR 65/MWh forward curve as of June 2026). This figure falls within the CEO delegated authority threshold of EUR 50M per TPCA-2024, and Board approval is nonetheless correctly sought given the strategic and multi-year nature of the arrangement.

One note recorded: the EUR/RON settlement leg creates an approximately 2.3% FX exposure on quarterly cash flows. Treasury should execute a forward FX hedge within 30 days of contract signature. This is standard practice under the PPC Treasury Hedging Policy and does not constitute a blocker to Board approval.

EMIR initial margin: estimated at EUR 1.2M, within the available collateral facility headroom of EUR 8.4M. Counterparty credit assessment for CEO S.A. (Fitch BB+) is acceptable under the PPC Counterparty Risk Framework; a credit support annex with a EUR 5M threshold is recommended.

Financial impact assessment: positive. The arrangement is expected to generate a contribution margin of EUR 2.1–3.4M annually under base-case forward curves. Approved with the FX hedging note.`,
  structuredOutput: {
    estimatedAnnualValue: 'EUR 32.5M',
    budgetCoverage: true,
    financialNotes: [
      'EUR/RON FX hedge required within 30 days of contract signature',
      'Credit support annex recommended: EUR 5M threshold vs CEO S.A.',
      'EMIR initial margin EUR 1.2M — within available collateral facility',
    ],
    verdict: 'Approved with note',
  } satisfies FinanceReviewOutput,
}
