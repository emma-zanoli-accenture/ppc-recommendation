import type { AgentScript } from '../engine'

export interface ComplianceReviewOutput {
  policyChecks: { policy: string; status: 'pass' | 'flag' }[]
  recommendations: string[]
  verdict: 'Approved' | 'Approved with recommendation' | 'Returned'
}

export const complianceReviewAgentScript: AgentScript = {
  agentId: 'compliance-review-agent',
  agentName: 'Compliance Review Agent',
  steps: [
    'Checking PPC Group Trading Policy v4.2 — commercial thresholds',
    'Reviewing Board Delegation of Authority matrix — bilateral trading',
    'Screening conflict of interest register',
    'Verifying ESG screening: counterparty environmental profile',
    'Cross-checking Anti-Bribery & Corruption policy — third-party due diligence',
  ],
  result: `Compliance review complete. The agreement is consistent with PPC Group policies and the corporate governance framework.

Trading Policy v4.2: the contract structure — bilateral forward, 24-month tenor, quarterly physical settlement, HUPX/HEnEx price indexation — falls within the permitted instrument types defined in Schedule A of the Trading Policy. Board approval is required as the contract value exceeds the EUR 10M executive approval threshold; this recommendation correctly routes it to the Board.

Delegation of Authority: confirmed. Cross-border bilateral energy trading agreements above EUR 10M require Board approval per the 2025 DoA matrix. No sub-delegation is permitted.

Conflict of interest: no flags identified in the current register for PPC personnel involved in the negotiation, nor for the counterparty CEO S.A. or its key personnel.

ESG screening: CEO S.A. is executing a transition from lignite to gas-fired generation in line with Romania's National Energy and Climate Plan (NECP 2021–2030). No ESG blocking criteria are triggered under PPC's Sustainable Finance Framework or the Green Bond Framework covenants.

Anti-Bribery & Corruption: third-party due diligence on CEO S.A. was last completed 14 months ago — within the 24-month refresh cycle. No adverse findings.

One recommendation: the Board resolution should include a request for a 12-month post-implementation compliance report confirming that REMIT and EMIR obligations remain current and that no material regulatory changes have occurred. Approved.`,
  structuredOutput: {
    policyChecks: [
      { policy: 'Trading Policy v4.2', status: 'pass' },
      { policy: 'Delegation of Authority matrix', status: 'pass' },
      { policy: 'Conflict of Interest register', status: 'pass' },
      { policy: 'ESG Screening — Sustainable Finance Framework', status: 'pass' },
      { policy: 'Anti-Bribery & Corruption — third-party due diligence', status: 'pass' },
    ],
    recommendations: [
      'Include 12-month post-implementation compliance report in Board resolution',
    ],
    verdict: 'Approved with recommendation',
  } satisfies ComplianceReviewOutput,
}
