'use client'

import { useState } from 'react'
import type { BadgeStatus, Proposal } from '@/lib/types'
import BadgeProposalList from './BadgeProposalList'

export default function BadgeVotingItem({
  candidateId,
  badge,
  currentStatus,
  proposals,
}: {
  candidateId: string
  badge: any
  currentStatus: BadgeStatus
  proposals: Proposal[]
}) {
  const [expanded, setExpanded] = useState(false)

  const statusClasses: Record<BadgeStatus, string> = {
    unknown: 'badge-unknown',
    pledged: 'badge-pledged',
    denied: 'badge-denied',
    unkept: 'badge-unkept',
  }
  
  const statusIcons: Record<BadgeStatus, string> = {
    unknown: '?',
    pledged: '✓',
    denied: '✗',
    unkept: '⚠',
  }

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`badge ${statusClasses[currentStatus]}`}
        style={{ cursor: 'pointer', border: 'none' }}
      >
        <span>{statusIcons[currentStatus]}</span>
        <span>{badge.name}</span>
        <span style={{ marginLeft: '0.25rem', opacity: 0.6, fontSize: '0.7rem' }}>
          {proposals.length > 0 ? `(${proposals.length})` : ''}
          {expanded ? ' ▲' : ' ▼'}
        </span>
      </button>

      {expanded && (
        <div className="card animate-fade-in" style={{ marginTop: '0.5rem', padding: '1rem', maxWidth: 600 }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {badge.description}
          </p>
          
          <BadgeProposalList 
            candidateId={candidateId} 
            badgeId={badge.id} 
            proposals={proposals} 
          />
        </div>
      )}
    </div>
  )
}
