import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-elokantra.onrender.com';

/**
 * POST /api/digilocker/upload — Forward to Render Backend
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // axios handles FormData correctly in newer versions or with polyfills
    const res = await axios.post(`${BACKEND_URL}/voter/upload-card`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-admin-key': process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024'
      }
    });

    return NextResponse.json(res.data);
  } catch (err: any) {
    console.error('DigiLocker upload proxy error:', err.response?.data || err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.response?.data?.error || 'Source of truth offline' 
    }, { status: 502 });
  }
}
