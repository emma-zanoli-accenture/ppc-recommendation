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
  activityType: 'Agentic support',
  cognition: ['Perceive', 'Reason', 'Act'],
  steps: [
    'Auditing completeness — verifying all 11 required content sections',
    'Validating draft resolution — mandatory field, structure and validity check',
    'Confirming Legal review status: Approved with conditions',
    'Confirming Finance review status: Approved with note',
    'Confirming Compliance review status: Approved',
    'Confirming Chairman sign-off',
    'Scanning open comments — checking for unresolved items',
    'Importing open points from the activity log',
    'Verifying BoD deadline — computing days remaining',
    'Computing readiness score',
    'Assembling BoD pack',
  ],
  result: `Readiness assessment complete. All 11 content sections are present and complete, and the mandatory draft resolution is valid, correctly formatted and Board-ready. All review functions and the Chairman have signed off: Legal (approved with conditions — documented in the draft resolution), Finance (approved with note — FX hedging recorded), Compliance (approved with recommendation), Chairman (signed off).

Open points are imported from the recommendation's activity log: any supporting evidence that has been requested but not yet received is treated as a minor residual gap and is reflected in the readiness score below.

BoD deadline is within the current planning window. Pack assembled: 6 documents. The Corporate Secretary may schedule the item once the open points are cleared.`,
  structuredOutput: {
    readinessScore: 100,
    completedItems: [
      'All 11 content sections present and complete',
      'Draft resolution valid and Board-ready',
      'Legal review: Approved with conditions (documented)',
      'Finance review: Approved with note (documented)',
      'Compliance review: Approved (recommendation incorporated)',
      'Chairman sign-off recorded',
    ],
    residualGaps: [],
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
