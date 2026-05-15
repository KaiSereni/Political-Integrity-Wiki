'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-client'
import { useAuth } from '@/app/components/AuthProvider'
import ReportActionButtons from './ReportActionButtons'

export default function AdminFeedClient() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchReports() {
      if (!user?.isAdmin) return
      try {
        const getReportsFn = httpsCallable<any, any>(functions, 'admin_get_reports')
        const result = await getReportsFn()
        setReports(result.data.reports || [])
      } catch (err) {
        console.error('Failed to fetch reports:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (user?.isAdmin) {
      fetchReports()
    }
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="container" style={{ paddingBottom: '4rem', textAlign: 'center' }}>
        <p className="text-secondary">Loading...</p>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <h1 className="page-title">Admin Reports Feed</h1>
      <p className="text-secondary" style={{ marginBottom: '2rem' }}>
        Review reported accountability periods and proposals.
      </p>

      {reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="text-secondary">No pending reports.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div style={{ marginBottom: '1rem' }}>
                <span className="meta-tag" style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}>
                  {report.type.toUpperCase()} REPORT
                </span>
                <span className="text-muted" style={{ fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                  {new Date(report.createdAt).toLocaleString()}
                </span>
              </div>
              <div style={{ marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
                <div><strong>Candidate:</strong> {report.candidateName} (ID: {report.candidateId})</div>
                {report.periodName && report.periodName !== 'Unknown' && (
                  <div><strong>Accountability Period:</strong> {report.periodName}</div>
                )}
                {report.type === 'proposal' && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Reported Proposal:</div>
                    <div style={{ fontSize: '1rem' }}>"{report.proposalValue}"</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {report.upvoteCount} upvotes
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '0.5rem' }}><strong>Reporter UID:</strong> {report.reporterUid}</div>
              </div>
              
              <ReportActionButtons report={report} onResolved={() => setReports(r => r.filter(x => x.id !== report.id))} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
