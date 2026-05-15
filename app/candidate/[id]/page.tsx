import { notFound, redirect } from 'next/navigation'
import { getCandidate, getAccountabilityPeriods } from '@/lib/data'
import AddPeriodAction from './AddPeriodAction'

export default async function CandidatePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const candidate = await getCandidate(id)
  if (!candidate) notFound()

  const periods = await getAccountabilityPeriods(id)
  const visiblePeriods = periods.filter(p => !p.isHidden)
  if (visiblePeriods.length > 0) {
    redirect(`/candidate/${id}/${visiblePeriods[0].id}`)
  }

  return (
    <div className="container animate-fade-in">
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1 className="candidate-name">{candidate.name}</h1>
        <p className="text-secondary">No accountability periods have been added for this candidate yet.</p>
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <AddPeriodAction candidateId={id} />
        </div>
      </div>
    </div>
  )
}
