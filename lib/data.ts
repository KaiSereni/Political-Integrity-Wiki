import 'server-only'
import { adminDb } from './firebase-admin'
import type { Candidate, AccountabilityPeriod, Proposal, User, AuditLog, Election } from './types'

/**
 * Server-side data fetching functions.
 * Used by Server Components to fetch data directly from Firestore.
 */

export async function getCandidate(id: string): Promise<Candidate | null> {
  const doc = await adminDb.collection('candidates').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as Candidate
}

export async function getAccountabilityPeriods(candidateId: string): Promise<AccountabilityPeriod[]> {
  const snapshot = await adminDb
    .collection('candidates')
    .doc(candidateId)
    .collection('accountabilityPeriods')
    .orderBy('yearEnd', 'desc')
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AccountabilityPeriod[]
}

export async function getAccountabilityPeriod(
  candidateId: string,
  periodId: string
): Promise<AccountabilityPeriod | null> {
  const doc = await adminDb
    .collection('candidates')
    .doc(candidateId)
    .collection('accountabilityPeriods')
    .doc(periodId)
    .get()

  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as AccountabilityPeriod
}

export async function getProposals(
  candidateId: string,
  fieldId: string,
  periodId?: string
): Promise<Proposal[]> {
  let query = adminDb
    .collection('proposals')
    .where('candidateId', '==', candidateId)
    .where('fieldId', '==', fieldId)

  if (periodId) {
    query = query.where('periodId', '==', periodId)
  }

  const snapshot = await query.orderBy('upvoteCount', 'desc').orderBy('createdAt', 'asc').get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[]
}

export async function getTopProposalValue(
  candidateId: string,
  fieldId: string,
  periodId?: string
): Promise<string> {
  const proposals = await getProposals(candidateId, fieldId, periodId)
  if (proposals.length === 0) return 'Unknown'

  const top = proposals[0]

  // Check if combined credibility of upvoters >= 500
  if (top.pinned) return top.value

  const votesSnapshot = await adminDb
    .collection('proposals')
    .doc(top.id)
    .collection('votes')
    .get()

  let combinedPoints = 0
  for (const vote of votesSnapshot.docs) {
    const userDoc = await adminDb.collection('users').doc(vote.id).get()
    if (userDoc.exists) {
      combinedPoints += (userDoc.data()?.credibilityPoints || 0)
    }
  }

  return combinedPoints >= 500 ? top.value : 'Unknown'
}

export async function getTopEditors(limit: number = 10): Promise<User[]> {
  const snapshot = await adminDb
    .collection('users')
    .orderBy('credibilityPoints', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[]
}

export async function searchCandidates(query: string): Promise<(Candidate & { latestPeriodId?: string })[]> {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()

  // Firestore doesn't support substring queries, so we fetch all and filter in-memory
  const snapshot = await adminDb
    .collection('candidates')
    .orderBy('name')
    .limit(500)
    .get()

  return Promise.all(snapshot.docs
    .filter((doc) => {
      const name = (doc.data().name || '').toLowerCase()
      return name.includes(lowerQuery)
    })
    .slice(0, 20)
    .map(async (doc) => {
      const periods = await getAccountabilityPeriods(doc.id)
      return {
        id: doc.id,
        ...doc.data(),
        latestPeriodId: periods[0]?.id,
      } as Candidate & { latestPeriodId?: string }
    }))
}

export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const snapshot = await adminDb
    .collection('auditLogs')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLog[]
}

export async function getAllCandidates(limit: number = 100): Promise<(Candidate & { latestPeriodId?: string })[]> {
  const snapshot = await adminDb
    .collection('candidates')
    .orderBy('name')
    .limit(limit)
    .get()

  return Promise.all(snapshot.docs.map(async (doc) => {
    const periods = await getAccountabilityPeriods(doc.id)
    return {
      id: doc.id,
      ...doc.data(),
      latestPeriodId: periods[0]?.id,
    }
  })) as Promise<(Candidate & { latestPeriodId?: string })[]>
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const doc = await adminDb.collection('users').doc(uid).get()
  if (!doc.exists) return null
  return { uid: doc.id, ...doc.data() } as User
}

export async function getBadgeProposals(
  candidateId: string,
  badgeId: string
): Promise<Proposal[]> {
  const fieldId = `badge_${badgeId}`
  const snapshot = await adminDb
    .collection('proposals')
    .where('candidateId', '==', candidateId)
    .where('fieldId', '==', fieldId)
    .orderBy('upvoteCount', 'desc')
    .orderBy('createdAt', 'asc')
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Proposal[]
}

export async function getTopBadgeStatus(
  candidateId: string,
  badgeId: string
): Promise<string> {
  const proposals = await getBadgeProposals(candidateId, badgeId)
  if (proposals.length === 0) return 'unknown'

  const top = proposals[0]
  if (top.pinned) return top.value

  // Check if combined credibility of upvoters >= 500
  const votesSnapshot = await adminDb
    .collection('proposals')
    .doc(top.id)
    .collection('votes')
    .get()

  let combinedPoints = 0
  for (const vote of votesSnapshot.docs) {
    const userDoc = await adminDb.collection('users').doc(vote.id).get()
    if (userDoc.exists) {
      combinedPoints += (userDoc.data()?.credibilityPoints || 0)
    }
  }

  return combinedPoints >= 500 ? top.value : 'unknown'
}
export async function getUpcomingElections(limit: number = 5): Promise<Election[]> {
  const snapshot = await adminDb
    .collection('elections')
    .where('date', '>=', new Date().toISOString())
    .orderBy('date', 'asc')
    .limit(limit)
    .get()

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Election[]
}
