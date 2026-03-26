import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/verify/risk
 * Proxy to Render Backend for geo-fencing and device integrity.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await axios.post(`${BACKEND_URL}/risk/evaluate`, body, {
      headers: {
        'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024'
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Risk evaluation proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Security check failed' }, { status: 502 });
  }
}
