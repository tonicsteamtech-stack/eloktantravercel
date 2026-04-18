import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl, ADMIN_API_KEY } from '@/lib/api/config';

export const dynamic = 'force-dynamic';

const BACKEND_URL = getBackendUrl();

/**
 * GET /api/candidates
 * Proxies to the production backend to fetch all candidates.
 * This is the same source of truth as the Admin Portal (localhost:3001).
 * Optionally accepts ?electionId= to filter by election.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    // Build query string for backend
    const query = electionId ? `?electionId=${electionId}` : '';
    
    const res = await axios.get(`${BACKEND_URL}/api/candidates${query}`, {
      headers: {
        'x-admin-secret': ADMIN_API_KEY,
        'Authorization': `Bearer ${ADMIN_API_KEY}`,
      },
      timeout: 30000,
    });

    const rawData = res.data;

    // Normalize to a flat array regardless of backend response shape
    const candidates = Array.isArray(rawData)
      ? rawData
      : (rawData.candidates || rawData.data || []);

    // Standardize candidate field format for the frontend
    const normalized = candidates.map((c: any) => ({
      id: c.id || c._id,
      name: c.name,
      party: c.party || c.party_name || 'Independent',
      constituency: c.constituency || 'General',
      electionId: c.electionId || c.election_id,
      election: c.election, // Keep raw election name for fuzzy matching
    }));

    return NextResponse.json(normalized);
  } catch (err: any) {
    console.error('[/api/candidates] Fetch failed:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch candidates', details: err.message },
      { status: err.response?.status || 502 }
    );
  }
}
