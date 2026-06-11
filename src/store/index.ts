import { create } from 'zustand'
import type { Recommendation, ReviewFunction, AuditEntry, Comment, ContentSection } from '@/lib/types'
import { seedRecommendations, BOARD_MEETING_DATE, BOD_DEADLINE } from '@/data/seed'

const STORAGE_KEY = 'recopilot-v1'

function uid(): string {
  return crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

function loadFromStorage(): Recommendation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedRecommendations
    const parsed = JSON.parse(raw) as { recommendations: Recommendation[] }
    return parsed.recommendations ?? seedRecommendations
  } catch {
    return seedRecommendations
  }
}

function saveToStorage(recommendations: Recommendation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ recommendations }))
  } catch {}
}

function blankReviews() {
  return {
    legal: { status: 'Pending' as const, comments: [] },
    finance: { status: 'Pending' as const, comments: [] },
    compliance: { status: 'Pending' as const, comments: [] },
    chairman: { status: 'Pending' as const, comments: [] },
  }
}

function checkAllReviewsDone(reviews: Recommendation['reviews']): boolean {
  const active = Object.values(reviews).filter((r) => r.status !== 'Pending')
  return active.length > 0 && active.every((r) => r.status === 'Approved')
}

export interface RecoStore {
  recommendations: Recommendation[]

  // Read helpers
  getById: (id: string) => Recommendation | undefined

  // Lifecycle actions
  createRecommendation: (data: {
    title: string
    businessNeed: string
    businessUnit: string
    owner: string
  }) => string

  updateContent: (
    id: string,
    updates: Partial<Pick<Recommendation, 'title' | 'businessNeed' | 'contentSections' | 'draftResolution' | 'regulatoryRefs'>>
  ) => void

  applyDraftingOutput: (
    id: string,
    output: { contentSections: ContentSection[]; draftResolution: string; regulatoryRefs: string[] }
  ) => void

  sendToFunctions: (id: string, functions: ReviewFunction[]) => void

  sendDirectToChairman: (id: string, reason: string) => void

  addReviewComment: (id: string, fn: ReviewFunction, comment: Omit<Comment, 'id'>) => void

  approveReview: (id: string, fn: ReviewFunction, reviewer: string) => void

  returnForUpdate: (
    id: string,
    fn: ReviewFunction,
    reviewer: string,
    reason: string
  ) => void

  // BU re-submits after addressing review feedback
  resubmitForReview: (id: string) => void

  // BU accepts all legal feedback changes → directly "All Reviews Completed"
  acceptFeedbackChanges: (id: string) => void

  approveDirectSubmission: (id: string) => void

  submitToSecretariat: (id: string) => void

  updateReadinessScore: (id: string, score: number) => void

  generateBoDPack: (id: string, packItems: string[]) => void

  submitToBoD: (id: string) => void

  appendAuditLog: (id: string, entry: Omit<AuditEntry, 'id'>) => void

  resetDemo: () => void
}

export const useRecoStore = create<RecoStore>((set, get) => {
  const initialRecommendations = loadFromStorage()

  const persist = (recommendations: Recommendation[]) => {
    saveToStorage(recommendations)
  }

  const update = (
    id: string,
    updater: (reco: Recommendation) => Recommendation,
    auditEntry?: Omit<AuditEntry, 'id'>
  ) => {
    set((state) => {
      const recommendations = state.recommendations.map((r) => {
        if (r.id !== id) return r
        let updated = updater(r)
        if (auditEntry) {
          updated = {
            ...updated,
            auditLog: [...updated.auditLog, { id: uid(), ...auditEntry }],
          }
        }
        return updated
      })
      persist(recommendations)
      return { recommendations }
    })
  }

  return {
    recommendations: initialRecommendations,

    getById: (id) => get().recommendations.find((r) => r.id === id),

    createRecommendation: ({ title, businessNeed, businessUnit, owner }) => {
      const id = uid()
      const reco: Recommendation = {
        id,
        title,
        businessNeed,
        businessUnit,
        owner,
        status: 'Draft',
        createdAt: now(),
        boardMeetingDate: BOARD_MEETING_DATE,
        bodDeadline: BOD_DEADLINE,
        regulatoryRefs: [],
        contentSections: [],
        draftResolution: '',
        reviews: blankReviews(),
        readinessScore: 0,
        auditLog: [
          {
            id: uid(),
            timestamp: now(),
            actor: owner,
            role: businessUnit,
            action: 'Created recommendation',
          },
        ],
      }
      set((state) => {
        const recommendations = [...state.recommendations, reco]
        persist(recommendations)
        return { recommendations }
      })
      return id
    },

    updateContent: (id, updates) => {
      update(id, (r) => ({ ...r, ...updates }), {
        timestamp: now(),
        actor: get().getById(id)?.owner ?? 'Unknown',
        role: get().getById(id)?.businessUnit ?? '',
        action: 'Updated content',
      })
    },

    applyDraftingOutput: (id, output) => {
      update(
        id,
        (r) => ({
          ...r,
          contentSections: output.contentSections,
          draftResolution: output.draftResolution,
          regulatoryRefs: output.regulatoryRefs,
        }),
        {
          timestamp: now(),
          actor: 'Recommendation Co-Pilot',
          role: 'AI',
          action: 'Applied drafting output',
          detail: `${output.contentSections.length} sections, draft resolution generated`,
        }
      )
    },

    sendToFunctions: (id, functions) => {
      update(
        id,
        (r) => {
          const reviews = { ...r.reviews }
          functions.forEach((fn) => {
            reviews[fn] = { ...reviews[fn], status: 'In Review' }
          })
          return { ...r, status: 'Under Review', reviews }
        },
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Sent for review',
          detail: `Sent to: ${functions.join(', ')}`,
        }
      )
    },

    sendDirectToChairman: (id, reason) => {
      update(
        id,
        (r) => ({
          ...r,
          status: 'Submitted to Secretariat',
          directToChairman: { reason, sentAt: now() },
        }),
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Sent directly to Chairman',
          detail: reason,
        }
      )
    },

    addReviewComment: (id, fn, comment) => {
      update(id, (r) => ({
        ...r,
        reviews: {
          ...r.reviews,
          [fn]: {
            ...r.reviews[fn],
            comments: [...r.reviews[fn].comments, { id: uid(), ...comment }],
          },
        },
      }))
    },

    approveReview: (id, fn, reviewer) => {
      update(
        id,
        (r) => {
          const reviews = {
            ...r.reviews,
            [fn]: { ...r.reviews[fn], status: 'Approved' as const, reviewer, reviewedAt: now() },
          }
          const newStatus = checkAllReviewsDone(reviews) ? 'All Reviews Completed' as const : r.status
          return { ...r, reviews, status: newStatus }
        },
        {
          timestamp: now(),
          actor: reviewer,
          role: fn,
          action: `${fn.charAt(0).toUpperCase() + fn.slice(1)} review approved`,
        }
      )
    },

    returnForUpdate: (id, fn, reviewer, reason) => {
      update(
        id,
        (r) => ({
          ...r,
          status: 'Returned for Update',
          reviews: {
            ...r.reviews,
            [fn]: {
              ...r.reviews[fn],
              status: 'Returned' as const,
              reviewer,
              comments: [
                ...r.reviews[fn].comments,
                { id: uid(), author: reviewer, role: fn, text: reason, createdAt: now() },
              ],
            },
          },
        }),
        {
          timestamp: now(),
          actor: reviewer,
          role: fn,
          action: 'Returned for update',
          detail: reason,
        }
      )
    },

    resubmitForReview: (id) => {
      update(
        id,
        (r) => {
          const reviews = { ...r.reviews }
          ;(Object.keys(reviews) as ReviewFunction[]).forEach((fn) => {
            if (reviews[fn].status === 'Returned') {
              reviews[fn] = { ...reviews[fn], status: 'In Review' }
            }
          })
          return { ...r, status: 'Under Review', reviews }
        },
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Resubmitted for review after update',
        }
      )
    },

    acceptFeedbackChanges: (id) => {
      update(
        id,
        (r) => ({
          ...r,
          status: 'All Reviews Completed' as const,
          reviews: {
            ...r.reviews,
            legal: { ...r.reviews.legal, status: 'Approved' as const },
          },
        }),
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Legal feedback integrated — version accepted',
        }
      )
    },

    approveDirectSubmission: (id) => {
      update(
        id,
        (r) => ({
          ...r,
          directToChairman: r.directToChairman
            ? { ...r.directToChairman, chairmanApproved: true, approvedAt: now() }
            : r.directToChairman,
        }),
        {
          timestamp: now(),
          actor: 'Chairman',
          role: 'Chairman',
          action: 'Direct submission authorised',
          detail: 'Reason for bypassing standard reviews accepted',
        }
      )
    },

    submitToSecretariat: (id) => {
      update(
        id,
        (r) => ({ ...r, status: 'Submitted to Secretariat' }),
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Submitted to Secretariat',
        }
      )
    },

    updateReadinessScore: (id, score) => {
      update(id, (r) => ({ ...r, readinessScore: score }), {
        timestamp: now(),
        actor: 'Readiness Agent',
        role: 'AI',
        action: 'Readiness score updated',
        detail: `Score: ${score}/100`,
      })
    },

    generateBoDPack: (id, packItems) => {
      update(
        id,
        (r) => ({ ...r, status: 'Ready for BoD', bodPackItems: packItems }),
        {
          timestamp: now(),
          actor: 'Readiness Agent',
          role: 'AI',
          action: 'BoD pack assembled',
          detail: `${packItems.length} documents`,
        }
      )
    },

    submitToBoD: (id) => {
      update(
        id,
        (r) => ({ ...r, status: 'Submitted to BoD' }),
        {
          timestamp: now(),
          actor: 'Chairman',
          role: 'Chairman',
          action: 'Submitted to Board of Directors',
        }
      )
    },

    appendAuditLog: (id, entry) => {
      update(id, (r) => ({
        ...r,
        auditLog: [...r.auditLog, { id: uid(), ...entry }],
      }))
    },

    resetDemo: () => {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {}
      set({ recommendations: seedRecommendations })
    },
  }
})

// Cross-tab sync via storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as { recommendations: Recommendation[] }
        if (parsed.recommendations) {
          useRecoStore.setState({ recommendations: parsed.recommendations })
        }
      } catch {}
    }
  })
}
