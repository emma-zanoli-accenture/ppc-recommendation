import type { Recommendation, ReviewState } from '@/lib/types'

export const BOARD_MEETING_DATE = '2026-07-22'
export const BOD_DEADLINE = '2026-07-20'

// June sprint meeting — deadline 5 days from demo anchor (urgent bucket)
export const SPRINT_BOARD_MEETING_DATE = '2026-06-16'
export const SPRINT_BOD_DEADLINE = '2026-06-12'

// Missed / overdue items — deadline is before the demo anchor
export const OVERDUE_BOARD_MEETING_DATE = '2026-06-03'
export const OVERDUE_BOD_DEADLINE = '2026-06-01'

const PENDING: ReviewState = { status: 'Pending', comments: [] }
const IN_REVIEW: ReviewState = { status: 'In Review', comments: [] }

function approved(reviewer: string, reviewedAt: string): ReviewState {
  return { status: 'Approved', reviewer, comments: [], reviewedAt }
}

function returned(reviewer: string, commentText: string): ReviewState {
  return {
    status: 'Returned',
    reviewer,
    comments: [
      {
        id: crypto.randomUUID(),
        author: reviewer,
        role: 'Legal',
        text: commentText,
        createdAt: '2026-05-14T11:20:00Z',
      },
    ],
  }
}

export const seedRecommendations: Recommendation[] = [
  // 1 — All Reviews Completed
  {
    id: 'seed-001',
    title: 'Annual Fuel Oil Supply Framework Contract Renewal',
    businessNeed:
      'PPC requires renewal of its annual fuel oil supply framework contract for the Megalopoli and Linoperamata thermal plants. The existing contract expires on 31 August 2026. Continuity of supply is critical for grid frequency regulation during peak demand periods.',
    businessUnit: 'Procurement',
    owner: 'D. Papadopoulos',
    status: 'All Reviews Completed',
    createdAt: '2026-03-10T09:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['RAAEY Supply Security Guidelines 2025'],
    contentSections: [
      { id: 's1', title: 'Business Justification', body: 'Renewal required to ensure uninterrupted fuel supply for peaking units through summer 2027.' },
      { id: 's2', title: 'Scope & Terms', body: 'Three-year framework, up to 180,000 MT/year, competitive tender process completed.' },
      { id: 's3', title: 'Financial Impact', body: 'Estimated spend EUR 145M over three years at current Brent forward curve.' },
      { id: 's4', title: 'Draft Resolution', body: 'Board approves the renewal on the terms set out herein.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the renewal of the annual fuel oil supply framework contract for the Megalopoli and Linoperamata facilities for a term of three years, on the commercial terms set out in the attached term sheet, and authorises the CEO to execute all related documentation.',
    reviews: {
      legal: approved('M. Stavrou', '2026-04-28T14:30:00Z'),
      finance: approved('K. Economou', '2026-04-30T10:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-05-02T09:15:00Z'),
    },
    readinessScore: 84,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-10T09:00:00Z', actor: 'D. Papadopoulos', role: 'Procurement', action: 'Created recommendation', },
      { id: crypto.randomUUID(), timestamp: '2026-04-01T11:00:00Z', actor: 'D. Papadopoulos', role: 'Procurement', action: 'Sent for review', detail: 'Sent to Legal, Finance, Compliance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-02T09:15:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
    ],
  },

  // 2 — Under Review
  {
    id: 'seed-002',
    title: 'Smart Meter Rollout Phase 2 — 800,000 Residential Units',
    businessNeed:
      'Phase 2 of the national smart meter deployment programme covers 800,000 residential customers in Attica and Central Macedonia. Completion is mandated by RAAEY by Q4 2027 under the National Energy Efficiency Action Plan.',
    businessUnit: 'IT',
    owner: 'G. Alexiou',
    status: 'Under Review',
    createdAt: '2026-04-15T08:30:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['RAAEY Smart Metering Decision 2024', 'EU Energy Efficiency Directive 2023/1791'],
    contentSections: [
      { id: 's1', title: 'Programme Scope', body: 'Deployment of 800,000 smart meters across Attica and Central Macedonia regions.' },
      { id: 's2', title: 'Technology & Vendor', body: 'DLMS/COSEM compliant meters, Landis+Gyr selected via competitive tender.' },
      { id: 's3', title: 'Financial Impact', body: 'Capital investment EUR 210M, partially co-financed by Recovery & Resilience Facility.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves Phase 2 of the Smart Meter Rollout Programme for 800,000 residential units, at a total capital investment of EUR 210M, and authorises management to proceed with deployment in accordance with the RAAEY mandate.',
    reviews: {
      legal: IN_REVIEW,
      finance: IN_REVIEW,
      compliance: PENDING,
    },
    readinessScore: 42,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-04-15T08:30:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-10T10:00:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Sent for review', detail: 'Sent to Legal, Finance' },
    ],
  },

  // 3 — Submitted to BoD
  {
    id: 'seed-003',
    title: 'EUR 500M Green Bond Issuance — PPC Green Finance Framework',
    businessNeed:
      'PPC plans to issue a EUR 500M Green Bond under its Green Finance Framework to fund renewable energy capital expenditure in FY2026–2027. The issuance supports PPC\'s Net-Zero 2040 commitment and diversifies the funding base.',
    businessUnit: 'Finance/Treasury',
    owner: 'C. Papadimitriou',
    status: 'Submitted to BoD',
    createdAt: '2026-02-01T10:00:00Z',
    boardMeetingDate: '2026-05-28',
    bodDeadline: '2026-05-26',
    regulatoryRefs: ['EU Green Bond Standard', 'ICMA Green Bond Principles 2021', 'MiFID II Prospectus Regulation'],
    contentSections: [
      { id: 's1', title: 'Transaction Overview', body: 'EUR 500M 7-year fixed rate Green Bond, expected rating BBB (S&P/Fitch).' },
      { id: 's2', title: 'Use of Proceeds', body: 'Renewable energy capex: wind (40%), solar (35%), grid modernisation (25%).' },
      { id: 's3', title: 'Financial Impact', body: 'Coupon ~4.2% estimated. Refinancing of EUR 300M 2019 bond + EUR 200M new money.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the issuance of Green Bonds in an aggregate amount of up to EUR 500,000,000 under the PPC Green Finance Framework, and authorises the CEO and CFO to determine the final terms and execute all related documentation.',
    reviews: {
      legal: approved('M. Stavrou', '2026-03-15T11:00:00Z'),
      finance: approved('K. Economou', '2026-03-18T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-03-20T09:00:00Z'),
    },
    readinessScore: 98,
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'Green Finance Framework',
      'Legal Review Summary',
      'Finance Impact Note',
      'Prospectus Summary',
    ],
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-02-01T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-03-01T09:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-03-20T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-03-25T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Submitted to Chairman' },
      { id: crypto.randomUUID(), timestamp: '2026-04-10T11:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Readiness check completed', detail: 'Score: 98/100' },
      { id: crypto.randomUUID(), timestamp: '2026-04-15T09:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Submitted to BoD' },
    ],
  },

  // 4 — Ready for BoD
  {
    id: 'seed-004',
    title: 'REMIT Inside Information Disclosure Procedure — Annual Review',
    businessNeed:
      'Annual review and update of PPC\'s REMIT Inside Information Disclosure Procedure is required under ACER guidance to reflect 2025 regulatory clarifications on what constitutes inside information in the context of generation outages and demand-side response.',
    businessUnit: 'Regulatory Affairs',
    owner: 'E. Theodoridis',
    status: 'Ready for BoD',
    createdAt: '2026-03-05T08:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['REMIT Art. 7', 'ACER REMIT Q&A v5 (2025)', 'RAAEY Circular 12/2025'],
    contentSections: [
      { id: 's1', title: 'Regulatory Background', body: 'REMIT Art. 7 requires timely public disclosure of inside information. ACER 2025 Q&A clarified thresholds for generation outage disclosure.' },
      { id: 's2', title: 'Proposed Updates', body: 'Updated materiality thresholds, new template for outage disclosures, revised escalation matrix.' },
      { id: 's3', title: 'Implementation Plan', body: 'Training for Trading & Origination and Operations staff by Q3 2026.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the updated REMIT Inside Information Disclosure Procedure, as set out in the attached document, effective from 1 September 2026, and delegates to the CEO authority to make further minor updates as required by regulatory guidance.',
    reviews: {
      legal: approved('M. Stavrou', '2026-05-01T14:00:00Z'),
      finance: approved('K. Economou', '2026-05-03T10:30:00Z'),
      compliance: approved('A. Nikolaou', '2026-05-05T09:00:00Z'),
    },
    readinessScore: 92,
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'Updated REMIT Disclosure Procedure',
      'Legal Review Summary',
      'Compliance Clearance Certificate',
      'Regulatory Reference Sheet',
    ],
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-05T08:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-01T09:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-05-05T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-05-08T10:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Submitted to Chairman' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T11:30:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Readiness check completed', detail: 'Score: 92/100. BoD pack assembled.' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T11:35:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'Ready for BoD' },
    ],
  },

  // 5 — Draft
  {
    id: 'seed-005',
    title: 'Lignite Phase-Out Acceleration: Ptolemaida V Decommissioning Plan',
    businessNeed:
      'PPC is evaluating an accelerated decommissioning schedule for Ptolemaida V (660 MW) ahead of the original 2028 closure date, in response to updated EU Carbon Border Adjustment Mechanism implications and potential access to Just Transition Fund support.',
    businessUnit: 'Operations',
    owner: 'N. Katsaros',
    status: 'Draft',
    createdAt: '2026-05-20T14:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: [],
    contentSections: [
      { id: 's1', title: 'Background', body: 'Initial analysis of accelerated decommissioning options for Ptolemaida V unit.' },
    ],
    draftResolution: '',
    reviews: {
      legal: PENDING,
      finance: PENDING,
      compliance: PENDING,
    },
    readinessScore: 5,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-05-20T14:00:00Z', actor: 'N. Katsaros', role: 'Operations', action: 'Created recommendation' },
    ],
  },

  // 6 — Submitted to Chairman
  {
    id: 'seed-006',
    title: 'Net-Zero 2040 Commitment: Board Endorsement & Climate Transition Plan',
    businessNeed:
      'PPC\'s updated Science-Based Target initiative (SBTi) aligned Net-Zero 2040 commitment requires formal Board endorsement to satisfy investor engagement requirements and CDP reporting obligations due by September 2026.',
    businessUnit: 'ESG',
    owner: 'I. Papadaki',
    status: 'Submitted to Chairman',
    createdAt: '2026-03-20T10:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['EU CSRD (Directive 2022/2464)', 'SBTi Net-Zero Standard v1.2', 'CDP Climate Disclosure Framework'],
    contentSections: [
      { id: 's1', title: 'Commitment Overview', body: 'Net-Zero by 2040 across Scope 1, 2, and material Scope 3 emissions, aligned with 1.5°C pathway.' },
      { id: 's2', title: 'Key Milestones', body: '2028: exit coal; 2032: 80% renewable generation; 2040: net-zero operations.' },
      { id: 's3', title: 'Investment Requirements', body: 'EUR 3.2B capex 2026–2032 in renewable generation and grid infrastructure.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. formally endorses the PPC Net-Zero 2040 Commitment and Climate Transition Plan, as set out in the attached document, and instructs management to publish the commitment and integrate it into the Group\'s strategic planning and capital allocation processes.',
    reviews: {
      legal: approved('M. Stavrou', '2026-05-10T11:00:00Z'),
      finance: approved('K. Economou', '2026-05-12T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-05-15T09:30:00Z'),
    },
    readinessScore: 88,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-20T10:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-20T09:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-05-15T09:30:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-05-22T10:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Submitted to Chairman' },
    ],
  },

  // 7 — Returned for Update
  {
    id: 'seed-007',
    title: 'GDPR Data Retention & Erasure Policy v3 — Triennial Review',
    businessNeed:
      'Triennial review of PPC\'s GDPR Data Retention and Erasure Policy is required following HDPA audit findings in February 2026, which identified gaps in retention periods for smart meter consumption data and call centre recordings.',
    businessUnit: 'Legal/Compliance',
    owner: 'S. Vassiliadis',
    status: 'Returned for Update',
    createdAt: '2026-04-01T09:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['GDPR Art. 5(1)(e)', 'HDPA Decision 3/2026', 'L.4624/2019'],
    contentSections: [
      { id: 's1', title: 'Regulatory Driver', body: 'HDPA audit February 2026 identified retention period gaps for smart meter data (current: indefinite; required: max 36 months) and call centre recordings (current: 90 days; required: 60 days).' },
      { id: 's2', title: 'Proposed Policy Changes', body: 'Updated retention schedules across 14 data categories. Smart meter consumption data: 36 months. Call centre recordings: 60 days.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the updated GDPR Data Retention and Erasure Policy v3 and directs management to implement the revised retention schedules by 30 September 2026.',
    reviews: {
      legal: returned(
        'M. Stavrou',
        'Policy requires more specificity on retention periods for cross-border data transfers under the Greece–Romania interconnector monitoring system. Please clarify whether data processed by Romanian subsidiary PPCR is in scope and add a section on transfer mechanisms (SCCs or adequacy). Returning for update.'
      ),
      finance: PENDING,
      compliance: IN_REVIEW,
    },
    readinessScore: 38,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-04-01T09:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-20T10:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-05-14T11:20:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Returned for update', detail: 'Cross-border data transfer section required' },
    ],
  },

  // 8 — All Reviews Completed
  {
    id: 'seed-008',
    title: 'Executive Remuneration Framework 2026–2028',
    businessNeed:
      'The current executive remuneration policy expires on 31 December 2026. The Board Remuneration Committee has completed its triennial review and proposes an updated framework aligning long-term incentive structures with Net-Zero 2040 milestones.',
    businessUnit: 'HR',
    owner: 'F. Antoniadou',
    status: 'Under Review',
    createdAt: '2026-03-15T11:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['Hellenic Corporate Governance Code 2021', 'L.4706/2020 Art. 110'],
    contentSections: [
      { id: 's1', title: 'Policy Overview', body: 'Three-year framework. Fixed pay: +3% COLA. Variable pay: up to 120% of fixed, 50% linked to ESG/Net-Zero targets.' },
      { id: 's2', title: 'Governance Alignment', body: 'Compliant with Hellenic Corporate Governance Code 2021 and L.4706/2020 disclosure requirements.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the Executive Remuneration Framework for the period 2026–2028, as recommended by the Remuneration Committee, effective from 1 January 2027.',
    reviews: {
      legal: approved('M. Stavrou', '2026-05-18T10:00:00Z'),
      finance: approved('K. Economou', '2026-05-20T14:00:00Z'),
      compliance: IN_REVIEW,
    },
    readinessScore: 65,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-15T11:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-15T09:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Sent for review', detail: 'Sent to Legal, Finance, Compliance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-18T10:00:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Legal review approved' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T14:00:00Z', actor: 'K. Economou', role: 'Finance', action: 'Finance review approved' },
    ],
  },

  // 9 — Submitted to Chairman
  {
    id: 'seed-009',
    title: 'Pumped Hydro Storage Expansion — Sfikia Reservoir (600 MW)',
    businessNeed:
      'PPC seeks Board approval for the development of a 600 MW pumped hydro storage facility at Sfikia Reservoir in Central Macedonia. The project supports grid balancing services and will benefit from EU Innovation Fund co-financing.',
    businessUnit: 'Operations',
    owner: 'V. Mantzoufas',
    status: 'Submitted to Chairman',
    createdAt: '2026-02-20T09:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['RAAEY Pumped Hydro Licensing Framework', 'EU Innovation Fund Round 4', 'Env. Impact Assessment L.4685/2020'],
    contentSections: [
      { id: 's1', title: 'Project Overview', body: '600 MW / 6 GWh pumped hydro storage at existing Sfikia Reservoir. 6-year construction timeline.' },
      { id: 's2', title: 'Financial Case', body: 'Total capex EUR 780M. EU Innovation Fund co-financing up to EUR 200M. Project IRR 9.2% at base case.' },
      { id: 's3', title: 'Regulatory Pathway', body: 'Environmental Impact Assessment submitted. RAAEY generation licence application filed March 2026.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the development of the Sfikia Pumped Hydro Storage Project (600 MW) at a total capital investment of EUR 780M, subject to receipt of EU Innovation Fund co-financing approval and satisfaction of all regulatory conditions, and authorises management to proceed with all necessary development activities.',
    reviews: {
      legal: approved('M. Stavrou', '2026-04-15T11:00:00Z'),
      finance: approved('K. Economou', '2026-04-18T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-04-22T09:30:00Z'),
    },
    readinessScore: 91,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-02-20T09:00:00Z', actor: 'V. Mantzoufas', role: 'Operations', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-03-20T10:00:00Z', actor: 'V. Mantzoufas', role: 'Operations', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-04-22T09:30:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-05-05T10:00:00Z', actor: 'V. Mantzoufas', role: 'Operations', action: 'Submitted to Chairman' },
    ],
  },

  // 10 — Under Review
  {
    id: 'seed-010',
    title: 'Interest Rate Hedging Strategy FY2026: EMIR Reporting Alignment',
    businessNeed:
      'PPC Treasury proposes updates to the interest rate hedging strategy for EUR 1.8B of floating rate debt, incorporating EMIR Refit reporting changes effective Q3 2026 and recalibrating the hedge ratio in response to ECB rate trajectory.',
    businessUnit: 'Finance/Treasury',
    owner: 'C. Papadimitriou',
    status: 'Under Review',
    createdAt: '2026-05-01T10:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['EMIR Refit', 'ISDA Master Agreement 2002', 'ECB Monetary Policy Guidance June 2026'],
    contentSections: [
      { id: 's1', title: 'Current Position', body: 'EUR 1.8B floating rate debt, currently 65% hedged via IRS portfolio. Hedge ratio review triggered by ECB June 2026 guidance.' },
      { id: 's2', title: 'Proposed Strategy', body: 'Increase hedge ratio to 80% via new EUR 270M 5-year IRS. Align reporting with EMIR Refit delegated reporting regime.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the updated Interest Rate Hedging Strategy for FY2026 and authorises the CFO to execute interest rate swap transactions up to EUR 300M notional to implement the strategy.',
    reviews: {
      legal: IN_REVIEW,
      finance: IN_REVIEW,
      compliance: PENDING,
    },
    readinessScore: 35,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-05-01T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T09:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Sent for review', detail: 'Sent to Legal, Finance' },
    ],
  },

  // 11 — Draft
  {
    id: 'seed-011',
    title: 'Offshore Wind Development Licence Application — Kavala Zone',
    businessNeed:
      'PPC is evaluating a first-mover application for an offshore wind development licence in the Kavala offshore zone following the publication of the Greek Offshore Wind Spatial Plan in May 2026. Target capacity: 500 MW Phase 1.',
    businessUnit: 'Procurement',
    owner: 'D. Papadopoulos',
    status: 'Draft',
    createdAt: '2026-06-01T14:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: [],
    contentSections: [],
    draftResolution: '',
    reviews: {
      legal: PENDING,
      finance: PENDING,
      compliance: PENDING,
    },
    readinessScore: 0,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-06-01T14:00:00Z', actor: 'D. Papadopoulos', role: 'Procurement', action: 'Created recommendation' },
    ],
  },

  // 12 — Under Review | HR | OVERDUE (missed June sprint deadline)
  {
    id: 'seed-012',
    title: 'Collective Labour Agreement Renewal 2026–2028',
    businessNeed:
      'The current Collective Labour Agreement (CLA) covering approximately 4,200 PPC employees expires on 31 December 2026. Board-level approval is required to authorise management to enter into renewal negotiations with union representatives and agree the remuneration envelope for 2026–2028.',
    businessUnit: 'HR',
    owner: 'F. Antoniadou',
    status: 'Under Review',
    createdAt: '2026-04-10T09:00:00Z',
    boardMeetingDate: OVERDUE_BOARD_MEETING_DATE,
    bodDeadline: OVERDUE_BOD_DEADLINE,
    regulatoryRefs: ['L.1876/1990 (National CLA Framework)', 'Hellenic Corporate Governance Code 2021'],
    contentSections: [
      { id: 's1', title: 'Current Agreement', body: 'Three-year CLA signed January 2024, covering 4,200 employees across generation, distribution, and corporate functions.' },
      { id: 's2', title: 'Negotiation Mandate', body: 'Proposed envelope: base salary COLA 3.5% + performance bonus restructuring linked to ESG targets.' },
      { id: 's3', title: 'Financial Impact', body: 'Estimated incremental cost EUR 8.2M p.a. over three years. Within approved HR budget headroom.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. authorises management to enter into negotiations for the renewal of the Collective Labour Agreement for 2026–2028, within the financial parameters approved by the Remuneration Committee, and to execute the agreement upon completion of negotiations.',
    reviews: {
      legal: IN_REVIEW,
      finance: approved('K. Economou', '2026-05-12T10:00:00Z'),
      compliance: IN_REVIEW,
    },
    readinessScore: 48,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-04-10T09:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-05T10:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Sent for review', detail: 'Sent to Legal, Finance, Compliance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-12T10:00:00Z', actor: 'K. Economou', role: 'Finance', action: 'Finance review approved' },
    ],
  },

  // 13 — Returned for Update | IT | OVERDUE (missed June sprint deadline)
  {
    id: 'seed-013',
    title: 'Cybersecurity Incident Response Plan — ISO 27001 Alignment',
    businessNeed:
      'Following the mandatory ISO 27001:2022 recertification audit in March 2026, PPC\'s Cybersecurity Incident Response Plan (CIRP) must be updated to address three non-conformities identified by the external auditor: insufficient OT/ICS coverage, missing third-party notification SLAs, and absence of a Board-level escalation pathway for Tier-1 incidents.',
    businessUnit: 'IT',
    owner: 'G. Alexiou',
    status: 'Returned for Update',
    createdAt: '2026-04-20T11:00:00Z',
    boardMeetingDate: OVERDUE_BOARD_MEETING_DATE,
    bodDeadline: OVERDUE_BOD_DEADLINE,
    regulatoryRefs: ['ISO 27001:2022', 'NIS2 Directive 2022/2555', 'ENISA ICS Security Guidelines'],
    contentSections: [
      { id: 's1', title: 'Non-Conformity Summary', body: 'Audit finding AF-2026-07: OT/ICS environments not covered by CIRP scope. AF-2026-08: No SLAs for third-party notification. AF-2026-09: Missing Board escalation pathway.' },
      { id: 's2', title: 'Proposed Updates', body: 'Extend CIRP scope to SCADA/DCS systems at all generation sites. Define 72-hour third-party notification SLA. Add Board escalation matrix for Tier-1 incidents.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the updated Cybersecurity Incident Response Plan (v3.1) incorporating ISO 27001:2022 non-conformity resolutions, and establishes the Board-level escalation pathway for Tier-1 cybersecurity incidents effective immediately.',
    reviews: {
      legal: PENDING,
      finance: PENDING,
      compliance: returned(
        'A. Nikolaou',
        'The updated CIRP does not address the regulatory notification obligations under NIS2 Art. 23 (early warning within 24 hours, full notification within 72 hours to ENISA/national CSIRT). Please add a section on competent authority notifications and revise the incident classification to align with the NIS2 severity scale. Returning for update.'
      ),
    },
    readinessScore: 28,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-04-20T11:00:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-08T09:00:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Sent for review', detail: 'Sent to Compliance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T15:00:00Z', actor: 'A. Nikolaou', role: 'Compliance', action: 'Returned for update', detail: 'NIS2 Art. 23 notification obligations missing' },
    ],
  },

  // 14 — Submitted to BoD | Finance/Treasury | July meeting
  {
    id: 'seed-014',
    title: 'Corporate Headquarters Lease Extension — 3 Chalkokondyli St., Athens',
    businessNeed:
      'The lease agreement for PPC\'s corporate headquarters at 3 Chalkokondyli Street, Athens expires on 31 December 2026. Board approval is required for a five-year extension to ensure operational continuity and lock in current market-rate terms before the anticipated 2027 Athens CBD rent cycle uplift.',
    businessUnit: 'Finance/Treasury',
    owner: 'C. Papadimitriou',
    status: 'Submitted to BoD',
    createdAt: '2026-01-15T10:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['Hellenic Corporate Governance Code 2021', 'IFRS 16 (Leases)'],
    contentSections: [
      { id: 's1', title: 'Lease Overview', body: 'Current lease: 15,200 sqm, EUR 1.85M p.a. Proposed extension: 5 years (2027–2031), EUR 1.92M p.a. (+3.8% step-up Year 3).' },
      { id: 's2', title: 'Market Analysis', body: 'Independent valuation confirms EUR 1.92M is at market. Athens CBD vacancy rate 4.2%; no equivalent alternative at comparable cost.' },
      { id: 's3', title: 'Financial Impact', body: 'IFRS 16 right-of-use asset: EUR 9.2M. Lease liability: EUR 9.2M. No material P&L impact vs. current terms.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the extension of the lease agreement for the corporate headquarters at 3 Chalkokondyli Street, Athens, for a period of five years commencing 1 January 2027, on the commercial terms set out herein, and authorises the CEO to execute all related documentation.',
    reviews: {
      legal: approved('M. Stavrou', '2026-02-18T11:00:00Z'),
      finance: approved('K. Economou', '2026-02-20T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-02-22T09:00:00Z'),
    },
    readinessScore: 95,
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'Independent Valuation Report',
      'Legal Review Summary',
      'IFRS 16 Impact Note',
      'Draft Lease Extension Agreement',
    ],
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-01-15T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-02-10T09:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-02-22T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-03-01T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Submitted to Chairman' },
      { id: crypto.randomUUID(), timestamp: '2026-05-10T14:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Readiness check completed', detail: 'Score: 95/100. BoD pack assembled.' },
      { id: crypto.randomUUID(), timestamp: '2026-05-15T10:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Submitted to BoD' },
    ],
  },

  // 15 — Submitted to BoD | ESG | July meeting
  {
    id: 'seed-015',
    title: 'Biodiversity Net Gain Policy — Renewable Energy Development Sites',
    businessNeed:
      'PPC\'s accelerated renewable energy pipeline (5.2 GW by 2030) will require environmental impact assessments across 38 new sites. Board adoption of a Biodiversity Net Gain (BNG) Policy aligned with the EU Biodiversity Strategy 2030 and EU Nature Restoration Regulation is required to pre-empt regulatory requirements and satisfy ESG investor screening criteria.',
    businessUnit: 'ESG',
    owner: 'I. Papadaki',
    status: 'Submitted to BoD',
    createdAt: '2026-02-10T10:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['EU Nature Restoration Regulation 2023/1115', 'EU Biodiversity Strategy 2030', 'ESRS E4 (Biodiversity)'],
    contentSections: [
      { id: 's1', title: 'Policy Scope', body: 'Applies to all new and refurbished generation sites >1 MW. Minimum 10% BNG required on all developments from 2027.' },
      { id: 's2', title: 'Implementation Framework', body: 'Habitat baseline surveys, mitigation hierarchy, biodiversity credits for unavoidable impacts. Reporting via ESRS E4 from FY2026.' },
      { id: 's3', title: 'Financial Impact', body: 'Estimated EUR 1.2M additional survey and mitigation cost p.a. Funded via environmental provision. Avoids potential permit delays valued at EUR 40–60M in project NPV.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. adopts the PPC Biodiversity Net Gain Policy effective 1 January 2027, applicable to all new and refurbished generation developments above 1 MW, and directs management to integrate BNG requirements into the Group\'s project development and EIA processes.',
    reviews: {
      legal: approved('M. Stavrou', '2026-03-10T11:00:00Z'),
      finance: approved('K. Economou', '2026-03-12T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-03-14T09:00:00Z'),
    },
    readinessScore: 96,
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'BNG Policy Document',
      'Legal Review Summary',
      'Compliance Clearance',
      'ESRS E4 Disclosure Framework',
    ],
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-02-10T10:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-03-01T09:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-03-14T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-03-20T10:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Submitted to Chairman' },
      { id: crypto.randomUUID(), timestamp: '2026-05-05T14:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Readiness check completed', detail: 'Score: 96/100. BoD pack assembled.' },
      { id: crypto.randomUUID(), timestamp: '2026-05-08T10:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Submitted to BoD' },
    ],
  },

  // 16 — All Reviews Completed | Regulatory Affairs | July meeting
  {
    id: 'seed-016',
    title: 'ACER REMIT Annual Supervision Report FY2025 — Board Acknowledgement',
    businessNeed:
      'ACER has published its REMIT Supervision Report for FY2025, which includes a specific reference to PPC\'s market conduct during the January 2025 Greek spot price spike. Board formal acknowledgement of the report and approval of management\'s response is required before the regulatory response deadline of 30 July 2026.',
    businessUnit: 'Regulatory Affairs',
    owner: 'E. Theodoridis',
    status: 'Under Review',
    createdAt: '2026-04-25T09:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['REMIT Art. 15', 'ACER REMIT Supervision Report FY2025', 'RAAEY Circular 8/2026'],
    contentSections: [
      { id: 's1', title: 'Report Summary', body: 'ACER report flags PPC\'s generation dispatch during the January 2025 cold snap. ACER notes possible withholding of capacity but does not open a formal investigation. Monitoring continues.' },
      { id: 's2', title: 'Management Response', body: 'Legal & Regulatory Affairs concludes dispatch was within REMIT-compliant operational parameters. Response letter prepared citing unit availability constraints and RAAEY emergency directions.' },
      { id: 's3', title: 'Remedial Actions', body: 'Enhanced REMIT transaction reporting for capacity withholding scenarios. Updated insider list procedures. Additional ACER liaison officer appointed.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. acknowledges the ACER REMIT Supervision Report FY2025, approves the management response as set out in the attached letter, and endorses the remedial actions package to be submitted to ACER and RAAEY by 30 July 2026.',
    reviews: {
      legal: approved('M. Stavrou', '2026-05-28T11:00:00Z'),
      finance: IN_REVIEW,
      compliance: PENDING,
    },
    readinessScore: 48,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-04-25T09:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-15T09:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Sent for review', detail: 'Sent to Legal, Finance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-28T11:00:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Legal review approved' },
    ],
  },

  // 17 — All Reviews Completed | IT | URGENT (5 days to sprint deadline — Chairman must act)
  {
    id: 'seed-017',
    title: 'ERP Migration to SAP S/4HANA — Roadmap & Business Case Approval',
    businessNeed:
      'PPC\'s current SAP ECC 6.0 platform reaches end of mainstream maintenance in December 2027. Board approval of the S/4HANA migration roadmap and EUR 42M business case is required to begin vendor selection and internal mobilisation in Q3 2026, ahead of the 18-month implementation timeline.',
    businessUnit: 'IT',
    owner: 'G. Alexiou',
    status: 'Under Review',
    createdAt: '2026-05-05T09:00:00Z',
    boardMeetingDate: SPRINT_BOARD_MEETING_DATE,
    bodDeadline: SPRINT_BOD_DEADLINE,
    regulatoryRefs: ['GDPR Art. 25 (Privacy by Design)', 'NIS2 Directive 2022/2555'],
    contentSections: [
      { id: 's1', title: 'Migration Scope', body: 'Full ERP migration: FI/CO, MM, PM, HR modules. Cloud-hosted on SAP RISE. Phased rollout: Core Finance Q4 2026, Operations Q2 2027, HR Q4 2027.' },
      { id: 's2', title: 'Business Case', body: 'Total cost EUR 42M over 24 months. Expected efficiency savings EUR 6.5M p.a. from Year 3. Payback period: 6.5 years.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the SAP S/4HANA Migration Programme at a total investment of EUR 42M, authorises management to commence vendor selection and programme mobilisation, and delegates to the CTO authority to execute implementation contracts up to EUR 15M per tranche.',
    reviews: {
      legal: approved('M. Stavrou', '2026-06-01T14:00:00Z'),
      finance: IN_REVIEW,
      compliance: PENDING,
    },
    readinessScore: 38,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-05-05T09:00:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T10:00:00Z', actor: 'G. Alexiou', role: 'IT', action: 'Sent for review', detail: 'Sent to Legal, Finance' },
      { id: crypto.randomUUID(), timestamp: '2026-06-01T14:00:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Legal review approved' },
    ],
  },

  // 18 — Submitted to Chairman | Finance/Treasury | URGENT (5 days to sprint deadline)
  {
    id: 'seed-018',
    title: 'Group Directors & Officers Insurance Programme Renewal 2026–2027',
    businessNeed:
      'PPC\'s Group Directors & Officers (D&O) and Corporate Legal Liability insurance programme expires on 30 June 2026. The renewal involves an updated coverage structure reflecting the expanded ESG disclosure obligations under CSRD and increased limit to EUR 150M aggregate following the Greek energy market investigations of 2025.',
    businessUnit: 'Finance/Treasury',
    owner: 'C. Papadimitriou',
    status: 'Submitted to Chairman',
    createdAt: '2026-05-10T10:00:00Z',
    boardMeetingDate: SPRINT_BOARD_MEETING_DATE,
    bodDeadline: SPRINT_BOD_DEADLINE,
    regulatoryRefs: ['EU CSRD (Directive 2022/2464)', 'L.4706/2020 Art. 87 (D&O Liability)', 'Hellenic Corporate Governance Code 2021'],
    contentSections: [
      { id: 's1', title: 'Coverage Summary', body: 'EUR 150M aggregate limit (up from EUR 100M). Side A DIC/DIL cover for personal asset protection. CSRD investigation coverage rider added.' },
      { id: 's2', title: 'Premium', body: 'Annual premium EUR 1.85M (vs EUR 1.42M prior year). Market hardening driven by ESG investigation claims across European utilities sector.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the renewal of the Group D&O and Corporate Legal Liability insurance programme for 2026–2027 at an annual premium of EUR 1.85M with aggregate coverage of EUR 150M, and authorises the CFO to execute all related insurance documentation.',
    reviews: {
      legal: approved('M. Stavrou', '2026-05-28T14:00:00Z'),
      finance: approved('K. Economou', '2026-06-01T11:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-06-02T09:30:00Z'),
    },
    readinessScore: 62,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-05-10T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-05-15T09:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Sent for review', detail: 'Sent to Legal, Finance, Compliance' },
      { id: crypto.randomUUID(), timestamp: '2026-05-28T14:00:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Legal review approved' },
      { id: crypto.randomUUID(), timestamp: '2026-06-01T11:00:00Z', actor: 'K. Economou', role: 'Finance', action: 'Finance review approved' },
      { id: crypto.randomUUID(), timestamp: '2026-06-02T09:30:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-06-04T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Submitted to Chairman' },
    ],
  },

  // 20 — All Reviews Completed | Legal/Compliance | OVERDUE (missed June 3 meeting — Chairman did not act in time)
  {
    id: 'seed-020',
    title: 'Board Committee Terms of Reference — Annual Review 2026',
    businessNeed:
      'The Terms of Reference for PPC\'s five Board Committees (Audit, Remuneration, Nominations, ESG, Risk) are subject to mandatory annual review under the Hellenic Corporate Governance Code 2021 and L.4706/2020. The 2026 review incorporates updated ESRS E1/S1 oversight mandates for the ESG Committee and enhanced risk appetite statement procedures for the Risk Committee.',
    businessUnit: 'Legal/Compliance',
    owner: 'S. Vassiliadis',
    status: 'Under Review',
    createdAt: '2026-03-10T09:00:00Z',
    boardMeetingDate: OVERDUE_BOARD_MEETING_DATE,
    bodDeadline: OVERDUE_BOD_DEADLINE,
    regulatoryRefs: ['Hellenic Corporate Governance Code 2021', 'L.4706/2020 Art. 9-11', 'ESRS E1 / S1 (Board Oversight)'],
    contentSections: [
      { id: 's1', title: 'Scope of Changes', body: 'ESG Committee: added ESRS E1/S1 reporting oversight role and quarterly management update obligation. Risk Committee: updated risk appetite statement review cycle from annual to semi-annual.' },
      { id: 's2', title: 'Implementation', body: 'Updated ToR documents approved by each Committee. Board formal approval required. Effective date: post-Board adoption.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves the updated Terms of Reference for all five Board Committees (Audit, Remuneration, Nominations, ESG, Risk) as set out in the attached documents, effective from the date of this resolution.',
    reviews: {
      legal: approved('M. Stavrou', '2026-04-20T11:00:00Z'),
      finance: PENDING,
      compliance: PENDING,
    },
    readinessScore: 45,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-10T09:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-05T10:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Sent for review', detail: 'Sent to Legal' },
      { id: crypto.randomUUID(), timestamp: '2026-04-20T11:00:00Z', actor: 'M. Stavrou', role: 'Legal', action: 'Legal review approved' },
    ],
  },

  // 19 — Ready for BoD | Legal/Compliance | July meeting
  {
    id: 'seed-019',
    title: 'Anti-Bribery & Corruption Policy v4 — Triennial Review',
    businessNeed:
      'Triennial review of PPC\'s Anti-Bribery & Corruption (ABC) Policy is required under the Group Compliance Framework. The v4 update incorporates Greek Law 4557/2018 (as amended), OECD Anti-Bribery Convention updates, and new third-party due diligence requirements triggered by the Group\'s expansion into Romanian and Bulgarian markets.',
    businessUnit: 'Legal/Compliance',
    owner: 'S. Vassiliadis',
    status: 'Ready for BoD',
    createdAt: '2026-03-01T09:00:00Z',
    boardMeetingDate: BOARD_MEETING_DATE,
    bodDeadline: BOD_DEADLINE,
    regulatoryRefs: ['L.4557/2018 (AML/ABC)', 'OECD Anti-Bribery Convention', 'ISO 37001:2016 (ABMS)'],
    contentSections: [
      { id: 's1', title: 'Policy Updates', body: 'Expanded third-party due diligence scope to include all Romanian and Bulgarian counterparties above EUR 50K threshold. Enhanced whistleblower channel anonymity.' },
      { id: 's2', title: 'Training Programme', body: 'Mandatory ABC e-learning module for all 6,800 employees and third-party contractors by Q3 2026. Board members: in-person session July 2026.' },
      { id: 's3', title: 'Implementation', body: 'New ABC screening platform (Refinitiv World-Check) contracted. Integration with procurement system by September 2026.' },
    ],
    draftResolution:
      'The Board of Directors of PPC S.A. approves Anti-Bribery & Corruption Policy v4, effective 1 August 2026, and directs management to implement the updated third-party due diligence requirements and training programme as set out herein.',
    reviews: {
      legal: approved('M. Stavrou', '2026-04-15T11:00:00Z'),
      finance: approved('K. Economou', '2026-04-17T14:00:00Z'),
      compliance: approved('A. Nikolaou', '2026-04-20T09:00:00Z'),
    },
    readinessScore: 90,
    bodPackItems: [
      'Board Memorandum',
      'Draft Board Resolution',
      'ABC Policy v4 Document',
      'Legal Review Summary',
      'Compliance Clearance Certificate',
      'Training Programme Overview',
      'ISO 37001 Gap Analysis',
    ],
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-01T09:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-01T10:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-04-20T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
      { id: crypto.randomUUID(), timestamp: '2026-04-25T10:00:00Z', actor: 'S. Vassiliadis', role: 'Legal/Compliance', action: 'Submitted to Chairman' },
      { id: crypto.randomUUID(), timestamp: '2026-06-03T11:00:00Z', actor: 'P. Georgiou', role: 'Chairman', action: 'Readiness check completed', detail: 'Score: 90/100. BoD pack assembled.' },
      { id: crypto.randomUUID(), timestamp: '2026-06-03T11:30:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'Ready for BoD' },
    ],
  },
]
