'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { voteProposalAction, submitProposalAction } from '@/lib/actions'
import { usePathname } from 'next/navigation'
import type { Proposal } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pledged: { label: 'Pledged', color: 'var(--success)', icon: '✓' },
  denied: { label: 'Denied', color: 'var(--danger)', icon: '✗' },
  unkept: { label: 'Unkept', color: 'var(--warning)', icon: '⚠' },
}

export default function BadgeProposalList({ 
  candidateId, 
  badgeId, 
  proposals 
}: { 
  candidateId: string
  badgeId: string
  proposals: Proposal[]
}) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('pledged')
  const [citations, setCitations] = useState([{ url: '', explanation: '' }])
  const [loading, setLoading] = useState(false)

  const sorted = [...proposals].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.upvoteCount - a.upvoteCount || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <div>
      {user && !showForm && (
        <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(true)} style={{ marginBottom: '1rem' }}>
          + Propose Status
        </button>
      )}

      {showForm && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
          <form action={async (formData) => {
            setLoading(true)
            formData.append('candidateId', candidateId)
            formData.append('fieldId', `badge_${badgeId}`)
            formData.append('periodId', '')
            formData.append('value', selectedStatus)
            formData.append('uid', user!.uid)
            formData.append('path', pathname)
            formData.append('citations', JSON.stringify(citations.filter(c => c.url.trim())))
            
            await submitProposalAction(formData)
            
            setLoading(false)
            setShowForm(false)
          }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label className="label">Proposed Status</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {Object.entries(STATUS_LABELS).map(([key, { label, icon }]) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm ${selectedStatus === key ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedStatus(key)}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label className="label">Citations</label>
              {citations.map((c, i) => (
                <input
                  key={i}
                  className="input"
                  style={{ marginBottom: '0.25rem' }}
                  placeholder="URL (e.g. YouTube clip)"
                  value={c.url}
                  onChange={(e) => {
                    const updated = [...citations]
                    updated[i].url = e.target.value
                    setCitations(updated)
                  }}
                />
              ))}
              <button type="button" className="btn btn-secondary btn-xs" onClick={() => setCitations([...citations, { url: '', explanation: '' }])}>
                + Add Citation
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sorted.map((proposal) => {
          const statusInfo = STATUS_LABELS[proposal.value] || { label: proposal.value, color: 'var(--text-muted)', icon: '?' }
          return (
            <div key={proposal.id} className="proposal-card" style={{ padding: '0.5rem 0.75rem' }}>
              <form action={async (formData) => {
                if (!user) return
                await voteProposalAction(formData)
              }} style={{ marginRight: '0.75rem' }}>
                <input type="hidden" name="proposalId" value={proposal.id} />
                <input type="hidden" name="uid" value={user?.uid || ''} />
                <input type="hidden" name="path" value={pathname} />
                <button type="submit" className="upvote-btn" disabled={!user || proposal.pinned}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4l-8 8h5v8h6v-8h5z" />
                  </svg>
                  <span className="count" style={{ fontSize: '0.75rem' }}>{proposal.upvoteCount}</span>
                </button>
              </form>

              <div className="proposal-content">
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {statusInfo.icon} {statusInfo.label}
                  {proposal.pinned && <span style={{ color: 'var(--success)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>📌 Pinned</span>}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  by {proposal.authorDisplayName}
                </div>
                {proposal.citations.map((c, j) => (
                  <a key={j} href={c.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent-secondary)', marginTop: '0.125rem' }}>
                    🔗 {c.url.length > 40 ? c.url.substring(0, 40) + '...' : c.url}
                  </a>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
