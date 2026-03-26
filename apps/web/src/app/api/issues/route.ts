import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl, ADMIN_API_KEY } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');
    const constituencyId = searchParams.get('constituencyId');

    const res = await axios.get(`${ACTUAL_BACKEND}/api/issues`, {
      params: { electionId, constituencyId },
      timeout: 45000
    });

    // Senior Fix: Standardize response shape
    const result = res.data;
    const list = result.issues || result.data || result.list || [];

    return NextResponse.json({ 
      success: true, 
      count: list.length, 
      issues: list 
    });
  } catch (err: any) {
    console.error('Issues fetch failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await axios.post(`${ACTUAL_BACKEND}/api/issues`, body, {
       headers: { 'x-admin-key': ADMIN_API_KEY },
       timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('Issue creation failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
