import type { AgentScript } from '../engine'
import { DRAFT_RESOLUTION } from './drafting'

// ─────────────────────────────────────────────────────────────────────────────
// New scripted assistants added to mirror the official deck (steps 1, 3, 4, 5, 6).
// All output is precompiled and deterministic — no live calls.
// ─────────────────────────────────────────────────────────────────────────────

// ── Step 1 · Historical Case Assistant ──────────────────────────────────────
export interface HistoricalMatch {
  id: string
  title: string
  outcome: string
  similarity: number
}

export interface HistoricalCaseOutput {
  matches: HistoricalMatch[]
}

export const historicalCaseAgentScript: AgentScript = {
  agentId: 'historical-case-assistant',
  agentName: 'Historical Case Assistant',
  activityType: 'Agentic support',
  cognition: ['Perceive'],
  steps: [
    'Parsing business need: Greece–Romania interconnector, bilateral trading',
    'Searching the recommendation archive for similar cross-border energy cases',
    'Ranking precedents by counterparty, regulatory profile and structure',
    'Surfacing the 4 most relevant past recommendations',
  ],
  result: `4 closely related precedents retrieved from the knowledge base.

The strongest match is the REMIT-compliant bilateral power swap with ČEZ a.s. (Approved with conditions) — same ACER pre-trade notification pattern and EMIR addendum requirement. The Mytilinaios 10-year PPA and the Greek–North Macedonia capacity allocation provide the RAAEY prior-notification structure and the BoD-pack checklist. The CEO S.A. counterparty risk framework already confirms a EUR 40M exposure limit and Fitch BB+ appetite for this exact counterparty.

These precedents are passed to the Recommendation Co-Pilot as drafting context. Open any to review the resolution wording and conditions precedent.`,
  structuredOutput: {
    matches: [
      { id: 'pb-1', title: 'REMIT-compliant bilateral power swap with ČEZ a.s.', outcome: 'Approved with conditions', similarity: 0.94 },
      { id: 'pb-8', title: 'CEO S.A. (Romania) counterparty risk and credit framework', outcome: 'Approved with conditions', similarity: 0.91 },
      { id: 'pb-5', title: 'Power Purchase Agreement with Mytilinaios S.A.', outcome: 'Approved with conditions', similarity: 0.83 },
      { id: 'pb-6', title: 'Greek–North Macedonia cross-border capacity allocation', outcome: 'Approved', similarity: 0.79 },
    ],
  } satisfies HistoricalCaseOutput,
  sources: [
    { id: 'pb-1', relevance: 'Closest precedent — bilateral cross-border swap, ACER/EMIR condition pattern' },
    { id: 'pb-8', relevance: 'Same counterparty (CEO S.A.) — exposure limit and Fitch BB+ appetite confirmed' },
    { id: 'pb-5', relevance: 'RAAEY prior-notification structure and draft-resolution format' },
    { id: 'pb-6', relevance: 'Cross-border capacity BoD-pack checklist' },
  ],
}

// ── Step 3 · Resolution Assistant ────────────────────────────────────────────
export interface ResolutionOption {
  id: string
  label: string
  summary: string
  recommended: boolean
}

export interface ResolutionOutput {
  options: ResolutionOption[]
  // Full operative resolution for the recommended option — inserted into section 10.
  draftResolution: string
}

export const resolutionAssistantScript: AgentScript = {
  agentId: 'resolution-assistant',
  agentName: 'Resolution Assistant',
  activityType: 'Agentic support',
  cognition: ['Reason'],
  steps: [
    'Analysing the proposed object and key transaction terms',
    'Retrieving resolution wording from similar past resolutions',
    'Generating 3 resolution options with conditions precedent',
    'Highlighting impacts and dependencies per option',
    'Recommending the conditional-approval option',
  ],
  result: `3 resolution options drafted for the Board.

Option A — Conditional approval (recommended): approve entry into the Master Agreement subject to (i) ACER REMIT Art. 4 acknowledgement on file, (ii) RAAEY prior notification acknowledged, (iii) Credit Support Annex executed. Mirrors the ČEZ a.s. precedent and keeps regulatory gates as hard conditions precedent.

Option B — Approve with delegated authority: as Option A, but delegate execution of the EMIR addendum to the Group Treasurer. Faster execution, slightly wider delegation.

Option C — Approve in principle, ratify later: authorise negotiation and bring the final terms back for ratification. Lowest risk, but loses first-mover advantage ahead of HEnEx–HUPX coupling.

Option A is recommended. On completion, its full wording is inserted into the draft-resolution section (section 10), which the Recommendation Co-Pilot left as a structural placeholder.`,
  structuredOutput: {
    options: [
      { id: 'opt-a', label: 'Conditional approval', summary: 'Approve subject to ACER / RAAEY / CSA conditions precedent.', recommended: true },
      { id: 'opt-b', label: 'Approve with delegated authority', summary: 'As A, with EMIR addendum execution delegated to the Group Treasurer.', recommended: false },
      { id: 'opt-c', label: 'Approve in principle', summary: 'Authorise negotiation; final terms return to the Board for ratification.', recommended: false },
    ],
    draftResolution: DRAFT_RESOLUTION,
  } satisfies ResolutionOutput,
  sources: [
    { id: 'pb-1', relevance: 'Conditional-approval resolution wording and condition-precedent structure' },
    { id: 'pb-5', relevance: 'Draft-resolution format for bilateral procurement arrangements' },
  ],
}

// ── Step 4 · Evidence Collection Assistant ───────────────────────────────────
export interface EvidenceDoc {
  id: string
  name: string
  status: 'attached' | 'missing'
}

export interface EvidenceOutput {
  documents: EvidenceDoc[]
  applicablePolicies: string[]
}

export const evidenceCollectionAgentScript: AgentScript = {
  agentId: 'evidence-collection-assistant',
  agentName: 'Evidence Collection Assistant',
  activityType: 'Agentic support',
  cognition: ['Perceive'],
  steps: [
    'Scanning the recommendation for referenced attachments (A–D)',
    'Auto-retrieving supporting documents from the document store',
    'Identifying applicable policies and regulations',
    'Flagging missing or outstanding evidence',
  ],
  result: `Supporting documents collected and checked against the εισήγηση attachment list.

Attached: (A) Draft Master Electricity Trading Agreement, (B) Draft Credit Support Annex, (C) KYC / AML screening report — CEO S.A. (3 June 2026). Outstanding: (D) Finance/Treasury confirmation note — pending Finance review.

Applicable policies and regulations identified and linked: PPC Group Trading Policy v4.2, Group Authorisation Matrix (2025), REMIT Art. 4, EMIR Refit, RAAEY L.4001/2011 Art. 11. One evidence gap flagged — the Treasury confirmation note will be supplied during Finance review.`,
  structuredOutput: {
    documents: [
      { id: 'doc-a', name: 'Draft Master Electricity Trading Agreement', status: 'attached' },
      { id: 'doc-b', name: 'Draft Credit Support Annex', status: 'attached' },
      { id: 'doc-c', name: 'KYC / AML screening report — CEO S.A.', status: 'attached' },
      { id: 'doc-d', name: 'Finance/Treasury confirmation note', status: 'missing' },
    ],
    applicablePolicies: [
      'PPC Group Trading Policy v4.2',
      'Group Authorisation Matrix (2025)',
      'REMIT Art. 4',
      'EMIR Refit',
      'RAAEY L.4001/2011 Art. 11',
    ],
  } satisfies EvidenceOutput,
  sources: [
    { id: 'pb-6', relevance: 'Cross-border BoD-pack evidence checklist' },
  ],
}

// ── Step 5 · Review Planning Assistant ───────────────────────────────────────
export interface PlanningMilestone {
  label: string
  date: string
}

export interface ReviewPlanningOutput {
  approvalType: string
  bodDeadline: string
  milestones: PlanningMilestone[]
}

export const reviewPlanningAgentScript: AgentScript = {
  agentId: 'review-planning-assistant',
  agentName: 'Review Planning Assistant',
  activityType: 'Agentic support',
  cognition: ['Perceive', 'Reason', 'Act'],
  steps: [
    'Reading the target Board meeting date and working-day calendar',
    'Computing the BoD submission deadline (2 working days prior)',
    'Classifying the approval type by value and regulatory exposure',
    'Auto-scheduling parallel-review milestones',
  ],
  result: `Approval timing planned for the upcoming Board meeting.

Recommended approval type: Standard parallel review (Legal, Finance, Compliance) with mandatory Chairman sign-off — appropriate for a >EUR 10M, multi-year, cross-border arrangement with regulatory conditions precedent.

The BoD submission deadline is 2 working days before the meeting. Review milestones have been scheduled to leave buffer for one feedback loop. Critical-path item: the REMIT Art. 4 ACER acknowledgement must be on file 5 business days before the meeting.`,
  structuredOutput: {
    approvalType: 'Standard parallel review + mandatory Chairman sign-off',
    bodDeadline: '2 working days before the Board meeting',
    milestones: [
      { label: 'Reviews launched', date: 'Day 0' },
      { label: 'Specialist sign-offs target', date: 'Day +5' },
      { label: 'Feedback loop buffer', date: 'Day +7' },
      { label: 'BoD submission deadline', date: '2 wd before meeting' },
    ],
  } satisfies ReviewPlanningOutput,
}

// ── Step 6 · Review Workflow Assistant ───────────────────────────────────────
export interface ReviewerMapping {
  fn: 'legal' | 'finance' | 'compliance' | 'chairman'
  label: string
  reason: string
  mandatory: boolean
}

export interface ReviewWorkflowOutput {
  reviewers: ReviewerMapping[]
}

export const reviewWorkflowAgentScript: AgentScript = {
  agentId: 'review-workflow-assistant',
  agentName: 'Review Workflow Assistant',
  activityType: 'Agentic support',
  cognition: ['Perceive', 'Act'],
  steps: [
    'Classifying recommendation type: cross-border bilateral energy trading',
    'Applying governance rules from the Group Authorisation Matrix',
    'Mapping reviewers by function and threshold',
    'Engaging reviewers and launching the review workflow',
  ],
  result: `Reviewer mapping proposed under the Group Authorisation Matrix.

Required reviewers: Legal (REMIT/EMIR/RAAEY/MiFID II exposure), Finance (>EUR 10M notional, FX and credit risk), Compliance (Trading Policy v4.2 and DoA fit). The Chairman is engaged as a mandatory reviewer for cross-border arrangements above EUR 10M — this sign-off cannot be removed.

All four reviewers are pre-selected. Confirm to launch the review workflow; the Approval Tracking Assistant will then monitor sign-off status and send reminders.`,
  structuredOutput: {
    reviewers: [
      { fn: 'legal', label: 'Legal', reason: 'REMIT / EMIR / RAAEY / MiFID II regulatory exposure', mandatory: true },
      { fn: 'finance', label: 'Finance', reason: '>EUR 10M notional; FX and counterparty credit risk', mandatory: true },
      { fn: 'compliance', label: 'Compliance', reason: 'Trading Policy v4.2 and Delegation of Authority fit', mandatory: true },
      { fn: 'chairman', label: 'Chairman', reason: 'Mandatory for cross-border arrangements above EUR 10M', mandatory: true },
    ],
  } satisfies ReviewWorkflowOutput,
}
