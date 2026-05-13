import { BASE_URL } from '@/lib/constants';

export async function GET() {
  const content = `# Political Integrity Wiki

A crowdsourced campaign finance integrity index for US politicians.

## Key Links
- Home: ${BASE_URL}/
- How it Works: ${BASE_URL}/how-it-works
- Leaderboard: ${BASE_URL}/leaderboard

## Data Structure
The site is organized by candidates and their specific accountability periods (usually election cycles).

### Candidates
Each candidate has a profile page that aggregates their integrity badges and financial data.
URL: /candidate/{candidateId}/{periodId}

### Integrity Badges
Community-verified pledges or statuses:
- Pledged: Candidate has made a specific integrity pledge.
- Denied: Candidate has explicitly denied a pledge.
- Unkept: Candidate has broken a previous pledge.
- Unknown: No community-verified status yet.

### Financial Data
Tracked per accountability period:
- Total Raised
- Total PAC Money
- Corporate PAC Money
- Peak Stock Value
- Stock Trading Volume
- Earmarked & AIPAC Money

## Contributing
Users can propose data values and vote on existing proposals. Credibility points are earned through verified contributions.
Code: https://github.com/KaiSereni/political_integrity_wiki
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
