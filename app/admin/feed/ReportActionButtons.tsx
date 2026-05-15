'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-client'

export default function ReportActionButtons({ report, onResolved }: { report: any, onResolved: () => void }) {
  const [loading, setLoading] = useState(false)
  const [banModalOpen, setBanModalOpen] = useState(false)
  const [banDuration, setBanDuration] = useState('7')
  const [isPermanent, setIsPermanent] = useState(false)

  const handleResolve = async (decision: 'approve' | 'reject') => {
    if (report.type === 'proposal' && decision === 'approve' && !banModalOpen) {
      if (confirm(`Are you sure you want to approve this report and delete the proposal? You'll have the option to ban the author next.`)) {
        setBanModalOpen(true)
      }
      return
    }

    if (decision === 'reject' && !confirm("Are you sure you want to reject this report?")) {
      return
    }
    
    executeResolve(decision, false, 0, false)
  }

  const executeResolve = async (decision: 'approve' | 'reject', banUser: boolean, durationDays: number, permanent: boolean) => {
    setLoading(true)
    setBanModalOpen(false)
    try {
      const fnName = report.type === 'period' ? 'admin_resolve_period_report' : 'admin_resolve_proposal_report'
      const resolveFn = httpsCallable<any, any>(functions, fnName)
      
      await resolveFn({
        reportId: report.id,
        decision,
        banUser,
        banDurationDays: durationDays,
        permanentBan: permanent
      })
      
      onResolved()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to resolve report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button 
        onClick={() => handleResolve('approve')} 
        disabled={loading}
        className="btn btn-sm btn-primary"
      >
        Approve (Delete {report.type === 'period' ? 'Period' : 'Proposal'})
      </button>
      <button 
        onClick={() => handleResolve('reject')} 
        disabled={loading}
        className="btn btn-sm btn-secondary"
      >
        Reject (Dismiss Report)
      </button>

      {banModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card animate-scale-in" style={{ width: '100%', maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Ban User</h3>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              The report will be approved and the proposal deleted. Do you want to ban the author?
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="checkbox" 
                  checked={isPermanent} 
                  onChange={(e) => setIsPermanent(e.target.checked)}
                />
                Permanent Ban
              </label>
              
              {!isPermanent && (
                <div>
                  <label className="label">Ban Duration (Days)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={banDuration} 
                    onChange={(e) => setBanDuration(e.target.value)}
                    min="1"
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => executeResolve('approve', true, parseInt(banDuration) || 7, isPermanent)} 
                className="btn btn-primary" style={{ flex: 1 }}
              >
                Ban & Approve
              </button>
              <button 
                onClick={() => executeResolve('approve', false, 0, false)} 
                className="btn btn-secondary" style={{ flex: 1 }}
              >
                Skip Ban & Approve
              </button>
              <button 
                onClick={() => setBanModalOpen(false)} 
                className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
