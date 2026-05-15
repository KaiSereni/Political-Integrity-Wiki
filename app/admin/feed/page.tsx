import type { Metadata } from 'next'
import AdminFeedClient from './AdminFeedClient'

export const metadata: Metadata = {
  title: 'Admin Feed — Reports',
}

export default function AdminFeedPage() {
  return <AdminFeedClient />
}
