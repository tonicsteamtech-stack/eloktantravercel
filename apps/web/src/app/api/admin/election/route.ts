import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAdmin } from '@/lib/adminAuth';
import { getBackendUrl, ADMIN_API_KEY } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Survive cold starts

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const res = await axios.get(`${ACTUAL_BACKEND}/api/admin/election`, {
      headers: { 'x-admin-key': ADMIN_API_KEY },
      timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Election list fetch failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const body = await request.json();
    const res = await axios.post(`${ACTUAL_BACKEND}/api/admin/election/create`, body, {
      headers: { 'x-admin-key': ADMIN_API_KEY },
      timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Election creation failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const res = await axios.delete(`${ACTUAL_BACKEND}/api/admin/election/${id}`, {
      headers: { 'x-admin-key': ADMIN_API_KEY },
      timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Election deletion failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
