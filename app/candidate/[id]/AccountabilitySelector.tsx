import Link from 'next/link'
import { POSITION_LABELS, type Position, type PacDonor } from '@/lib/types'

interface PeriodOption {
  id: string
  label: string
  yearEnd: number
  position: Position
  result?: string
  party?: string
  region?: string
  totalRaised?: number
  totalPacMoney?: number
  corporatePacMoney?: number
  peakNetAssets?: number
  peakStockValue?: number
  stockTradingVolume?: number
  earmarkedMoney?: number
  aipacMoney?: number
  donationSizeBreakdown?: { under200: number; from200to499: number; from500to999: number; from1000to1999: number; from2000plus: number }
  donationLocationBreakdown?: { inState: number; outOfState: number }
  topPacDonors?: PacDonor[]
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return 'Unknown'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function DonationBar({ label, amount, total, color }: { label: string; amount: number; total: number; color: string }) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{formatCurrency(amount)} ({pct.toFixed(1)}%)</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  )
}

export default function AccountabilitySelector({
  candidateId,
  periods,
  selectedPeriodId,
}: {
  candidateId: string
  periods: PeriodOption[]
  selectedPeriodId: string
}) {
  const selected = periods.find((p) => p.id === selectedPeriodId) || periods[0] || null

  if (!selected) return null

  const sizeTotal = selected.donationSizeBreakdown
    ? Object.values(selected.donationSizeBreakdown).reduce((a, b) => a + b, 0)
    : 0

  const locTotal = selected.donationLocationBreakdown
    ? selected.donationLocationBreakdown.inState + selected.donationLocationBreakdown.outOfState
    : 0

  return (
    <div>
      {/* Period Selector — Now uses Links for SSR */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="label">Accountability Period</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {periods.map((p) => (
            <Link
              key={p.id}
              href={`/candidate/${candidateId}/${p.id}`}
              className={`btn btn-sm ${p.id === selectedPeriodId ? 'btn-primary' : 'btn-secondary'}`}
              style={{ textDecoration: 'none' }}
            >
              {p.yearEnd} • {POSITION_LABELS[p.position] || p.position}
            </Link>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-value">{formatCurrency(selected.totalRaised)}</div>
          <div className="stat-label">Total Raised</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{formatCurrency(selected.totalPacMoney)}</div>
          <div className="stat-label">Total PAC Money</div>
        </div>
        <div className="card stat-card">
          <div className={`stat-value ${selected.corporatePacMoney === 0 ? 'green' : ''}`}>
            {formatCurrency(selected.corporatePacMoney)}
          </div>
          <div className="stat-label">
            Corporate PAC Money
            {selected.corporatePacMoney === undefined && (
              <span style={{ display: 'block', fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.125rem' }}>
                Community-contributed
              </span>
            )}
          </div>
        </div>
        <div className="card stat-card">
          <div className={`stat-value ${selected.peakStockValue === 0 ? 'green' : ''}`}>
            {formatCurrency(selected.peakStockValue)}
          </div>
          <div className="stat-label">Peak Stock Value</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {!['state_supreme_court_justice', 'appellate_court_judge', 'trial_court_judge'].includes(selected.position) && (
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Party</div>
            <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selected.party || 'Unknown'}</div>
          </div>
        )}
        {!['president', 'vice_president', 'cabinet'].includes(selected.position) && (
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Region</div>
            <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selected.region || 'Unknown'}</div>
          </div>
        )}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Earmarked Money</div>
          <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{formatCurrency(selected.earmarkedMoney)}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AIPAC Money</div>
          <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{formatCurrency(selected.aipacMoney)}</div>
        </div>
        {['president', 'vice_president', 'cabinet', 'senator', 'representative'].includes(selected.position) && (
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Trading Volume</div>
            <div style={{ fontWeight: 700, marginTop: '0.25rem', color: selected.stockTradingVolume === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
              {formatCurrency(selected.stockTradingVolume)}
            </div>
          </div>
        )}
      </div>

      {/* Donation Breakdown Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Size Breakdown */}
        {selected.donationSizeBreakdown && sizeTotal > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>Donation Size Breakdown</h4>
            <DonationBar label="Under $200" amount={selected.donationSizeBreakdown.under200} total={sizeTotal} color="#6366f1" />
            <DonationBar label="$200–$499" amount={selected.donationSizeBreakdown.from200to499} total={sizeTotal} color="#818cf8" />
            <DonationBar label="$500–$999" amount={selected.donationSizeBreakdown.from500to999} total={sizeTotal} color="#a5b4fc" />
            <DonationBar label="$1,000–$1,999" amount={selected.donationSizeBreakdown.from1000to1999} total={sizeTotal} color="#f59e0b" />
            <DonationBar label="$2,000+" amount={selected.donationSizeBreakdown.from2000plus} total={sizeTotal} color="#ef4444" />
          </div>
        )}

        {/* Location Breakdown */}
        {selected.donationLocationBreakdown && locTotal > 0 && (
          <div className="card">
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>Donation Location Breakdown</h4>
            <DonationBar label="In-State" amount={selected.donationLocationBreakdown.inState} total={locTotal} color="#10b981" />
            <DonationBar label="Out-of-State" amount={selected.donationLocationBreakdown.outOfState} total={locTotal} color="#f59e0b" />
          </div>
        )}
      </div>

      {/* Top PAC Donors */}
      {selected.topPacDonors && selected.topPacDonors.length > 0 && (
        <div className="card">
          <h4 style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>Top PAC Donors</h4>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PAC Name</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selected.topPacDonors.map((donor, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{donor.name}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{donor.type}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(donor.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
