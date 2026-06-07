import type { Recommendation, ReviewState } from '@/lib/types'

export const BOARD_MEETING_DATE = '2026-07-22'
export const BOD_DEADLINE = '2026-07-20'

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
      { id: crypto.randomUUID(), timestamp: '2026-03-25T10:00:00Z', actor: 'C. Papadimitriou', role: 'Finance/Treasury', action: 'Submitted to Secretariat' },
      { id: crypto.randomUUID(), timestamp: '2026-04-10T11:00:00Z', actor: 'P. Georgiou', role: 'Corporate Secretariat', action: 'Readiness check completed', detail: 'Score: 98/100' },
      { id: crypto.randomUUID(), timestamp: '2026-04-15T09:00:00Z', actor: 'P. Georgiou', role: 'Corporate Secretariat', action: 'Submitted to BoD' },
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
      { id: crypto.randomUUID(), timestamp: '2026-05-08T10:00:00Z', actor: 'E. Theodoridis', role: 'Regulatory Affairs', action: 'Submitted to Secretariat' },
      { id: crypto.randomUUID(), timestamp: '2026-05-20T11:30:00Z', actor: 'P. Georgiou', role: 'Corporate Secretariat', action: 'Readiness check completed', detail: 'Score: 92/100. BoD pack assembled.' },
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

  // 6 — Submitted to Secretariat
  {
    id: 'seed-006',
    title: 'Net-Zero 2040 Commitment: Board Endorsement & Climate Transition Plan',
    businessNeed:
      'PPC\'s updated Science-Based Target initiative (SBTi) aligned Net-Zero 2040 commitment requires formal Board endorsement to satisfy investor engagement requirements and CDP reporting obligations due by September 2026.',
    businessUnit: 'ESG',
    owner: 'I. Papadaki',
    status: 'Submitted to Secretariat',
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
      { id: crypto.randomUUID(), timestamp: '2026-05-22T10:00:00Z', actor: 'I. Papadaki', role: 'ESG', action: 'Submitted to Secretariat' },
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
    status: 'All Reviews Completed',
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
      compliance: approved('A. Nikolaou', '2026-05-22T09:00:00Z'),
    },
    readinessScore: 80,
    auditLog: [
      { id: crypto.randomUUID(), timestamp: '2026-03-15T11:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Created recommendation' },
      { id: crypto.randomUUID(), timestamp: '2026-04-15T09:00:00Z', actor: 'F. Antoniadou', role: 'HR', action: 'Sent for review' },
      { id: crypto.randomUUID(), timestamp: '2026-05-22T09:00:00Z', actor: 'System', role: 'System', action: 'Status changed', detail: 'All Reviews Completed' },
    ],
  },

  // 9 — Submitted to Secretariat
  {
    id: 'seed-009',
    title: 'Pumped Hydro Storage Expansion — Sfikia Reservoir (600 MW)',
    businessNeed:
      'PPC seeks Board approval for the development of a 600 MW pumped hydro storage facility at Sfikia Reservoir in Central Macedonia. The project supports grid balancing services and will benefit from EU Innovation Fund co-financing.',
    businessUnit: 'Operations',
    owner: 'V. Mantzoufas',
    status: 'Submitted to Secretariat',
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
      { id: crypto.randomUUID(), timestamp: '2026-05-05T10:00:00Z', actor: 'V. Mantzoufas', role: 'Operations', action: 'Submitted to Secretariat' },
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
]
