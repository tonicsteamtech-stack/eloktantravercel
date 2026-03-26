import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest, { params }: { params: { electionId: string } }) {
  try {
    const { electionId } = params;
    const res = await axios.get(`${ACTUAL_BACKEND}/api/results/${electionId}`, {
        timeout: 45000
    });
    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error(`Results fetch failed for ${params.electionId}:`, err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
