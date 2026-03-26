import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

/**
 * GET /api/election/active
 * Used by the Dashboard to show the current election context.
 */
export async function GET() {
  try {
    const res = await axios.get(`${ACTUAL_BACKEND}/api/elections/active`, {
        timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Active election fetch failed:', err.message);
    return NextResponse.json({ 
        success: false, 
        error: err.response?.data?.error || err.message || 'No active election found' 
    }, { status: 502 });
  }
}
