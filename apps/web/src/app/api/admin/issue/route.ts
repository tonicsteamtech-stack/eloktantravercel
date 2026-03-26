import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

export async function GET(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const res = await axios.get(`${BACKEND_URL}/api/admin/issue`, {
      params: Object.fromEntries(searchParams),
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/api/admin/issue`, body, {
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest) {
  const deny = requireAdmin(request);
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const res = await axios.delete(`${BACKEND_URL}/api/admin/issue/${id}`, {
      headers: { 'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
