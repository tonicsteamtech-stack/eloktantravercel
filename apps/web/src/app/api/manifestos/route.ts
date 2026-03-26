import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getBackendUrl, ADMIN_API_KEY } from '@/lib/api/config';

// Critical: Set max duration for Render/Vercel to survive cold starts
export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// Simple in-memory cache to prevent "flooding" Render with identical requests
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

const ACTUAL_BACKEND = getBackendUrl();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get('candidateId');
  const electionId = searchParams.get('electionId');
  const constituencyId = searchParams.get('constituencyId');
  
  // High-safety: At least one filter must be present to prevent accidental "fetch-all"
  if (!candidateId && !electionId && !constituencyId) {
    return NextResponse.json({ success: false, error: 'Valid filter required' }, { status: 400 });
  }

  // Check Cache (scoped to the full query string)
  const cacheKey = searchParams.toString();
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return NextResponse.json(cached.data);
  }

  try {
    const params: any = {};
    // Redundant keys for cross-version backend compatibility
    if (candidateId) { 
        params.candidateId = candidateId; 
        params.candidate_id = candidateId; 
    }
    if (electionId) { 
        params.electionId = electionId; 
        params.election_id = electionId; 
    }
    if (constituencyId) { 
        params.constituencyId = constituencyId; 
        params.constituency_id = constituencyId; 
    }

    const response = await axios.get(`${ACTUAL_BACKEND}/api/admin/manifesto`, {
      params,
      headers: { 'x-admin-key': ADMIN_API_KEY },
      timeout: 30000, 
    });

    const data = response.data;
    const list = Array.isArray(data) ? data : (data.manifestos || data.data || data.list || []);
    
    // Senior Developer Mapping: Poly-path resolution for candidate names/parties
    const mapped = list.map((m: any) => {
        const candidateObj = m.candidate || m.candidateId || {};
        const partyObj = candidateObj.party_rel || candidateObj.party || {};
        
        return {
            ...m,
            // Standardize ID
            id: m.id || m._id?.toString(),
            _id: m._id?.toString() || m.id,
            
            // Standardize Candidate Info
            candidateId: candidateObj.id || m.candidateId || m.candidate_id,
            candidateName: candidateObj.name || m.candidate_name || 'Official Manifesto',
            candidatePhoto: candidateObj.photo_url || m.candidate_photo || null,
            
            // Standardize Party Info
            partyName: partyObj.name || m.party_name || 'Independent',
            
            // Preserve other fields
            title: m.title || 'Digital Platform',
            content: m.content || 'Content pending verification...',
            priorities: m.priorities || []
        };
    });

    const result = { 
        success: true, 
        count: mapped.length, 
        manifestos: mapped 
    };

    // Update Cache
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Manifesto proxy failure:', err.message);
    return NextResponse.json({ 
        success: false, 
        error: 'Manifesto source of truth unreachable', 
        detail: err.message 
    }, { status: 504 });
  }
}
