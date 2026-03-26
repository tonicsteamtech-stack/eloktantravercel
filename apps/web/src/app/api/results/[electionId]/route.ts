import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * GET /api/results/[electionId]
 * Proxy to Render Backend for real-time tally.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  try {
    const { electionId } = params;
    const res = await axios.get(`${BACKEND_URL}/api/results/${electionId}`, {
        timeout: 90000 // 90s timeout (Extreme for Render cold-starts)
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Results proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Results retrieval failed' }, { status: 502 });
  }
}
