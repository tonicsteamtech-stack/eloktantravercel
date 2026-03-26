import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * GET /api/user — Fetch citizen profile from backend source of truth.
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized Session' }, { status: 401 });
    }

    const res = await axios.get(`${BACKEND_URL}/auth/me`, {
      headers: {
        Authorization: request.headers.get('Authorization')
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('User profile proxy error:', err.message);
    return NextResponse.json({ success: false, error: err.response?.data?.error || 'Profile retrieval failed' }, { status: 502 });
  }
}
