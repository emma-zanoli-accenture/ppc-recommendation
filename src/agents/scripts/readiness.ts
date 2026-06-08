import type { AgentScript } from '../engine'

export interface ReadinessOutput {
  readinessScore: number
  completedItems: string[]
  residualGaps: string[]
  bodPackItems: string[]
  bodPackReady: boolean
}

export const readinessAgentScript: AgentScript = {
  agentId: 'readiness-agent',
  agentName: 'Readiness Agent',
  steps: [
    'Auditing completeness — verifying all 7 required content sections',
    'Validating draft resolution — mandatory field, structure and validity check',
    'Confirming Legal review status: Approved with conditions',
    'Confirming Finance review status: Approved with note',
    'Confirming Compliance review status: Approved',
    'Scanning open comments — checking for unresolved items',
    'Verifying BoD deadline — computing days remaining',
    'Computing readiness score',
    'Assembling BoD pack',
  ],
  result: `Readiness assessment complete. Score: 94 / 100.

All 7 content sections are present and complete. The mandatory draft resolution is valid, correctly formatted, and Board-ready. All three review functions have provided their approvals: Legal (approved with conditions — 3 items documented and addressed in the draft resolution), Finance (approved with note — FX hedging note recorded), Compliance (approved with recommendation — post-implementation report added to draft resolution).

Score breakdown: content completeness 21/21, draft resolution 25/25, legal review 18/18, finance review 18/18, compliance review 18/18. Minor deductions: the Legal conditions precedent are documented but not yet marked as actioned by the BU owner (−4), and the EMIR derivative addendum is referenced but not attached as a formal exhibit (−2).

BoD deadline: 8 days remaining. Pack assembled: 6 documents.

Recommendation is Ready for BoD. The Corporate Secretary may now schedule the item on the Board agenda.`,
  structuredOutput: {
    readinessScore: 94,
    completedItems: [
      'All 7 content sections present',
      'Draft resolution valid and Board-ready',
      'Legal review: Approved with conditions (documented)',
      'Finance review: Approved with note (documented)',
      'Compliance review: Approved (recommendation incorporated)',
    ],
    residualGaps: [
      'Legal conditions precedent not yet marked actioned by BU owner (−4)',
      'EMIR derivative addendum not attached as formal exhibit (−2)',
    ],
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'Legal Review Summary',
      'Finance Impact Note',
      'Compliance Clearance Certificate',
      'Regulatory Reference Sheet',
    ],
    bodPackReady: true,
  } satisfies ReadinessOutput,
  sources: [
    { id: 'pb-6', relevance: 'Cross-border BoD pack structure and readiness checklist' },
    { id: 'pb-8', relevance: 'Counterparty credit assessment precedent; Fitch BB+ appetite confirmed in prior Board resolution' },
  ],
}
