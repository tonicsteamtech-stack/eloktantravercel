import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Proxy the request to the real backend
    const res = await axios.get(`${ACTUAL_BACKEND}/api/elections/${id}`, {
      timeout: 30000
    });

    const data = res.data;
    const election = data.election || data.data || data;

    if (!election) {
      return NextResponse.json({ success: false, error: 'Election data not found' }, { status: 404 });
    }

    // Standardize the response shape for the frontend
    // Ensure candidates are included and IDs are mapped
    return NextResponse.json({
      success: true,
      election: {
        ...election,
        id: election.id || election._id || id,
        title: election.title || election.name || 'Untitled Election',
        candidates: (election.candidates || []).map((c: any) => ({
          ...c,
          id: c.id || c._id,
          name: c.name,
          party: c.party || c.party_name || 'Independent',
          constituency: c.constituency || 'General'
        }))
      }
    });

  } catch (err: any) {
    console.error(`Election [${params.id}] fetch failed:`, err.message);
    
    // Check if it's a 404 from backend or a connection error
    const status = err.response?.status || 502;
    return NextResponse.json(
      { success: false, error: err.message || 'Backend unreachable' },
      { status }
    );
  }
}
