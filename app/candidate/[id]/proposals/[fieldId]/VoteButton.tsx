'use client'

import { useAuth } from '@/app/components/AuthProvider'
import { voteProposalAction } from '@/lib/actions'
import { useState } from 'react'

export default function VoteButton({ 
  proposalId, 
  upvoteCount, 
  isPinned,
  path 
}: { 
  proposalId: string
  upvoteCount: number
  isPinned: boolean
  path: string
}) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  return (
    <form action={async (formData) => {
      if (!user) return
      setLoading(true)
      await voteProposalAction(formData)
      setLoading(false)
    }}>
      <input type="hidden" name="proposalId" value={proposalId} />
      <input type="hidden" name="uid" value={user?.uid || ''} />
      <input type="hidden" name="path" value={path} />
      
      <button
        type="submit"
        className={`upvote-btn ${loading ? 'active' : ''}`}
        disabled={!user || isPinned || loading}
        title={!user ? 'Sign in to vote' : isPinned ? 'Pinned by admin' : 'Upvote'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4l-8 8h5v8h6v-8h5z" />
        </svg>
        <span className="count">{upvoteCount}</span>
      </button>
    </form>
  )
}
