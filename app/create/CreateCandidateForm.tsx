'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/components/AuthProvider'
import { functions } from '@/lib/firebase-client'
import { httpsCallable } from 'firebase/functions'
import IngestingModal from '@/app/components/IngestingModal'

export default function CreateCandidateForm() {
  const { user } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'fec' | 'name'>('fec')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <p className="text-secondary">Please sign in with Google to create candidate pages.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      if (mode === 'fec') {
        const fecId = formData.get('fecId') as string
        const ingestFn = httpsCallable<{ fecId: string }, { candidateId: string }>(functions, 'ingest_fec_candidate', {timeout: 600000})
        const result = await ingestFn({ fecId })
        router.push(`/candidate/${result.data.candidateId}`)
      } else {
        const name = formData.get('name') as string
        const createFn = httpsCallable<{ name: string }, { candidateId: string }>(functions, 'create_candidate', {timeout: 600000})
        const result = await createFn({ name })
        router.push(`/candidate/${result.data.candidateId}`)
      }
    } catch (err: any) {
      console.error('Submission failed:', err)
      setError(err.message || 'An unexpected error occurred.')
      setLoading(false)
    }
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
          By FEC ID
        </button>
        <button 
          type="button" 
          className={`btn ${mode === 'name' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setMode('name')}
        >
          By Name (1,000 pts)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
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
                For federal candidates. Multiple IDs can be separated by commas.
              </p>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              Ingest Candidate
            </button>
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
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
                Creating a candidate by name costs 1,000 credibility points.
              </p>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              Create Candidate Profile
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
