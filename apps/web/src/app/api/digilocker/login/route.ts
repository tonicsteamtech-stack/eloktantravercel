import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/digilocker/login
 * Proxy to Render Backend (Source of Truth for Citizen Sessions)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/auth/digilocker-login`, body);
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('DigiLocker Login proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Authentication failed' }, { status: 502 });
  }
}
