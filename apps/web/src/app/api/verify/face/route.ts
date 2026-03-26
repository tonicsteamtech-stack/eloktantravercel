import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/verify/face
 * Proxy to Render Backend for biometric alignment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await axios.post(`${BACKEND_URL}/verify-face`, body, {
      headers: {
        'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024'
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Face verification proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Biometric scan failed' }, { status: 502 });
  }
}
