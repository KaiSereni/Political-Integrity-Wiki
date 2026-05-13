import Link from 'next/link'
import { searchCandidates } from '@/lib/data'
import SearchBar from '@/app/components/SearchBar'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ''
  const results = await searchCandidates(query)

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Search Results</h1>
        <div style={{ marginBottom: '2rem' }}>
          <SearchBar defaultValue={query} />
        </div>

        {query && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Showing results for "{query}"
          </p>
        )}

        {!query ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Enter a name, state, or region to search for candidates.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>No candidates found matching "{query}".</p>
            <Link href="/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add a New Candidate
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {results.map((c) => (
              <Link
                key={c.id}
                href={`/candidate/${c.id}/${c.latestPeriodId || ''}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 800, color: 'white', flexShrink: 0,
                }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {c.status?.replace('_', ' ') || 'Unknown status'}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="btn btn-secondary btn-sm">View Profile</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
