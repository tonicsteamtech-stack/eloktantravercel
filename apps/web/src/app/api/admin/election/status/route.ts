import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/admin/election/status
 * Proxy to Render Backend for toggling election lifecycle.
 */
export async function POST(request: NextRequest) {
  try {
    const { id, isActive } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    const res = await axios.patch(`${BACKEND_URL}/elections/${id}/status`, { status: isActive ? 'Active' : 'Upcoming' }, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
