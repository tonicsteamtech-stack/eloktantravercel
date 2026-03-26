import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/vote — Cast a verified, blockchain-backed vote.
 * Proxy to Render Backend (Source of Truth)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const res = await axios.post(`${BACKEND_URL}/voter/verify-token`, body, {
      headers: {
        'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024'
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Verify token proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Verification failed' }, { status: 502 });
  }
}
