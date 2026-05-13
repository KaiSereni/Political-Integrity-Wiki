'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { submitProposalAction } from '@/lib/actions'
import { usePathname } from 'next/navigation'

export default function ProposalForm({ 
  candidateId, 
  fieldId, 
  periodId, 
  fieldName 
}: { 
  candidateId: string
  fieldId: string
  periodId: string
  fieldName: string
}) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [citations, setCitations] = useState([{ url: '', explanation: '' }])
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
          Sign in with Google to submit proposals.
        </p>
      </div>
    )
  }

  if (!showForm) {
    return (
      <button className="btn btn-primary" onClick={() => setShowForm(true)}>
        + Submit a Proposal (costs 10 pts)
      </button>
    )
  }

  return (
    <div className="card animate-fade-in">
      <h4 style={{ marginBottom: '1rem' }}>New Proposal for {fieldName}</h4>
      <form action={async (formData) => {
        setLoading(true)
        // Add additional data that isn't easily handled by standard form fields
        formData.append('citations', JSON.stringify(citations.filter(c => c.url.trim())))
        formData.append('path', pathname)
        formData.append('uid', user.uid)
        
        await submitProposalAction(formData)
        
        setLoading(false)
        setShowForm(false)
        setNewValue('')
        setCitations([{ url: '', explanation: '' }])
      }}>
        <input type="hidden" name="candidateId" value={candidateId} />
        <input type="hidden" name="fieldId" value={fieldId} />
        <input type="hidden" name="periodId" value={periodId} />

        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="proposal-value">Proposed Value</label>
          <textarea
            id="proposal-value"
            name="value"
            className="textarea"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Enter the value you're proposing..."
            required
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Citations</label>
          {citations.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                className="input"
                placeholder="URL"
                value={c.url}
                onChange={(e) => {
                  const updated = [...citations]
                  updated[i].url = e.target.value
                  setCitations(updated)
                }}
              />
              <input
                className="input"
                placeholder="Explanation"
                value={c.explanation}
                onChange={(e) => {
                  const updated = [...citations]
                  updated[i].explanation = e.target.value
                  setCitations(updated)
                }}
              />
            </div>
          ))}
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={() => setCitations([...citations, { url: '', explanation: '' }])}
          >
            + Add Citation
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !newValue.trim()}>
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
