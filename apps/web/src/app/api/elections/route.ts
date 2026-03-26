import { NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ACTUAL_BACKEND = getBackendUrl();

export async function GET() {
  try {
    const res = await axios.get(`${ACTUAL_BACKEND}/api/elections`, {
        timeout: 45000
    });
    
    // Senior Fix: Standardize response shape for the frontend
    const result = res.data;
    const elections = result.elections || result.data || result.list || [];
    
    return NextResponse.json({ 
      success: true, 
      count: elections.length, 
      elections: elections.map((e: any) => ({
        ...e,
        _id: e.id || e._id, // Support both ID formats
        title: e.title || e.name || 'Untitled Election' // Support both title/name formats
      }))
    });
  } catch (err: any) {
    console.error('Elections fetch failed:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 502 });
  }
}
