import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCandidate, getAccountabilityPeriods } from '@/lib/data'

export default async function CandidatePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const candidate = await getCandidate(id)
  if (!candidate) notFound()

  const periods = await getAccountabilityPeriods(id)
  if (periods.length > 0) {
    redirect(`/candidate/${id}/${periods[0].id}`)
  }

  // If no periods exist, we could still show the candidate info or a 404.
  // The user wants the URL to be /candidate/{id}/{periodId}, so if there's no period, 
  // maybe we should just show a "No data yet" page or redirect to a default.
  // For now, let's just show the basic info without a period if possible, 
  // but the requirement says "each race ... is at url: /candidate/{id}/{periodId}".
  
  return (
    <div className="container animate-fade-in">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1 className="candidate-name">{candidate.name}</h1>
        <p className="text-secondary">No accountability periods have been added for this candidate yet.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/create" className="btn btn-primary">Add Accountability Period</Link>
        </div>
      </div>
    </div>
  )
}
