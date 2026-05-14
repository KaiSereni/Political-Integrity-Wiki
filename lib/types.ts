/**
 * Political Integrity Wiki — Type Definitions
 * Core data models used across the application.
 */

// ─── Position Types ──────────────────────────────────────────────────────────

export type PositionLevel = 'federal' | 'state' | 'local'

export type Position =
  | 'president'
  | 'vice_president'
  | 'cabinet'
  | 'senator'
  | 'representative'
  | 'governor'
  | 'lieutenant_governor'
  | 'attorney_general'
  | 'secretary_of_state'
  | 'treasurer'
  | 'state_auditor'
  | 'state_senator'
  | 'state_representative'
  | 'state_supreme_court_justice'
  | 'appellate_court_judge'
  | 'trial_court_judge'
  | 'mayor'
  | 'city_council_member'
  | 'county_executive'
  | 'sheriff'
  | 'district_attorney'

export const POSITION_LABELS: Record<Position, string> = {
  president: 'President',
  vice_president: 'Vice President',
  cabinet: 'Cabinet Member',
  senator: 'U.S. Senator',
  representative: 'U.S. Representative',
  governor: 'Governor',
  lieutenant_governor: 'Lieutenant Governor',
  attorney_general: 'Attorney General',
  secretary_of_state: 'Secretary of State',
  treasurer: 'Treasurer',
  state_auditor: 'State Auditor',
  state_senator: 'State Senator',
  state_representative: 'State Representative',
  state_supreme_court_justice: 'State Supreme Court Justice',
  appellate_court_judge: 'Appellate Court Judge',
  trial_court_judge: 'Trial Court Judge',
  mayor: 'Mayor',
  city_council_member: 'City Council Member',
  county_executive: 'County Executive',
  sheriff: 'Sheriff',
  district_attorney: 'District Attorney',
}

export const POSITION_LEVELS: Record<Position, PositionLevel> = {
  president: 'federal',
  vice_president: 'federal',
  cabinet: 'federal',
  senator: 'federal',
  representative: 'federal',
  governor: 'state',
  lieutenant_governor: 'state',
  attorney_general: 'state',
  secretary_of_state: 'state',
  treasurer: 'state',
  state_auditor: 'state',
  state_senator: 'state',
  state_representative: 'state',
  state_supreme_court_justice: 'state',
  appellate_court_judge: 'state',
  trial_court_judge: 'state',
  mayor: 'local',
  city_council_member: 'local',
  county_executive: 'local',
  sheriff: 'local',
  district_attorney: 'local',
}

/** Positions that are considered "national" (President, VP, Cabinet) */
export const NATIONAL_POSITIONS: Position[] = ['president', 'vice_president', 'cabinet']

/** Positions that are legislative */
export const LEGISLATOR_POSITIONS: Position[] = [
  'senator', 'representative', 'state_senator', 'state_representative',
]

/** Positions that are executive */
export const EXECUTIVE_POSITIONS: Position[] = [
  'president', 'vice_president', 'governor', 'lieutenant_governor',
  'attorney_general', 'secretary_of_state', 'treasurer', 'state_auditor',
  'mayor', 'county_executive',
]

/** Judicial positions */
export const JUDICIAL_POSITIONS: Position[] = [
  'state_supreme_court_justice', 'appellate_court_judge', 'trial_court_judge',
]

/** Partisan positions (all except judicial) */
export const PARTISAN_POSITIONS: Position[] = Object.keys(POSITION_LABELS).filter(
  (p) => !JUDICIAL_POSITIONS.includes(p as Position)
) as Position[]

// ─── Badge Types ─────────────────────────────────────────────────────────────

export type BadgeStatus = 'unknown' | 'pledged' | 'denied' | 'unkept'

export interface Badge {
  id: string
  name: string
  description: string
  status: BadgeStatus
  /** Which position types this badge applies to */
  applicablePositions: Position[]
}

export const BADGE_DEFINITIONS: Omit<Badge, 'status'>[] = [
  {
    id: 'no_corporate_pac',
    name: 'No Corporate PAC Money',
    description: 'The candidate has pledged to not accept money from corporate PACs. Corporate PACs are political action committees funded by corporations, as opposed to those funded by individuals or trade associations.',
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
  },
  {
    id: 'stock_trading_ban',
    name: 'Supports Congressional Stock Trading Ban',
    description: 'The candidate supports legislation to ban members of Congress and senior executive officials from trading individual stocks while in office, closing a major conflict of interest.',
    applicablePositions: [...LEGISLATOR_POSITIONS, ...EXECUTIVE_POSITIONS],
  },
  {
    id: 'revolving_door',
    name: 'Supports Closing the Revolving Door',
    description: 'The candidate supports closing the "revolving door" between government and lobbying, including extending cooling-off periods before former officials can lobby their former colleagues.',
    applicablePositions: [...LEGISLATOR_POSITIONS, ...EXECUTIVE_POSITIONS],
  },
  {
    id: 'citizens_united',
    name: 'Supports Overturning Citizens United',
    description: 'The candidate supports a constitutional amendment or legislation to overturn the Supreme Court\'s Citizens United v. FEC (2010) decision, which allowed unlimited corporate and union spending on elections.',
    applicablePositions: [
      'senator', 'representative', 'state_senator', 'state_representative',
    ],
  },
  {
    id: 'no_dark_money',
    name: 'Disavows Dark Money & Discloses Bundlers',
    description: 'The candidate disavows 527 groups (tax-exempt political organizations), publicly discloses all "bundlers" (individuals who collect and forward donations from multiple donors), and requests no dark money influence from outside groups.',
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
  },
  {
    id: 'blind_trust',
    name: 'Pledges Blind Trust / Asset Divestiture',
    description: 'The candidate pledges to either sell all personal financial assets or place them in an independently managed qualified blind trust upon taking office, eliminating financial conflicts of interest.',
    applicablePositions: [
      'president', 'vice_president', 'cabinet',
      'senator', 'representative',
    ],
  },
  {
    id: 'leadership_pac',
    name: 'Leadership PAC for Campaigning Only',
    description: 'The candidate pledges to use their leadership PAC funds exclusively for legitimate campaign and political activities, not for personal expenditures such as travel, dining, or entertainment.',
    applicablePositions: [
      'president', 'vice_president', 'cabinet',
      'senator', 'representative',
    ],
  },
  {
    id: 'small_donor_matching',
    name: 'Supports Small Donor Matching',
    description: 'The candidate supports a system of public financing that matches small-dollar donations (typically under $200) at a multiple (e.g., 6:1), empowering everyday voters and reducing reliance on large donors.',
    applicablePositions: [...LEGISLATOR_POSITIONS, ...EXECUTIVE_POSITIONS],
  },
]

// ─── Candidate Model ─────────────────────────────────────────────────────────

export interface Candidate {
  id: string
  name: string
  nameNormalized?: string
  photoUrl?: string
  fecIds?: string[]
  status?: 'running' | 'in_office' | 'out_of_office' | 'unknown'
  nextElectionDate?: string
  contactInfo?: {
    phone?: string
    email?: string
    website?: string
    office?: string
  }
  industries?: IndustryRecord[]
  badges: Record<string, BadgeStatus>
  accountabilityPeriods?: AccountabilityPeriod[]
  locations?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface IndustryRecord {
  industry: string
  years?: string
  actions?: string[]
}

// ─── Accountability Period ───────────────────────────────────────────────────

export interface AccountabilityPeriod {
  id: string
  candidateId: string
  yearStart: number
  yearEnd: number
  position: Position
  result?: 'won' | 'lost' | 'active' | 'withdrew' | 'unknown'
  party?: string
  region?: string
  state?: string

  // Financial data (can be auto-filled from FEC for federal candidates)
  totalRaised?: number
  peakNetAssets?: number
  peakStockValue?: number
  totalPacMoney?: number
  corporatePacMoney?: number
  earmarkedMoney?: number
  aipacMoney?: number
  stockTradingVolume?: number

  // Donation breakdowns
  donationSizeBreakdown?: DonationSizeBreakdown
  donationLocationBreakdown?: DonationLocationBreakdown
  pacTypeBreakdown?: PacTypeBreakdown
  topPacDonors?: PacDonor[]

  /** Whether FEC data has been fetched for this period */
  fecDataFetched?: boolean
}

export interface DonationSizeBreakdown {
  under200: number
  from200to499: number
  from500to999: number
  from1000to1999: number
  from2000plus: number
}

export interface DonationLocationBreakdown {
  inState: number
  outOfState: number
}

export interface PacTypeBreakdown {
  corporate: number
  political: number
  trade: number
  lobbyist: number
  ideological: number
  other: number
}

export interface PacDonor {
  name: string
  amount: number
  type: string
}

// ─── Proposal & Voting ──────────────────────────────────────────────────────

export interface FieldDefinition {
  id: string
  name: string
  description: string
  /** Whether the field value changes per accountability period */
  periodSpecific: boolean
  /** Which positions this field applies to */
  applicablePositions: Position[]
  /** Whether this field can be auto-filled from FEC data */
  fecAutoFill: boolean
}

export interface Proposal {
  id: string
  candidateId: string
  periodId: string
  fieldId: string
  value: string
  citations: Citation[]
  authorUid: string
  authorDisplayName: string
  createdAt: string
  upvoteCount: number
  pinned: boolean
  pinnedAt?: string
  deletionRequested: boolean
}

export interface Citation {
  url: string
  explanation?: string
}

export interface Vote {
  voterId: string // the user id of the voter
  votedAt: string
  proposalSwitchedFrom?: string
}

// ─── User Model ──────────────────────────────────────────────────────────────

export interface User {
  uid: string
  displayName: string
  photoURL: string
  email: string
  credibilityPoints: number
  isAdmin: boolean
  isBanned: boolean
  banExpiry?: string
  bannedIps?: string[]
  createdAt: string
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export type AuditAction =
  | 'pin_proposal'
  | 'unpin_proposal'
  | 'ban_user_temp'
  | 'ban_user_perm'
  | 'unban_user'
  | 'award_points'
  | 'remove_points'
  | 'delete_proposal'

export interface AuditLog {
  id: string
  adminUid: string
  adminDisplayName: string
  action: AuditAction
  targetUid?: string
  targetDisplayName?: string
  targetProposalId?: string
  candidateName?: string
  fieldName?: string
  points?: number
  reason: string
  timestamp: string
}

// ─── Election ────────────────────────────────────────────────────────────────

export interface Election {
  id: string
  date: string
  position: Position
  level: PositionLevel
  state?: string
  district?: string
  type: 'primary' | 'general' | 'runoff' | 'special'
  candidateIds: string[]
}

// ─── Field Definitions ──────────────────────────────────────────────────────

export const EDITABLE_FIELDS: FieldDefinition[] = [
  // Period-agnostic fields
  {
    id: 'photo',
    name: 'Photo',
    description: 'A photo of the candidate',
    periodSpecific: false,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'contact_info',
    name: 'Contact Information',
    description: 'Contact information for the candidate (applies to non-national, non-judicial positions)',
    periodSpecific: false,
    applicablePositions: [
      'governor', 'lieutenant_governor', 'attorney_general', 'secretary_of_state',
      'treasurer', 'state_auditor', 'state_senator', 'state_representative',
      'mayor', 'city_council_member', 'county_executive', 'sheriff', 'district_attorney',
    ],
    fecAutoFill: false,
  },
  {
    id: 'industries',
    name: 'Private Sector Industries',
    description: 'Industries the politician has worked in, with details on actions that may have been influenced by past employment',
    periodSpecific: false,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'status',
    name: 'Current Status',
    description: 'Whether the candidate is currently running for office, in office, or out of office',
    periodSpecific: false,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'next_election_date',
    name: 'Next Election Date',
    description: 'The date of the next election in which the candidate could be voted into or out of office',
    periodSpecific: false,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  // Badges (period-agnostic)
  ...BADGE_DEFINITIONS.map((b) => ({
    id: `badge_${b.id}`,
    name: `Badge: ${b.name}`,
    description: b.description,
    periodSpecific: false,
    applicablePositions: b.applicablePositions,
    fecAutoFill: false,
  })),
  // Period-specific fields
  {
    id: 'region',
    name: 'Region',
    description: 'The region the candidate ran to represent',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS).filter(
      (p) => !NATIONAL_POSITIONS.includes(p as Position)
    ) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'total_raised',
    name: 'Total Amount Raised',
    description: 'The total campaign funds raised for this race',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'peak_net_assets',
    name: 'Peak Net Assets',
    description: 'The highest net assets the candidate held during this accountability period',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'peak_stock_value',
    name: 'Peak Stock Value',
    description: 'The highest total value of stocks held by the candidate during the accountability period (green if $0)',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'party',
    name: 'Party',
    description: 'The party the candidate is affiliated with for this race',
    periodSpecific: true,
    applicablePositions: PARTISAN_POSITIONS,
    fecAutoFill: true,
  },
  {
    id: 'total_pac_money',
    name: 'Total PAC Money',
    description: 'Total amount received from all PACs (corporate, labor, trade, ideological, etc.) for this race. Auto-filled from FEC data.',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'corporate_pac_money',
    name: 'Corporate PAC Money',
    description: 'Total amount received specifically from corporate PACs. The FEC API does not distinguish corporate PACs natively, so this value must be researched and contributed by the community. Green if $0.',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: false,
  },
  {
    id: 'donation_size_breakdown',
    name: 'Donation Size Breakdown',
    description: 'Breakdown of donations by size category (under $200, $200-$499, etc.)',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'donation_location_breakdown',
    name: 'Donation Location Breakdown',
    description: 'Breakdown of donations from in-state vs. out-of-state contributors',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'earmarked_money',
    name: 'Earmarked Donations',
    description: 'Total amount of earmarked donation money received',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'pac_type_breakdown',
    name: 'PAC Type Breakdown',
    description: 'Breakdown of PAC donations by type (corporate, political, trade, lobbyist, etc.)',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'top_pac_donors',
    name: 'Top PAC Donors',
    description: 'The individual PACs that donated the most to this campaign',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
  {
    id: 'stock_trading_volume',
    name: 'Stock Trading Volume',
    description: 'Total volume of stocks traded while in office (green if $0). Applies to politicians who have held federal or national positions.',
    periodSpecific: true,
    applicablePositions: [
      'president', 'vice_president', 'cabinet', 'senator', 'representative',
    ],
    fecAutoFill: false,
  },
  {
    id: 'aipac_money',
    name: 'AIPAC Contributions',
    description: 'Total amount of money contributed by AIPAC (American Israel Public Affairs Committee) via earmarks or direct donations',
    periodSpecific: true,
    applicablePositions: Object.keys(POSITION_LABELS) as Position[],
    fecAutoFill: true,
  },
]
