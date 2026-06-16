import { create } from 'zustand'
import type { Recommendation, ReviewFunction, AuditEntry, Comment, ContentSection } from '@/lib/types'
import { seedRecommendations, BOARD_MEETING_DATE, BOD_DEADLINE } from '@/data/seed'
import { buildSection1Body } from '@/agents/scripts/drafting'
import { DOCS_BY_ID } from '@/data/documentRepository'

// Rewrites section 1's "Attachments" paragraph from the attached documents so the formal PPC
// document text reflects what the Evidence Collection Assistant attached.
function syncSection1Attachments(
  sections: ContentSection[],
  attachments: string[]
): ContentSection[] {
  if (!sections.some((s) => s.id === 's1')) return sections
  const titles = attachments
    .map((id) => DOCS_BY_ID.get(id)?.title)
    .filter((t): t is string => Boolean(t))
  return sections.map((s) => (s.id === 's1' ? { ...s, body: buildSection1Body(titles) } : s))
}

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

// All four reviewers — including the chairman — must have approved.
function checkAllReviewsDone(reviews: Recommendation['reviews']): boolean {
  return (
    reviews.legal.status === 'Approved' &&
    reviews.finance.status === 'Approved' &&
    reviews.compliance.status === 'Approved' &&
    reviews.chairman.status === 'Approved'
  )
}

// Unlock the chairman gate once all three specialist functions have approved.
function maybeUnlockChairman(reviews: Recommendation['reviews']): Recommendation['reviews'] {
  if (
    reviews.legal.status === 'Approved' &&
    reviews.finance.status === 'Approved' &&
    reviews.compliance.status === 'Approved' &&
    reviews.chairman.status === 'Pending'
  ) {
    return { ...reviews, chairman: { ...reviews.chairman, status: 'In Review' } }
  }
  return reviews
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

  // BU accepts all legal feedback changes → auto-approves all three functions and unlocks Chairman
  acceptFeedbackChanges: (id: string) => void

  submitToSecretariat: (id: string) => void

  updateReadinessScore: (id: string, score: number) => void

  generateBoDPack: (id: string, packItems: string[]) => void

  // Evidence Collection Assistant — attach/detach supporting documents
  attachDocuments: (id: string, docIds: string[]) => void
  detachDocument: (id: string, docId: string) => void
  // Action a flagged missing-evidence item (logs the request to the audit trail)
  requestEvidence: (id: string, label: string) => void

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
        attachments: [],
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
          actor: 'Recommendation Assistant',
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
          // Chairman is unlocked automatically after the three specialists approve.
          const specialists = functions.filter((fn) => fn !== 'chairman')
          specialists.forEach((fn) => {
            reviews[fn] = { ...reviews[fn], status: 'In Review' }
          })
          return { ...r, status: 'Under Review', reviews }
        },
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Sent for review',
          detail: `Sent to: ${functions.filter((fn) => fn !== 'chairman').join(', ')} · Chairman review follows after specialist approvals`,
        }
      )
    },

    sendDirectToChairman: (id, reason) => {
      update(
        id,
        (r) => ({
          ...r,
          status: 'Under Review',
          reviews: { ...r.reviews, chairman: { ...r.reviews.chairman, status: 'In Review' } },
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
          let reviews = {
            ...r.reviews,
            [fn]: { ...r.reviews[fn], status: 'Approved' as const, reviewer, reviewedAt: now() },
          }
          // After each specialist approval, check if the chairman gate can be unlocked.
          reviews = maybeUnlockChairman(reviews)
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
        (r) => {
          let reviews = {
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
          }
          // If a specialist function returns, re-lock the chairman gate.
          if (fn !== 'chairman' && reviews.chairman.status === 'In Review') {
            reviews = { ...reviews, chairman: { ...reviews.chairman, status: 'Pending' } }
          }
          return { ...r, status: 'Returned for Update', reviews }
        },
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
          let reviews = { ...r.reviews }
          ;(Object.keys(reviews) as ReviewFunction[]).forEach((fn) => {
            if (reviews[fn].status === 'Returned') {
              // Chairman resets to Pending; specialists reset to In Review.
              reviews[fn] = { ...reviews[fn], status: fn === 'chairman' ? 'Pending' : 'In Review' }
            }
          })
          // Re-check: if all specialists are still Approved, re-unlock chairman immediately.
          reviews = maybeUnlockChairman(reviews)
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
        (r) => {
          // Auto-approve all three specialist functions (demo shortcut).
          const reviews = {
            ...r.reviews,
            legal: { ...r.reviews.legal, status: 'Approved' as const },
            finance: ['Pending', 'In Review', 'Returned'].includes(r.reviews.finance.status)
              ? { ...r.reviews.finance, status: 'Approved' as const }
              : r.reviews.finance,
            compliance: ['Pending', 'In Review', 'Returned'].includes(r.reviews.compliance.status)
              ? { ...r.reviews.compliance, status: 'Approved' as const }
              : r.reviews.compliance,
          }
          // Now that all three are Approved, unlock the chairman gate.
          const finalReviews = maybeUnlockChairman(reviews)
          return { ...r, status: 'Under Review', reviews: finalReviews }
        },
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Legal feedback integrated — version accepted',
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

    attachDocuments: (id, docIds) => {
      const existing = get().getById(id)?.attachments ?? []
      const added = docIds.filter((d) => !existing.includes(d))
      if (added.length === 0) return
      update(
        id,
        (r) => {
          const attachments = [...(r.attachments ?? []), ...added]
          return { ...r, attachments, contentSections: syncSection1Attachments(r.contentSections, attachments) }
        },
        {
          timestamp: now(),
          actor: 'Evidence Collection Assistant',
          role: 'AI',
          action: added.length > 1 ? 'Attached supporting documents' : 'Attached supporting document',
          detail: `${added.length} document${added.length > 1 ? 's' : ''} attached`,
        }
      )
    },

    detachDocument: (id, docId) => {
      update(id, (r) => {
        const attachments = (r.attachments ?? []).filter((d) => d !== docId)
        return { ...r, attachments, contentSections: syncSection1Attachments(r.contentSections, attachments) }
      })
    },

    requestEvidence: (id, label) => {
      const existing = get().getById(id)?.evidenceRequests ?? []
      if (existing.includes(label)) return
      update(
        id,
        (r) => ({ ...r, evidenceRequests: [...(r.evidenceRequests ?? []), label] }),
        {
          timestamp: now(),
          actor: get().getById(id)?.owner ?? 'Unknown',
          role: get().getById(id)?.businessUnit ?? '',
          action: 'Requested missing evidence',
          detail: label,
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
