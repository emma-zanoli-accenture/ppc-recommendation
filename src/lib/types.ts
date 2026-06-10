export type RecommendationStatus =
  | 'Draft'
  | 'Under Review'
  | 'Returned for Update'
  | 'All Reviews Completed'
  | 'Submitted to Chairman'
  | 'Ready for BoD'
  | 'Submitted to BoD'

export type ReviewFunction = 'legal' | 'finance' | 'compliance'

export type ReviewStatus = 'Pending' | 'In Review' | 'Approved' | 'Returned'

export interface Comment {
  id: string
  author: string
  role: string
  text: string
  createdAt: string
  resolved?: boolean
}

export interface ReviewState {
  status: ReviewStatus
  reviewer?: string
  comments: Comment[]
  reviewedAt?: string
}

export interface ContentSection {
  id: string
  title: string
  body: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  role: string
  action: string
  detail?: string
}

export interface DirectToChairman {
  reason: string
  sentAt: string
}

export interface Recommendation {
  id: string
  title: string
  businessNeed: string
  businessUnit: string
  owner: string
  status: RecommendationStatus
  createdAt: string
  boardMeetingDate: string
  bodDeadline: string
  regulatoryRefs: string[]
  contentSections: ContentSection[]
  draftResolution: string
  reviews: {
    legal: ReviewState
    finance: ReviewState
    compliance: ReviewState
  }
  readinessScore: number
  bodPackItems?: string[]
  directToChairman?: DirectToChairman
  auditLog: AuditEntry[]
}

// Agent types

export interface AgentStep {
  id: string
  label: string
}

export interface AgentRun {
  agentId: string
  agentName: string
  startedAt: string
  steps: AgentStep[]
  streamedOutput: string
  structuredOutput?: unknown
  completedAt?: string
}
