export type RecommendationStatus =
  | 'Draft'
  | 'Under Review'
  | 'Returned for Update'
  | 'All Reviews Completed'
  | 'Submitted to Secretariat'
  | 'Ready for BoD'
  | 'Submitted to BoD'

// Stub — will be fully defined in Step 2
export interface Recommendation {
  id: string
  title: string
  status: RecommendationStatus
}
