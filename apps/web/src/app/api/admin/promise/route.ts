import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/admin/promise
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${BACKEND_URL}/api/admin/promise`, body, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

/**
 * DELETE /api/admin/promise
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const res = await axios.delete(`${BACKEND_URL}/api/admin/promise?${searchParams.toString()}`, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

/**
 * GET /api/admin/promise
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const res = await axios.get(`${BACKEND_URL}/api/admin/promise?${searchParams.toString()}`, {
      headers: { 'x-admin-key': 'eLoktantra-AdminPortal-SecretKey-2024' }
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
