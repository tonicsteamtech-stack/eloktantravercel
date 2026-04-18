import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/vote — Cast a vote.
 * Proxies to Render Backend which records the vote in MongoDB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[Vote Proxy] Forwarding vote to backend:', {
      candidateId: body.candidateId,
      electionId: body.electionId,
      constituencyId: body.constituencyId
    });

    // Forward to the Render backend's /vote endpoint
    const res = await axios.post(`${BACKEND_URL}/vote`, body, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('[Vote Proxy] Backend response:', res.data);
    return NextResponse.json(res.data);
  } catch (err: any) {
    const errorMsg = err.response?.data?.error || err.message || 'Vote submission failed';
    console.error('[Vote Proxy] Error:', errorMsg);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: err.response?.status || 502 }
    );
  }
}
