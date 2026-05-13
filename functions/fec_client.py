"""
FEC API Client — Handles all interactions with the Federal Election Commission API.
Provides methods for fetching candidate data, committee information, financial totals,
donation breakdowns, and spending data.
"""

import os
# Prevent macOS Objective-C fork crash by disabling proxy lookups
os.environ["no_proxy"] = "*"
os.environ["NO_PROXY"] = "*"
os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"

import time
import math
from typing import Optional
import requests


class FECClient:
    """Client for the FEC OpenAPI at api.open.fec.gov."""

    BASE_URL = "https://api.open.fec.gov/v1"
    RATE_LIMIT_DELAY = 0.5  # seconds between requests to respect rate limits

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("FEC_API_KEY", "DEMO_KEY")
        self._last_request_time = 0.0

    def _throttle(self):
        """Enforce rate limiting between API requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.RATE_LIMIT_DELAY:
            time.sleep(self.RATE_LIMIT_DELAY - elapsed)
        self._last_request_time = time.time()

    def _get(self, endpoint: str, params: Optional[dict] = None) -> dict:
        """Make a GET request to the FEC API."""
        self._throttle()
        if params is None:
            params = {}
        params["api_key"] = self.api_key
        params.setdefault("per_page", 100)

        url = f"{self.BASE_URL}{endpoint}"
        response = requests.get(url, params=params, timeout=600)
        response.raise_for_status()
        return response.json()

    def _get_all_pages(self, endpoint: str, params: Optional[dict] = None, max_pages: int = 10) -> list:
        """Fetch all pages of results from a paginated FEC API endpoint."""
        if params is None:
            params = {}
        all_results = []
        page = 1

        while page <= max_pages:
            params["page"] = page
            data = self._get(endpoint, params)
            results = data.get("results", [])
            if not results:
                break
            all_results.extend(results)
            pagination = data.get("pagination", {})
            total_pages = pagination.get("pages", 1)
            if page >= total_pages:
                break
            page += 1

        return all_results

    def get_candidate(self, candidate_id: str) -> Optional[dict]:
        """Fetch a single candidate by their FEC candidate ID."""
        data = self._get(f"/candidate/{candidate_id}/")
        results = data.get("results", [])
        return results[0] if results else None

    def search_candidates(self, name: str, office: Optional[str] = None) -> list:
        """Search candidates by name, optionally filtering by office."""
        params = {"q": name, "sort": "-election_years"}
        if office:
            params["office"] = office
        return self._get_all_pages("/candidates/search/", params, max_pages=3)

    def get_candidate_history(self, candidate_id: str) -> list:
        """Get the election history for a candidate across all cycles."""
        return self._get_all_pages(f"/candidate/{candidate_id}/history/")

    def get_candidate_committees(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get committees associated with a candidate."""
        params = {}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages(f"/candidate/{candidate_id}/committees/", params)

    def get_candidate_totals(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get financial totals for a candidate."""
        params = {}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages(f"/candidate/{candidate_id}/totals/", params)

    def get_committee_totals(self, committee_id: str, cycle: Optional[int] = None) -> list:
        """Get financial totals for a specific committee."""
        params = {}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages(f"/committee/{committee_id}/totals/", params)

    def get_schedule_a(self, committee_id: str, cycle: Optional[int] = None,
                        contributor_type: Optional[str] = None) -> list:
        """
        Get Schedule A (itemized receipts/donations) for a committee.
        contributor_type: 'individual', 'committee', etc.
        """
        params = {"committee_id": committee_id, "sort": "-contribution_receipt_amount"}
        if cycle:
            params["two_year_transaction_period"] = cycle
        if contributor_type:
            params["contributor_type"] = contributor_type
        return self._get_all_pages("/schedules/schedule_a/", params, max_pages=5)

    def get_schedule_a_by_size(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get receipts aggregated by contribution size for a candidate."""
        params = {"candidate_id": candidate_id}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages("/schedules/schedule_a/by_size/by_candidate/", params)

    def get_schedule_a_by_state(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get receipts aggregated by contributor state for a candidate."""
        params = {"candidate_id": candidate_id}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages("/schedules/schedule_a/by_state/by_candidate/", params)

    def get_schedule_b(self, committee_id: str, cycle: Optional[int] = None) -> list:
        """Get Schedule B (itemized disbursements/spending) for a committee."""
        params = {"committee_id": committee_id, "sort": "-disbursement_amount"}
        if cycle:
            params["two_year_transaction_period"] = cycle
        return self._get_all_pages("/schedules/schedule_b/", params, max_pages=5)

    def get_independent_expenditures(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get independent expenditures for or against a candidate."""
        params = {"candidate_id": candidate_id, "sort": "-expenditure_amount"}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages("/schedules/schedule_e/by_candidate/", params)

    def get_pac_contributions_to_candidate(self, candidate_id: str, cycle: Optional[int] = None) -> list:
        """Get PAC/party committee contributions to a candidate (Schedule A from committees)."""
        params = {"candidate_id": candidate_id, "sort": "-total"}
        if cycle:
            params["cycle"] = cycle
        return self._get_all_pages("/schedules/schedule_a/by_size/by_candidate/", params)

    def get_earmarks(self, committee_id: str, cycle: Optional[int] = None) -> list:
        """Get earmarked donations routed through a committee."""
        params = {
            "committee_id": committee_id,
            "sort": "-contribution_receipt_amount",
        }
        if cycle:
            params["two_year_transaction_period"] = cycle
        # Filter for earmarked contributions (conduit)
        return self._get_all_pages("/schedules/schedule_a/", params, max_pages=3)


class CandidateIngester:
    """
    Processes FEC API data and transforms it into our Firestore data model.
    Handles mapping FEC fields to our schema and computing derived values.
    """

    FEC_OFFICE_MAP = {
        "P": "president",
        "S": "senator",
        "H": "representative",
    }

    def __init__(self, fec_client: Optional[FECClient] = None):
        self.fec = fec_client or FECClient()

    def ingest_candidate(self, fec_id: str) -> dict:
        """
        Fetch all available data for a federal candidate from the FEC API.
        Returns a dict containing the candidate profile and their accountability periods.
        """
        candidate = self.fec.get_candidate(fec_id)
        if not candidate:
            raise ValueError(f"No candidate found with FEC ID: {fec_id}")

        # Build the candidate document
        candidate_doc = {
            "name": self._format_name(candidate.get("name", "")),
            "fecIds": [fec_id],
            "status": self._map_status(candidate.get("candidate_status", "")),
            "badges": {},
            "createdAt": self._now_iso(),
            "updatedAt": self._now_iso(),
        }

        # Get election history and build accountability periods
        history = self.fec.get_candidate_history(fec_id)
        periods = []

        for entry in history:
            cycle = entry.get("two_year_period") or entry.get("election_year")
            if not cycle:
                continue

            office = self.FEC_OFFICE_MAP.get(
                entry.get("office", ""), entry.get("office_full", "unknown")
            )
            state = entry.get("state", "")
            district = entry.get("district", "")
            party = entry.get("party_full", entry.get("party", ""))

            period = {
                "yearStart": cycle - 1 if office != "president" else cycle - 3,
                "yearEnd": cycle,
                "position": office,
                "party": party,
                "state": state,
                "region": self._build_region(office, state, district),
                "result": self._map_result(entry.get("incumbent_challenge_full", "")),
                "fecDataFetched": False,
            }

            # Fetch financial data for this cycle
            try:
                totals = self.fec.get_candidate_totals(fec_id, cycle)
                if totals:
                    t = totals[0]
                    period["totalRaised"] = t.get("receipts", 0) or 0
                    # Total PAC money (all types: corporate, labor, trade, etc.)
                    period["totalPacMoney"] = t.get("other_political_committee_contributions", 0) or 0
                    period["fecDataFetched"] = True
                    # Note: corporatePacMoney is NOT auto-filled because the FEC API
                    # does not natively distinguish corporate PACs from other PAC types.
                    # The contributor_committee_type field in Schedule A is unreliable
                    # (almost always NULL), and contributor_type='other' is invalid.
                    # This must be researched and contributed by the community.

                # Get donation size breakdown
                size_data = self.fec.get_schedule_a_by_size(fec_id, cycle)
                if size_data:
                    unitemized = t.get("individual_unitemized_contributions", 0) or 0
                    period["donationSizeBreakdown"] = self._process_size_breakdown(
                        size_data, cycle, unitemized
                    )

                # Get donation location breakdown
                state_data = self.fec.get_schedule_a_by_state(fec_id, cycle)
                if state_data:
                    period["donationLocationBreakdown"] = self._process_state_breakdown(
                        state_data, state, cycle
                    )

                # Get top PAC donors
                pac_data = self.fec.get_pac_contributions_to_candidate(fec_id, cycle)
                if pac_data:
                    period["topPacDonors"] = self._process_pac_donors(pac_data)

            except Exception as e:
                print(f"Warning: Failed to fetch financial data for {fec_id} cycle {cycle}: {e}")

            periods.append(period)

        return {
            "candidate": candidate_doc,
            "periods": periods,
        }

    def _format_name(self, raw_name: str) -> str:
        """Convert FEC-style 'LAST, FIRST MIDDLE SUFFIX' name to 'First Middle Last Suffix'."""
        if "," not in raw_name:
            return raw_name.title()
        
        parts = [p.strip() for p in raw_name.split(",")]
        last = parts[0].title()
        
        if len(parts) < 2:
            return last
            
        # Second part is usually 'FIRST MIDDLE SUFFIX' or 'FIRST MIDDLE'
        first_middle_suffix = parts[1].split()
        if not first_middle_suffix:
            return last
            
        # Very basic heuristic for suffixes
        suffixes = {"Jr", "Sr", "Ii", "Iii", "Iv", "V", "Md", "Phd"}
        
        name_parts = []
        suffix_parts = []
        
        for i, word in enumerate(first_middle_suffix):
            word_title = word.title()
            if word_title.rstrip(".") in suffixes:
                suffix_parts.append(word_title)
            else:
                name_parts.append(word_title)
        
        # If there are more parts in the original raw_name (like a 3rd comma-separated part)
        for extra in parts[2:]:
            extra_title = extra.title()
            if extra_title.rstrip(".") in suffixes:
                suffix_parts.append(extra_title)
            else:
                name_parts.append(extra_title)
                
        full_name = " ".join(name_parts + [last] + suffix_parts)
        return full_name.strip()

    def _map_status(self, fec_status: str) -> str:
        """Map FEC candidate status codes to our model."""
        status_map = {
            "C": "running",
            "F": "future",
            "N": "not_yet_candidate",
            "P": "prior",
        }
        return status_map.get(fec_status, "unknown")

    def _map_result(self, challenge: str) -> str:
        """Map FEC incumbent challenge status to a descriptive status string.
        Note: FEC API does not reliably provide 'won/lost' results in history.
        """
        if not challenge:
            return "unknown"
        challenge_lower = challenge.lower()
        if "incumbent" in challenge_lower:
            return "incumbent"
        if "challenger" in challenge_lower:
            return "challenger"
        if "open" in challenge_lower:
            return "open_seat"
        return "unknown"

    def _build_region(self, office: str, state: str, district: str) -> str:
        """Build a region string from state and district."""
        if office == "president":
            return "United States"
        if office == "senator":
            return state
        if office == "representative":
            if not district or district == "00":
                return f"{state} (At-Large)"
            return f"{state}-{district}"
        return state

    def _process_size_breakdown(self, size_data: list, cycle: int, unitemized_total: float = 0) -> dict:
        """Process FEC size breakdown data into our model."""
        breakdown = {
            "under200": unitemized_total,
            "from200to499": 0,
            "from500to999": 0,
            "from1000to1999": 0,
            "from2000plus": 0,
        }

        for entry in size_data:
            if entry.get("cycle") != cycle:
                continue
            size = entry.get("size", 0)
            total = entry.get("total", 0) or 0

            # FEC Buckets: 0=under 200, 200=200-499, 500=500-999, 1000=1000-1999, 2000=2000+
            if size == 0:
                breakdown["under200"] += total
            elif size == 200:
                breakdown["from200to499"] += total
            elif size == 500:
                breakdown["from500to999"] += total
            elif size == 1000:
                breakdown["from1000to1999"] += total
            elif size == 2000 or size == 2000.01:
                breakdown["from2000plus"] += total

        return breakdown

    def _process_state_breakdown(self, state_data: list, candidate_state: str, cycle: int) -> dict:
        """Process FEC state breakdown data into in-state/out-of-state totals."""
        in_state = 0
        out_of_state = 0

        for entry in state_data:
            if entry.get("cycle") != cycle:
                continue
            state = entry.get("state", "")
            total = entry.get("total", 0) or 0

            if state == candidate_state:
                in_state += total
            else:
                out_of_state += total

        return {"inState": in_state, "outOfState": out_of_state}

    def _process_pac_donors(self, pac_data: list) -> list:
        """Process FEC PAC contribution data into our topPacDonors model."""
        donors = []
        for entry in pac_data:
            name = entry.get("committee_name") or entry.get("name")
            if not name: continue
            
            donors.append({
                "name": name,
                "amount": entry.get("total", 0) or 0,
                "type": entry.get("committee_type_full", "PAC")
            })
        
        # Sort by amount desc and take top 10
        donors.sort(key=lambda x: x["amount"], reverse=True)
        return donors[:10]

    def _now_iso(self) -> str:
        """Get current time as ISO 8601 string."""
        from datetime import datetime, timezone
        return datetime.now(timezone.utc).isoformat()


class CredibilityCalculator:
    """
    Calculates daily credibility point awards for users based on their
    proposal activity and upvoting behavior.

    The formula: X = round(max(0, 5 - (k/10) + p))
    where:
      k = number of votes the proposal had when you upvoted it
      p = 5 if you're the original poster, else 0
    """

    @staticmethod
    def calculate_daily_points(vote_count_at_time_of_vote: int, is_original_poster: bool) -> int:
        """
        Calculate the daily credibility points a user earns for being
        associated with the current top proposal.
        """
        p = 5 if is_original_poster else 0
        k = vote_count_at_time_of_vote
        x = round(max(0, 5 - (k / 10) + p))
        return min(x, 10)  # Cap at 10 to prevent abuse

    @staticmethod
    def can_earn_points(vote_timestamp_iso: str) -> bool:
        """
        Check if 3 days have passed since the vote was cast,
        which is required before points start accruing.
        """
        from datetime import datetime, timezone, timedelta
        vote_time = datetime.fromisoformat(vote_timestamp_iso)
        return datetime.now(timezone.utc) >= vote_time + timedelta(days=3)
