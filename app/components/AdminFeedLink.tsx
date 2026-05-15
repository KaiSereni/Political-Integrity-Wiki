'use client'

import Link from 'next/link'
import { useAuth } from './AuthProvider'

export default function AdminFeedLink() {
  const { user, loading } = useAuth()

  if (loading || !user?.isAdmin) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
      <Link href="/admin/feed" className="btn btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'var(--danger-muted)' }}>
        View Admin Feed
      </Link>
    </div>
  )
}
