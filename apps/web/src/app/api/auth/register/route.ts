import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/auth/register — Forward registration to Render Backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/auth/register`, body);
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Registration proxy error:', err.response?.data || err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.response?.data?.error || 'Authentication server unreachable' 
    }, { status: 502 });
  }
}
