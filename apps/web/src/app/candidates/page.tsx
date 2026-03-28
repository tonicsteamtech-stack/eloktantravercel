'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, User, Info } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const baseUrl = 'https://backend-elokantra.onrender.com';
        const response = await fetch(`${baseUrl}/api/candidates`);
        const result = await response.json();
        const list = result.data || result.candidates || (Array.isArray(result) ? result : []);
        setCandidates(list);
      } catch (error) {
        console.error('Candidate Sync Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f2f4f7' }}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: '#003087', borderTopColor: 'transparent' }} />
          <p className="text-sm text-gray-500" style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}>Loading Candidate Directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f2f4f7', fontFamily: 'Noto Sans, Arial, sans-serif' }}>

      {/* Page Header Banner */}
      <div style={{ background: '#003087', borderBottom: '4px solid #FF9933' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 rounded" style={{ background: '#FF9933' }} />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
              Candidate Directory
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-4">
            प्रत्याशी निर्देशिका • Officially registered candidates with verified disclosures
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto max-w-7xl text-xs text-gray-500">
          <span>Home</span> <span className="mx-2">›</span> <span className="text-gray-800 font-medium">Candidates</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* Info bar */}
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: '#138808' }} />
          <span className="text-sm text-gray-600">
            All candidates have undergone identity verification. Asset declarations and criminal records are publicly disclosed.
          </span>
        </div>

        {candidates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-12 text-center" style={{ borderTop: '3px solid #003087' }}>
            <Info className="w-10 h-10 mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-gray-600 mb-1">No candidates found in the registry.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gov-primary mt-4"
            >
              Refresh Registry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {candidates.map((candidate, idx) => (
              <CandidateCard key={candidate.id || candidate._id || idx} c={candidate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateCard({ c }: { c: any }) {
  const candidateId = c.id || c._id?.toString() || '';
  return (
    <div className="gov-card flex flex-col">
      <div className="p-5 flex-grow">
        {/* Top row */}
        <div className="flex justify-between items-start mb-4">
          <div
            className="w-12 h-12 rounded flex items-center justify-center font-bold text-lg"
            style={{ background: 'rgba(0,48,135,0.08)', color: '#003087' }}
          >
            {c.name?.charAt(0) || <User className="w-5 h-5" />}
          </div>
          <span className="gov-badge" style={{ background: 'rgba(255,153,51,0.1)', color: '#8B3A00', border: '1px solid rgba(255,153,51,0.3)', fontSize: '0.7rem' }}>
            {c.party || 'IND'}
          </span>
        </div>

        <h3 className="text-base font-bold text-gray-800 mb-0.5" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
          {c.name || 'Untitled'}
        </h3>
        <p className="text-xs text-gray-400 mb-4 pb-3 border-b border-gray-100">
          ID: {candidateId.slice(-12).toUpperCase()}
        </p>

        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium uppercase tracking-wide">Election</span>
          <span className="font-semibold text-gray-700 text-right max-w-[60%]">{c.electionName || c.election || 'National'}</span>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100">
        <Link
          href={`/candidates/${candidateId}`}
          className="btn-gov-primary w-full justify-center text-xs"
        >
          Profile Detail
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
