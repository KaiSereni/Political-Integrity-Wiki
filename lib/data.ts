import 'server-only'
import { adminDb } from './firebase-admin'
import { EDITABLE_FIELDS, type Candidate, type AccountabilityPeriod, type Proposal, type User, type AuditLog, type Election, type Report } from './types'

/**
 * Server-side data fetching functions.
 * Used by Server Components to fetch data directly from Firestore.
 */

export async function getCandidate(id: string): Promise<Candidate | null> {
  const doc = await adminDb.collection('candidates').doc(id).get()
  if (!doc.exists) return null
  const candidate = { id: doc.id, ...doc.data() } as Candidate
  
  // Merge top field values for period-agnostic fields
  const fields = EDITABLE_FIELDS.filter(f => !f.periodSpecific)
  for (const field of fields) {
    const topValue = await getTopProposalValue(id, field.id)
    if (topValue && topValue !== 'Unknown') {
      if (field.id === 'photo') candidate.photoUrl = topValue
      else if (field.id === 'status') candidate.status = topValue as any
      else if (field.id === 'next_election_date') candidate.nextElectionDate = topValue
      else if (field.id === 'industries') candidate.industries = JSON.parse(topValue)
      else if (field.id === 'contact_info') candidate.contactInfo = JSON.parse(topValue)
      else if (field.id.startsWith('badge_')) {
        const badgeId = field.id.replace('badge_', '')
        if (!candidate.badges) candidate.badges = {}
        candidate.badges[badgeId] = topValue as any
      }
    }
  }
  
  return candidate
}

export async function getAccountabilityPeriods(candidateId: string): Promise<AccountabilityPeriod[]> {
  const doc = await adminDb.collection('candidates').doc(candidateId).get()
  if (!doc.exists) return []
  const data = doc.data()
  let periods = (data?.accountabilityPeriods || []) as AccountabilityPeriod[]
  
  // Merge top field values for each period
  const periodSpecificFields = EDITABLE_FIELDS.filter(f => f.periodSpecific)
  
  periods = await Promise.all(periods.map(async (p) => {
    for (const field of periodSpecificFields) {
      const topValue = await getTopProposalValue(candidateId, field.id, p.id)
      if (topValue && topValue !== 'Unknown') {
        const val = (field.type === 'number') ? parseFloat(topValue) : 
                    (field.type === 'json') ? JSON.parse(topValue) : topValue
        
        if (field.id === 'total_raised') p.totalRaised = val
        else if (field.id === 'peak_net_assets') p.peakNetAssets = val
        else if (field.id === 'peak_stock_value') p.peakStockValue = val
        else if (field.id === 'total_pac_money') p.totalPacMoney = val
        else if (field.id === 'corporate_pac_money') p.corporatePacMoney = val
        else if (field.id === 'earmarked_money') p.earmarkedMoney = val
        else if (field.id === 'aipac_money') p.aipacMoney = val
        else if (field.id === 'stock_trading_volume') p.stockTradingVolume = val
        else if (field.id === 'party') p.party = val
        else if (field.id === 'region') p.region = val
        else if (field.id === 'donation_size_breakdown') p.donationSizeBreakdown = val
        else if (field.id === 'donation_location_breakdown') p.donationLocationBreakdown = val
        else if (field.id === 'pac_type_breakdown') p.pacTypeBreakdown = val
        else if (field.id === 'top_pac_donors') p.topPacDonors = val
      }
    }
    return p
  }))

  // Ensure they are sorted by yearEnd desc
  return periods.sort((a, b) => (b.yearEnd || 0) - (a.yearEnd || 0))
}

export async function getAccountabilityPeriod(
  candidateId: string,
  periodId: string
): Promise<AccountabilityPeriod | null> {
  const periods = await getAccountabilityPeriods(candidateId)
  return periods.find(p => p.id === periodId) || null
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
  if (proposals.length === 0) return ''

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

  return combinedPoints >= 500 ? top.value : ''
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

export async function searchCandidates(query: string): Promise<(Candidate & { latestPeriodId?: string; topFields?: Record<string, string> })[]> {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()

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
      const topFields: Record<string, string> = {}
      
      // Get top values for some key fields for the card
      const keyFields = EDITABLE_FIELDS.filter(f => !f.id.startsWith('badge_'))
      for (const f of keyFields) {
        const val = await getTopProposalValue(doc.id, f.id, periods[0]?.id)
        if (val) topFields[f.name] = val
      }

      return {
        id: doc.id,
        ...doc.data(),
        latestPeriodId: periods[0]?.id,
        topFields,
      } as any
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

export async function getAllCandidates(limit: number = 100): Promise<(Candidate & { latestPeriodId?: string; topFields?: Record<string, string> })[]> {
  const snapshot = await adminDb
    .collection('candidates')
    .orderBy('name')
    .limit(limit)
    .get()

  return Promise.all(snapshot.docs.map(async (doc) => {
    const periods = await getAccountabilityPeriods(doc.id)
    const topFields: Record<string, string> = {}
    
    // For main page cards, we only show non-badge fields
    const fieldsToShow = EDITABLE_FIELDS.filter(f => !f.id.startsWith('badge_')).slice(0, 5) // Limit to 5 for performance/UI
    for (const f of fieldsToShow) {
      const val = await getTopProposalValue(doc.id, f.id, periods[0]?.id)
      if (val) topFields[f.name] = val
    }

    return {
      id: doc.id,
      ...doc.data(),
      latestPeriodId: periods[0]?.id,
      topFields,
    }
  })) as any
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
  return getTopProposalValue(candidateId, `badge_${badgeId}`)
}
export async function getUpcomingElections(
  limit: number = 10,
  level?: string,
  state?: string
): Promise<Election[]> {
  let query: any = adminDb
    .collection('elections')
    .where('date', '>=', new Date().toISOString())

  if (level) {
    query = query.where('level', '==', level)
  }
  if (state) {
    query = query.where('state', '==', state)
  }

  const snapshot = await query.orderBy('date', 'asc').limit(limit).get()

  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  })) as Election[]
}

export async function getReports(): Promise<Report[]> {
  try {
    const snapshot = await adminDb.collection('reports')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get()
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report))
  } catch (err) {
    console.error('Error fetching reports:', err)
    return []
  }
}
