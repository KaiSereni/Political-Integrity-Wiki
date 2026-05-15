import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCandidate, getProposals } from '@/lib/data'
import { EDITABLE_FIELDS } from '@/lib/types'
import type { Metadata } from 'next'
import ProposalForm from './ProposalForm'
import VoteButton from './VoteButton'
import ReportProposalAction from './ReportProposalAction'

export async function generateMetadata(
  props: { params: Promise<{ id: string; fieldId: string }> }
): Promise<Metadata> {
  const { id, fieldId } = await props.params
  const candidate = await getCandidate(id)
  const field = EDITABLE_FIELDS.find((f) => f.id === fieldId)
  if (!candidate || !field) return { title: 'Not Found' }
  return {
    title: `${field.name} — ${candidate.name}`,
    description: `Proposals for ${field.name} for ${candidate.name}. Vote on values and contribute data.`,
  }
}

export default async function ProposalsPage(
  props: {
    params: Promise<{ id: string; fieldId: string }>
    searchParams: Promise<{ period?: string }>
  }
) {
  const { id, fieldId } = await props.params
  const { period: periodId } = await props.searchParams

  const candidate = await getCandidate(id)
  if (!candidate) notFound()

  const field = EDITABLE_FIELDS.find((f) => f.id === fieldId)
  if (!field) notFound()

  const proposals = await getProposals(id, fieldId, periodId)
  
  const sorted = [...proposals].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.upvoteCount - a.upvoteCount || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return (
    <div className="container animate-fade-in" style={{ maxWidth: 800, paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href={`/candidate/${id}${periodId ? `/${periodId}` : ''}`} style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Back to {candidate.name}
        </Link>
      </div>

      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{field.name}</h1>
      <p className="text-secondary" style={{ marginBottom: '2rem' }}>{field.description}</p>

      {/* Submit new proposal form (Client component but using server action) */}
      <ProposalForm 
        candidateId={id} 
        fieldId={fieldId} 
        periodId={periodId || ''} 
        fieldName={field.name} 
      />

      <div style={{ marginTop: '2rem' }}>
        <h3 className="section-title">Community Proposals</h3>
        {sorted.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p className="text-secondary">No proposals yet for this field.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sorted.map((proposal, i) => (
              <div
                key={proposal.id}
                className={`proposal-card ${i === 0 && !proposal.pinned ? 'top-proposal' : ''} ${proposal.pinned ? 'pinned' : ''}`}
              >
                <VoteButton 
                  proposalId={proposal.id} 
                  upvoteCount={proposal.upvoteCount} 
                  isPinned={proposal.pinned}
                  path={`/candidate/${id}/proposals/${fieldId}${periodId ? `?period=${periodId}` : ''}`}
                />

                <div className="proposal-content">
                  <div className="proposal-value">{proposal.value}</div>
                  <div className="proposal-meta">
                    <span>by {proposal.authorDisplayName}</span>
                    <span> • </span>
                    <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                    {proposal.pinned && (
                      <span style={{ color: 'var(--success)', marginLeft: '0.5rem' }}>📌 Pinned</span>
                    )}
                    {i === 0 && !proposal.pinned && (
                      <span style={{ color: 'var(--accent-secondary)', marginLeft: '0.5rem' }}>★ Top</span>
                    )}
                    <span style={{ marginLeft: 'auto' }}>
                      <ReportProposalAction proposalId={proposal.id} candidateId={id} />
                    </span>
                  </div>
                  {proposal.citations.length > 0 && (
                    <div className="citation-list">
                      {proposal.citations.map((c, j) => (
                        <div key={j} style={{ marginBottom: '0.25rem' }}>
                          <a href={c.url} target="_blank" rel="noopener noreferrer" className="citation-link" style={{ display: 'block' }}>
                            🔗 {c.url.length > 80 ? c.url.substring(0, 80) + '...' : c.url}
                          </a>
                          {c.explanation && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '1.25rem', marginTop: '0.125rem' }}>
                              {c.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
