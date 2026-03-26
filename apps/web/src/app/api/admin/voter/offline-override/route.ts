import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/admin/voter/offline-override
 * Logic: Manually flags a citizen as having voted offline at a physical booth.
 * This revokes their online SOL token and prevents double-voting.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/api/admin/voter/offline-override`, body, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
