import Link from 'next/link'
import { POSITION_LABELS, type Position, type PacDonor } from '@/lib/types'
import AddPeriodAction from './AddPeriodAction'
import ReportPeriodAction from './ReportPeriodAction'

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
  pacTypeBreakdown?: { corporate: number; political: number; trade: number; lobbyist: number; ideological: number; other: number }
  topPacDonors?: PacDonor[]
  reportDismissed?: boolean
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
          <label className="label" style={{ marginBottom: 0 }}>Accountability Period</label>
          <AddPeriodAction candidateId={candidateId} />
        </div>
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
        <div className="card stat-card">
          <div className="stat-value">{formatCurrency(selected.peakNetAssets)}</div>
          <div className="stat-label">Peak Net Assets</div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--accent-primary)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Small Donor Strength</div>
          <div style={{ fontWeight: 700, marginTop: '0.25rem', fontSize: '1.25rem' }}>
            {sizeTotal > 0 ? `${((selected.donationSizeBreakdown?.under200 || 0) / sizeTotal * 100).toFixed(1)}%` : 'Unknown'}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Donations under $200</div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Local Support Index</div>
          <div style={{ fontWeight: 700, marginTop: '0.25rem', fontSize: '1.25rem' }}>
            {locTotal > 0 ? `${((selected.donationLocationBreakdown?.inState || 0) / locTotal * 100).toFixed(1)}%` : 'Unknown'}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>In-state vs. Out-of-state</div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: `4px solid ${selected.corporatePacMoney === 0 ? 'var(--success)' : 'var(--danger)'}` }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Corporate PAC Index</div>
          <div style={{ fontWeight: 700, marginTop: '0.25rem', fontSize: '1.25rem', color: selected.corporatePacMoney === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {selected.totalRaised && selected.totalRaised > 0 
              ? `${((selected.corporatePacMoney || 0) / selected.totalRaised * 100).toFixed(1)}%` 
              : '0.0%'}
          </div>
          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Share of total raised</div>
        </div>

        {['president', 'vice_president', 'cabinet', 'senator', 'representative'].includes(selected.position) && (
          <div className="card" style={{ padding: '1rem', borderLeft: `4px solid ${selected.stockTradingVolume === 0 ? 'var(--success)' : 'var(--warning)'}` }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Volume</div>
            <div style={{ fontWeight: 700, marginTop: '0.25rem', fontSize: '1.25rem', color: selected.stockTradingVolume === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
              {formatCurrency(selected.stockTradingVolume)}
            </div>
            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Traded while in office</div>
          </div>
        )}
      </div>

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

        {/* PAC Type Breakdown */}
        {selected.pacTypeBreakdown && (
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.9375rem' }}>PAC Type Breakdown</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <DonationBar label="Corporate" amount={selected.pacTypeBreakdown.corporate} total={selected.totalPacMoney || 1} color="#6366f1" />
              <DonationBar label="Political/Party" amount={selected.pacTypeBreakdown.political} total={selected.totalPacMoney || 1} color="#10b981" />
              <DonationBar label="Trade Association" amount={selected.pacTypeBreakdown.trade} total={selected.totalPacMoney || 1} color="#f59e0b" />
              <DonationBar label="Lobbyist" amount={selected.pacTypeBreakdown.lobbyist} total={selected.totalPacMoney || 1} color="#ef4444" />
              <DonationBar label="Ideological" amount={selected.pacTypeBreakdown.ideological} total={selected.totalPacMoney || 1} color="#8b5cf6" />
              <DonationBar label="Other" amount={selected.pacTypeBreakdown.other} total={selected.totalPacMoney || 1} color="#6b7280" />
            </div>
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

      {!selected.reportDismissed && (
        <div style={{ textAlign: 'right' }}>
          <ReportPeriodAction candidateId={candidateId} periodId={selected.id} />
        </div>
      )}
    </div>
  )
}
