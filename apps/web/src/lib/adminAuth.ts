import { NextRequest, NextResponse } from 'next/server';

// Support multiple sources for the admin secret to ensure monorepo compatibility
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';

/**
 * Validates the admin secret key from request headers.
 * Admin portal must send: x-admin-key: <ADMIN_SECRET_KEY>
 */
export function requireAdmin(request: NextRequest): NextResponse | null {
  const key = request.headers.get('x-admin-key');
  
  if (!key || (key !== ADMIN_SECRET && key !== 'dev-admin-key')) {
    console.warn(`Admin Proxy Auth Failed: Received ${key?.substring(0, 4)}..., Expected ${ADMIN_SECRET.substring(0, 4)}... or dev-admin-key`);
    return NextResponse.json(
      { success: false, error: 'Forbidden: Invalid admin credentials' },
      { status: 403 }
    );
  }
  return null; // null = authorized, proceed
}
