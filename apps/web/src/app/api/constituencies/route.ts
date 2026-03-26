import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const electionId = searchParams.get('electionId');

    let res = await axios.get(`${ACTUAL_BACKEND}/api/constituencies`, {
      params: { electionId },
      timeout: 30000
    });

    // Senior Fallback: If filtered list is empty, try fetching all 
    // (survives incoherent data where electionId is missing in Constituency objects)
    let list = res.data.constituencies || res.data.data || res.data.list || [];
    
    if (list.length === 0 && electionId) {
        console.warn('Proxy: No constituencies found for electionId. Falling back to global list.');
        const fallbackRes = await axios.get(`${ACTUAL_BACKEND}/api/constituencies`, { timeout: 30000 });
        list = fallbackRes.data.constituencies || fallbackRes.data.data || fallbackRes.data.list || [];
    }

    return NextResponse.json({ 
      success: true, 
      count: list.length, 
      constituencies: list.map((c: any) => ({
        ...c,
        _id: c.id || c._id, // Support both ID formats
        name: c.name || 'Unnamed Region'
      }))
    });
  } catch (err: any) {
    console.error('Constituencies fetch failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
