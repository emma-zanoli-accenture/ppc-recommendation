import type { AgentScript } from '../engine'

export interface LegalReviewOutput {
  criticalItems: { ref: string; description: string; severity: 'high' | 'medium' | 'advisory' }[]
  suggestedIntegrations: string[]
  verdict: 'Approved with conditions' | 'Approved' | 'Returned'
}

export const legalReviewAgentScript: AgentScript = {
  agentId: 'legal-review-agent',
  agentName: 'Legal Review Agent',
  activityType: 'Agentic support',
  cognition: ['Perceive', 'Reason'],
  steps: [
    'Reviewing sections 2 (Necessity) and 3 (Object) for REMIT/EMIR compliance',
    'Cross-referencing ACER Market Monitoring Report 2025 — Art. 4 pre-trade notification',
    'Analysing EMIR Refit clearing obligation — energy OTC threshold (sec. 3)',
    'Reviewing section 5 (Implementation Method) for procedural compliance',
    'Reviewing RAAEY notification procedure under L.4001/2011 Art. 11 (sec. 2)',
    'Assessing MiFID II Art. 2(1)(j) financial instrument classification',
    'Verifying section 8 (Counterparty) — KYC and related-party findings',
    'Reviewing enforceability under Romanian law (Legea energiei 123/2012) — sec. 8',
    'Identifying critical items requiring attention',
  ],
  result: `Legal review complete. I have identified 3 items requiring attention before approval.

Critical — REMIT Art. 4 pre-trade notification: Notification to ACER must be completed and formally acknowledged before contract signature. This is a hard regulatory gate; the draft resolution already includes it as a condition precedent, which is correct. No further action from Legal, but the BU owner must ensure ACER acknowledgement is on file before the Board meeting.

High priority — EMIR Refit derivative addendum: The bilateral electricity forward with HUPX/HEnEx price indexation qualifies as an OTC derivative under EMIR Art. 2(7). Treasury must execute a derivative addendum prior to first settlement. I recommend explicitly naming the designated trade repository (REGIS-TR or DTCC) in Schedule 1 of the agreement and adding a representation that neither party exceeds the clearing threshold under EMIR Art. 10.

Advisory — Romanian regulatory representation: Under Legea energiei nr. 123/2012, CEO S.A. is required to obtain ANRE approval for cross-border bilateral agreements exceeding 100 GWh/year. PPC has no direct obligation, but I recommend adding a counterparty representation and warranty to this effect in Art. 6 of the agreement, together with a termination right if ANRE approval is withdrawn.

All other provisions are consistent with applicable Greek and EU energy law. Three suggested integrations have been added as inline comments. I recommend approval subject to the conditions above.`,
  structuredOutput: {
    criticalItems: [
      {
        ref: 'REMIT Art. 4',
        description: 'ACER pre-trade notification must be completed and acknowledged before contract signature.',
        severity: 'high',
      },
      {
        ref: 'EMIR Refit Art. 2(7)',
        description: 'OTC derivative addendum required; trade repository must be named in Schedule 1.',
        severity: 'high',
      },
      {
        ref: 'Legea energiei 123/2012',
        description: 'Counterparty must obtain ANRE approval; recommend adding representation and warranty.',
        severity: 'advisory',
      },
    ],
    suggestedIntegrations: [
      'Add ANRE approval representation and warranty in Art. 6',
      'Name designated trade repository (REGIS-TR or DTCC) in Schedule 1',
      'Include EMIR clearing threshold non-excess representation',
    ],
    verdict: 'Approved with conditions',
  } satisfies LegalReviewOutput,
  sources: [
    { id: 'pb-1', relevance: 'REMIT Art. 4 pre-trade notification was a mandatory condition precedent — same pattern applied here' },
    { id: 'pb-3', relevance: 'EMIR OTC derivative addendum precedent; REGIS-TR designation wording reused' },
    { id: 'pb-7', relevance: 'RAAEY prior-notification procedure confirmed applicable; filing template on file' },
  ],
}
