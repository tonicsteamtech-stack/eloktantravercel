/**
 * Centralized API Configuration
 * Prevents recursive loopbacks and ensures direct-to-backend routing for proxies.
 */

export const getBackendUrl = () => {
  // Priority 1: Dedicated backend variable
  // Priority 2: Generic API URL
  // Priority 3: Hardcoded Render fallback
  const url = process.env.NEXT_PUBLIC_BACKEND_API_URL || 
              process.env.NEXT_PUBLIC_API_URL || 
              'https://backend-elokantra.onrender.com';
  
  // Safety Check: If the URL points to the local frontend (loopback), 
  // we MUST force it to the Render backend to prevent infinite recursion/EMFILE.
  if (url.includes('localhost:3000')) {
    console.warn('API CONFIG: Local loopback detected. Forcing Render backend for proxy stability.');
    return 'https://backend-elokantra.onrender.com';
  }
  
  return url;
};

export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
