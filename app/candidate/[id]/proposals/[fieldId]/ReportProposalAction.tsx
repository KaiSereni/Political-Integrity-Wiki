'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-client'

export default function ReportProposalAction({ proposalId, candidateId }: { proposalId: string; candidateId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleReport = async () => {
    if (!confirm("Are you sure you want to report this proposal? It costs 5 points. Use this to report inappropriate or malicious material.")) return

    setLoading(true)
    try {
      const reportFn = httpsCallable<any, any>(functions, 'report_proposal')
      await reportFn({ proposalId, candidateId })
      alert('Proposal reported successfully.')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to report proposal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleReport} 
      disabled={loading}
      className="btn btn-sm" 
      style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '0.75rem', padding: '0 0.5rem', cursor: 'pointer', textDecoration: 'underline' }}
    >
      {loading ? 'Reporting...' : 'Report (5 pts)'}
    </button>
  )
}
