import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * GET /api/admin/vote
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const res = await axios.get(`${BACKEND_URL}/api/admin/vote?${searchParams.toString()}`, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
