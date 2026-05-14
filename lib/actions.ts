'use server'

import { revalidatePath } from 'next/cache'
import { adminDb } from './firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Note: In a real production app with JS disabled, we would verify the user via session cookies.
// For this task, we will implement the logic assuming the server can identify the user.
// Since we don't have cookies set up yet, these actions will fail without a UID.
// But we are structuring them to be SSR-ready.

export async function voteProposalAction(formData: FormData) {
  const proposalId = formData.get('proposalId') as string
  const uid = formData.get('uid') as string // In real SSR, this comes from cookie
  const path = formData.get('path') as string

  if (!proposalId || !uid) return { error: 'Unauthorized' }

  try {
    const proposalRef = adminDb.collection('proposals').doc(proposalId)
    const voteRef = proposalRef.collection('votes').doc(uid)
    const voteDoc = await voteRef.get()

    if (voteDoc.exists) {
      // Remove vote
      await adminDb.runTransaction(async (transaction) => {
        transaction.delete(voteRef)
        transaction.update(proposalRef, {
          upvoteCount: FieldValue.increment(-1)
        })
      })
    } else {
      // Add vote
      await adminDb.runTransaction(async (transaction) => {
        transaction.set(voteRef, { timestamp: new Date().toISOString() })
        transaction.update(proposalRef, {
          upvoteCount: FieldValue.increment(1)
        })
      })
    }

    revalidatePath(path)
    return { success: true }
  } catch (err) {
    console.error('Vote action failed:', err)
    return { error: 'Internal error' }
  }
}

export async function submitProposalAction(formData: FormData) {
  const candidateId = formData.get('candidateId') as string
  const fieldId = formData.get('fieldId') as string
  const periodId = formData.get('periodId') as string
  const value = formData.get('value') as string
  const uid = formData.get('uid') as string
  const path = formData.get('path') as string
  
  // Citations are usually passed as arrays in forms but can be tricky
  const citationsJson = formData.get('citations') as string
  const citations = JSON.parse(citationsJson || '[]')

  if (!uid) return { error: 'Unauthorized' }

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get()
    if (!userDoc.exists) return { error: 'User not found' }

    const proposal = {
      candidateId,
      fieldId,
      periodId: periodId || '',
      value,
      citations,
      authorUid: uid,
      authorDisplayName: userDoc.data()?.displayName || 'Anonymous',
      createdAt: new Date().toISOString(),
      upvoteCount: 0,
      pinned: false,
      deletionRequested: false,
    }

    await adminDb.collection('proposals').add(proposal)
    
    // Deduct points
    await adminDb.collection('users').doc(uid).update({
      credibilityPoints: FieldValue.increment(-10)
    })

    revalidatePath(path)
    return { success: true }
  } catch (err) {
    console.error('Submit proposal failed:', err)
    return { error: 'Internal error' }
  }
}

export async function createCandidateAction(formData: FormData) {
  const name = formData.get('name') as string
  const uid = formData.get('uid') as string

  if (!uid) return { error: 'Unauthorized' }
  if (!name) return { error: 'Name is required' }

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get()
    const userData = userDoc.data()
    
    if ((userData?.credibilityPoints || 0) < 1000) {
      return { error: '1,000 credibility points required to create a candidate profile by name.' }
    }

    // Deduct points
    await adminDb.collection('users').doc(uid).update({
      credibilityPoints: FieldValue.increment(-1000)
    })

    const candidateRef = await adminDb.collection('candidates').add({
      name,
      nameNormalized: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      status: 'unknown',
      badges: {},
      accountabilityPeriods: [],
      locations: [],
      createdBy: uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    return { success: true, candidateId: candidateRef.id }
  } catch (err) {
    console.error('Create candidate failed:', err)
    return { error: 'Internal error' }
  }
}
