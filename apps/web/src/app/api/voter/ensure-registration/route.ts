import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';

const ACTUAL_BACKEND = getBackendUrl();

/**
 * POST /api/voter/ensure-registration — Verify and automatically enroll voter in registry.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetUrl = `${ACTUAL_BACKEND}/voter/ensure-registration`;
    
    console.log('REGISTRATION_PROXY: Forwarding to', targetUrl);
    const res = await axios.post(targetUrl, body, { timeout: 10000 });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Registration proxy error:', err.message);
    const errorMsg = err.response?.data?.error || 'Identity Registry Busy. Please try again.';
    const status = err.response?.status || 502;
    
    return NextResponse.json({ success: false, error: errorMsg }, { status });
  }
}
