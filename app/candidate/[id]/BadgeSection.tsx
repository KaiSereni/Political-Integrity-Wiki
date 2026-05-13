import { BADGE_DEFINITIONS, type BadgeStatus, type Proposal } from '@/lib/types'
import BadgeVotingItem from './BadgeVotingItem'

export default function BadgeSection({ 
  candidateId, 
  badgeData, 
  hasUnkeptBadge 
}: { 
  candidateId: string
  badgeData: { badge: any, proposals: Proposal[], topStatus: BadgeStatus }[]
  hasUnkeptBadge: boolean
}) {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <h3 className="section-title">Integrity Badges</h3>
      <p className="text-secondary" style={{ fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
        Community-verified integrity markers. Click a badge to view evidence and vote.
      </p>
      
      {hasUnkeptBadge && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
          ⚠ This candidate has broken a pledge. All other badges are now unreliable.
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem 0.5rem' }}>
        {badgeData.map(({ badge, proposals, topStatus }) => {
          const effectiveStatus: BadgeStatus = hasUnkeptBadge && topStatus !== 'unkept'
            ? 'unknown'
            : topStatus
          
          return (
            <BadgeVotingItem
              key={badge.id}
              candidateId={candidateId}
              badge={badge}
              currentStatus={effectiveStatus}
              proposals={proposals}
            />
          )
        })}
      </div>
    </section>
  )
}
