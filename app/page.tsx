import Link from 'next/link'
import SearchBar from './components/SearchBar'
import { getTopEditors, getAllCandidates, getUpcomingElections } from '@/lib/data'
import { POSITION_LABELS } from '@/lib/types'

export default async function HomePage() {
  // ... (keeping the existing fetch logic)
  let topEditors: Awaited<ReturnType<typeof getTopEditors>> = []
  let recentCandidates: Awaited<ReturnType<typeof getAllCandidates>> = []
  let upcomingElections: Awaited<ReturnType<typeof getUpcomingElections>> = []

  try {
    topEditors = await getTopEditors(10)
  } catch { /* DB may not be initialized yet */ }

  try {
    recentCandidates = await getAllCandidates(12)
  } catch { /* DB may not be initialized yet */ }

  try {
    upcomingElections = await getUpcomingElections(10)
  } catch { /* DB may not be initialized yet */ }

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <h1>The Integrity Wiki</h1>
        <p>
          A crowdsourced campaign finance integrity index for every politician in America.
          Track PAC money, stock trades, corruption pledges, and more — verified by the community.
        </p>
        <div className="hero-search">
          <SearchBar />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link href="/create" className="btn btn-primary btn-lg">
            + Create Candidate Page
          </Link>
          <Link href="/how-it-works" className="btn btn-secondary btn-lg">
            How It Works
          </Link>
        </div>
      </section>

      <div className="container">
        {/* Upcoming Races */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Upcoming Races
          </h2>
          {upcomingElections.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No upcoming races found. Use the search bar to find candidates for future elections.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {upcomingElections.map((election) => (
                <div key={election.id} className="card election-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-secondary)' }}>
                        {election.date} • {election.type}
                      </div>
                      <h3 style={{ fontSize: '1.125rem', margin: '0.25rem 0' }}>
                        {POSITION_LABELS[election.position] || election.position}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {election.level === 'federal' ? 'Federal' : `${election.state} ${election.district || ''}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Stats */}
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-value">{recentCandidates.length}</div>
            <div className="stat-label">Candidates Tracked</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{topEditors.length}</div>
            <div className="stat-label">Active Editors</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">21</div>
            <div className="stat-label">Positions Covered</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">8</div>
            <div className="stat-label">Integrity Badges</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', marginTop: '2rem' }}>
          {/* Recent Candidates */}
          <section>
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Candidates
            </h2>
            {recentCandidates.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="text-secondary" style={{ marginBottom: '1rem' }}>
                  No candidates yet. Be the first to add one!
                </p>
                <Link href="/create" className="btn btn-primary">Create Candidate Page</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {recentCandidates.map((c) => (
                  <Link key={c.id} href={`/candidate/${c.id}/${c.latestPeriodId || ''}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, var(--accent-primary), #7c3aed)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 800, color: 'white', flexShrink: 0,
                      }}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          {c.status?.replace('_', ' ') || 'Unknown status'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Leaderboard Sidebar */}
          <aside>
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Top Editors
            </h2>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {topEditors.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No editors yet. Sign in to start contributing!
                </div>
              ) : (
                topEditors.map((editor, i) => (
                  <div key={editor.uid} className="leaderboard-item">
                    <span className={`leaderboard-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                      #{i + 1}
                    </span>
                    {editor.photoURL ? (
                      <img src={editor.photoURL} alt="" className="leaderboard-avatar" />
                    ) : (
                      <div className="leaderboard-avatar" style={{
                        background: 'var(--bg-secondary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                      }}>
                        {editor.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    <span className="leaderboard-name">{editor.displayName}</span>
                    <span className="leaderboard-points">{editor.credibilityPoints} pts</span>
                  </div>
                ))
              )}
              {topEditors.length > 0 && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)' }}>
                  <Link href="/leaderboard" style={{ color: 'var(--accent-secondary)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    View full leaderboard →
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Contribution Section */}
        <section className="contribution-banner">
          <h2>Help us map political integrity</h2>
          <p>
            The Integrity Wiki is an open-source project. You can help us by contributing data, 
            verifying citations, or helping with the codebase on GitHub.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href="https://github.com/KaiSereni/political_integrity_wiki" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              Contribute on GitHub
            </a>
            <Link href="https://github.com/KaiSereni/political_integrity_wiki/blob/main/README.md" className="btn btn-secondary">
              Learn More
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
