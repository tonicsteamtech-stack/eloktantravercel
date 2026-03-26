import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');

    const res = await axios.get(`${ACTUAL_BACKEND}/api/promises`, {
      params: { candidateId },
      timeout: 45000
    });

    const result = res.data;
    const list = result.promises || result.data || result.list || [];

    return NextResponse.json({ 
      success: true, 
      count: list.length, 
      promises: list 
    });
  } catch (err: any) {
    console.error('Promises fetch failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
