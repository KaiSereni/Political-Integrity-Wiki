'use client'

import { useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'
import { submitProposalAction } from '@/lib/actions'
import { usePathname } from 'next/navigation'
import { EDITABLE_FIELDS } from '@/lib/types'

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

  const field = EDITABLE_FIELDS.find(f => f.id === fieldId)
  const isPhoto = field?.type === 'photo'
  const isNumber = field?.type === 'number'
  const isList = field?.type === 'json'
  const citationOptional = field?.citationOptional

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

  const validateAndSubmit = async (formData: FormData) => {
    setLoading(true)
    
    if (isNumber) {
      if (isNaN(parseFloat(newValue))) {
        alert('Please enter a valid number')
        setLoading(false)
        return
      }
    }

    if (isList) {
      try {
        const parsed = JSON.parse(newValue)
        if (field?.id === 'top_pac_donors') {
          if (!Array.isArray(parsed)) throw new Error('Must be an array')
          if (field.maxLength && parsed.length > field.maxLength) {
            alert(`Maximum ${field.maxLength} donors allowed`)
            setLoading(false)
            return
          }
        }
      } catch (e) {
        alert('Please enter valid JSON data for this field')
        setLoading(false)
        return
      }
    }

    const filteredCitations = citations.filter(c => c.url.trim())
    if (!citationOptional && filteredCitations.length === 0) {
      alert('At least one citation is required for this field.')
      setLoading(false)
      return
    }

    // Add additional data that isn't easily handled by standard form fields
    formData.append('citations', JSON.stringify(filteredCitations))
    formData.append('path', pathname)
    formData.append('uid', user.uid)
    
    await submitProposalAction(formData)
    
    setLoading(false)
    setShowForm(false)
    setNewValue('')
    setCitations([{ url: '', explanation: '' }])
  }

  return (
    <div className="card animate-fade-in">
      <h4 style={{ marginBottom: '1rem' }}>New Proposal for {fieldName}</h4>
      <form action={validateAndSubmit}>
        <input type="hidden" name="candidateId" value={candidateId} />
        <input type="hidden" name="fieldId" value={fieldId} />
        <input type="hidden" name="periodId" value={periodId} />

        <div style={{ marginBottom: '1rem' }}>
          <label className="label" htmlFor="proposal-value">Proposed Value {isNumber && '(Number)'} {isList && '(JSON)'}</label>
          <textarea
            id="proposal-value"
            name="value"
            className="textarea"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={isList ? '[{"name": "Example PAC", "amount": 5000, "type": "Corporate"}]' : "Enter the value..."}
            required
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-xs" 
              onClick={() => setNewValue('Unknown')}
            >
              Set to "Unknown"
            </button>
            {field?.id === 'top_pac_donors' && (
              <button 
                type="button" 
                className="btn btn-secondary btn-xs" 
                onClick={() => setNewValue('[]')}
              >
                Set to Empty List
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">Citations {!citationOptional && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
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
