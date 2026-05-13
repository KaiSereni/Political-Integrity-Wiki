'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AuthProvider'
import { createCandidateAction } from '@/lib/actions'
import IngestingModal from '@/app/components/IngestingModal'

export default function CreateCandidateForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'fec' | 'manual'>('fec')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p className="text-secondary">Please sign in with Google to create candidate pages.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          type="button" 
          className={`btn ${mode === 'fec' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setMode('fec')}
        >
          Import from FEC
        </button>
        <button 
          type="button" 
          className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setMode('manual')}
        >
          Create Manually
        </button>
      </div>

      <form action={async (formData) => {
        setLoading(true)
        setError('')
        
        formData.append('uid', user.uid)
        
        const result = await createCandidateAction(formData)
        
        if (result.error) {
          setError(result.error)
          setLoading(false)
        } else if (result.candidateId) {
          router.push(`/candidate/${result.candidateId}`)
        }
      }}>
        <IngestingModal isOpen={loading} />
        
        {error && (
          <div style={{ 
            padding: '0.75rem 1rem', background: 'var(--danger-muted)', 
            border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--danger)' 
          }}>
            {error}
          </div>
        )}

        {mode === 'fec' ? (
          <div className="card">
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor="fec-id">FEC Candidate ID(s)</label>
              <input
                id="fec-id"
                name="fecId"
                className="input"
                placeholder="e.g. P80001571, S4VT00033"
                required
              />
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
                For federal candidates only.
              </p>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              Import Candidate
            </button>
            <noscript>
              <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--warning)' }}>
                Note: FEC Import requires JavaScript to trigger the ingestion pipeline. 
                Manual creation works without JavaScript.
              </p>
            </noscript>
          </div>
        ) : (
          <div className="card">
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor="candidate-name">Candidate Name</label>
              <input
                id="candidate-name"
                name="name"
                className="input"
                placeholder="Full name of the candidate"
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor="candidate-level">Level</label>
              <select id="candidate-level" name="level" className="select">
                <option value="federal">Federal</option>
                <option value="state">State (requires 1,000 pts)</option>
                <option value="local">Local (requires 1,000 pts)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              Create Candidate Page
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
