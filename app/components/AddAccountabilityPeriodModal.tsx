'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-client'
import { POSITION_LABELS, type Position } from '@/lib/types'
import IngestingModal from './IngestingModal'

interface Props {
  candidateId: string
  isOpen: boolean
  onClose: () => void
}

export default function AddAccountabilityPeriodModal({ candidateId, isOpen, onClose }: Props) {
  const router = useRouter()
  const [mode, setMode] = useState<'fec' | 'manual'>('fec')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    try {
      const addFn = httpsCallable<any, any>(functions, 'add_accountability_period', {timeout: 600000})
      
      const params: any = { candidateId }
      if (mode === 'fec') {
        params.fecId = formData.get('fecId')
      } else {
        params.position = formData.get('position')
        params.yearStart = parseInt(formData.get('yearStart') as string)
        params.yearEnd = parseInt(formData.get('yearEnd') as string)
        params.party = formData.get('party')
        params.region = formData.get('region')
        params.state = formData.get('state')
        params.result = formData.get('result')
      }

      await addFn(params)
      onClose()
      router.refresh()
    } catch (err: any) {
      console.error('Failed to add period:', err)
      setError(err.message || 'An error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <IngestingModal isOpen={loading} />
      <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Add Accountability Period</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button 
            type="button" 
            className={`btn btn-sm ${mode === 'fec' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMode('fec')}
          >
            By FEC ID
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMode('manual')}
          >
            By Name (1,000 pts)
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '0.75rem 1rem', background: 'var(--danger-muted)', 
            border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', 
            marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--danger)' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'fec' ? (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">FEC Candidate ID</label>
                <input name="fecId" className="input" placeholder="e.g. S4VT00033" required />
                <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.375rem' }}>
                  This will automatically pull all historical election data for this ID.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Year Start</label>
                  <input name="yearStart" type="number" className="input" placeholder="2022" required />
                </div>
                <div>
                  <label className="label">Year End</label>
                  <input name="yearEnd" type="number" className="input" placeholder="2024" required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Position</label>
                  <select name="position" className="select" required>
                    {Object.entries(POSITION_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Result</label>
                  <select name="result" className="select" required>
                    <option value="unknown">Unknown</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="active">Active/Ongoing</option>
                    <option value="withdrew">Withdrew</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="label">Party</label>
                  <input name="party" className="input" placeholder="Democratic" />
                </div>
                <div>
                  <label className="label">State (Abbr)</label>
                  <input name="state" className="input" placeholder="VT" maxLength={2} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Region</label>
                <input name="region" className="input" placeholder="e.g. VT-01 or Vermont" />
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {mode === 'fec' ? 'Import Data' : 'Add Period (1,000 pts)'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
