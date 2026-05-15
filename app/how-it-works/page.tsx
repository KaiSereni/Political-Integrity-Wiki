import type { Metadata } from 'next'
import { BADGE_DEFINITIONS } from '@/lib/types'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how The Integrity Wiki works — the contribution system, credibility points, badges, and proposal voting.',
}

export default function HowItWorksPage() {
  return (
    <div className="container animate-fade-in" style={{ maxWidth: 800 }}>
      <h1 style={{ marginBottom: '1.5rem' }}>How The Integrity Wiki Works</h1>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🎯 Mission</h2>
        <p className="text-secondary">
          The Integrity Wiki is a crowdsourced political campaign finance integrity index. We track politicians&apos;
          financial interests, PAC money, stock trades, and corruption pledges across all levels of government — from
          President down to local city council members.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>📝 Contributing Data</h2>
        <p className="text-secondary" style={{ marginBottom: '0.75rem' }}>
          Every data field on a candidate&apos;s page is editable through our proposal system. Here&apos;s how it works:
        </p>
        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li><strong>Sign up with Google</strong> to create an account and start earning credibility points.</li>
          <li><strong>New accounts start with 100 credibility points.</strong></li>
          <li><strong>Submit a proposal</strong> for any field by providing a value and citations (URLs with optional explanations). This costs <strong>10 credibility points</strong>.</li>
          <li><strong>Upvote proposals</strong> you believe are accurate. You can upvote <strong>one proposal per field</strong>.</li>
          <li>The <strong>top-voted proposal</strong> becomes the displayed value, but only if accounts with at least a combined <strong>500 credibility points</strong> have upvoted it. Otherwise, the field shows &quot;Unknown.&quot;</li>
          <li><strong>Admins can &quot;pin&quot;</strong> a proposal to lock it as verified, awarding 200 points to the poster and 150 to upvoters.</li>
        </ol>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>⭐ Credibility Points</h2>
        <p className="text-secondary" style={{ marginBottom: '0.75rem' }}>
          Credibility points measure your trustworthiness as a contributor. Here&apos;s how they work:
        </p>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li><strong>Starting balance:</strong> 100 points on account creation</li>
          <li><strong>Daily earnings:</strong> If your proposal or a proposal you upvoted is the top proposal, you earn X points per day (starting 3 days after you voted)</li>
          <li><strong>Formula:</strong> <code style={{ background: 'var(--bg-secondary)', padding: '0.125rem 0.375rem', borderRadius: 4, fontSize: '0.8125rem' }}>X = round(max(0, 5 - (k/10) + p))</code> where <em>k</em> = upvote count when you voted and <em>p</em> = 5 if you&apos;re the original poster, else 0</li>
          <li><strong>Early upvotes are worth more.</strong> The fewer upvotes a proposal had when you voted, the more daily points you earn.</li>
          <li><strong>Switching your upvote</strong> resets the 3-day timer.</li>
          <li><strong>Pinned proposals:</strong> The poster gets 200 points and upvoters get 150 points (minus already earned).</li>
          <li><strong>Creating candidate pages:</strong> State/local candidates cost 1,000 points. Adding positions also costs 1,000 points.</li>
        </ul>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🏅 Integrity Badges</h2>
        <p className="text-secondary" style={{ marginBottom: '0.75rem' }}>
          Each candidate can earn (or lose) integrity badges based on their pledges and actions:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {BADGE_DEFINITIONS.map((badge) => (
            <div key={badge.id} style={{ padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{badge.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{badge.description}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Badge Statuses:</h4>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
            <li><span className="badge badge-unknown">Unknown</span> — No data on whether the candidate has pledged</li>
            <li><span className="badge badge-pledged">Pledged</span> — Candidate has pledged and taken no contradicting actions</li>
            <li><span className="badge badge-denied">Denied</span> — Candidate has explicitly refused or already contradicted the pledge</li>
            <li><span className="badge badge-unkept">Unkept</span> — Candidate made a pledge and broke it. <strong>This turns ALL other badges grey</strong> because the candidate can&apos;t be trusted to keep promises.</li>
          </ul>
        </div>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>🏛️ Accountability Periods</h2>
        <p className="text-secondary">
          An accountability period covers all the months during which a candidate is fundraising for, running for, and
          (if they win) holding office. This includes both primary and general elections. Each candidate page lets you
          select a specific accountability period to view campaign finance data relevant to that race.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>⚖️ Moderation & Transparency</h2>
        <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <li>All admin actions are logged in a <strong>public audit log</strong> for full transparency.</li>
          <li>Admins can pin proposals, ban users (temporarily or permanently), and award or remove credibility points.</li>
          <li>Banned users cannot submit proposals or vote. Bans apply to both account and IP. Bans automatically expire at the end of their period if temporary, or never if permanent.</li>
          <li>Duplicate proposals can result in temporary bans — always upvote the oldest matching proposal.</li>
          <li>Users cannot delete their own proposals, but can request deletion from an admin.</li>
          <li><strong>Reporting Accountability Periods:</strong> You can report a period as nonexistent (never happened) for 200 points. The period is temporarily hidden pending admin review. If accurate, the period is deleted and you are awarded 400 points. Otherwise, the period is restored.</li>
          <li><strong>Reporting Proposals:</strong> You can report a proposal for inappropriate or malicious material for 5 points. If an admin confirms the report, the proposal is deleted, you get 15 points back, and the offending user may be banned.</li>
        </ul>
      </section>
    </div>
  )
}
