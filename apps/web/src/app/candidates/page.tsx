'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, User, Search, Info } from 'lucide-react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        // Direct fetch from Render - bypassing the flaky Next.js proxy
        const baseUrl = 'https://backend-elokantra.onrender.com';
        const response = await fetch(`${baseUrl}/api/candidates`);
        const result = await response.json();
        
        // Match the exact data structure verified via curl: {"data": [...]}
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
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-orange-500/30">
      <div className="container mx-auto px-6 py-24 max-w-7xl">
        {/* Header Section */}
        <header className="mb-20 text-center space-y-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/5 backdrop-blur-xl mb-4">
            <ShieldCheck className="w-4 h-4 text-orange-500 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Verified Citizen Directory</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            Verified <br />
            <span className="text-orange-500">Candidates</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
            Browse all officially registered candidates for the current election cycle.
          </p>
        </header>

        {/* Candidates Grid */}
        <div className="flex justify-center">
          {candidates.length === 0 ? (
            <div className="text-center py-20 border border-white/5 bg-white/2 rounded-[3rem] w-full max-w-2xl">
              <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No candidates found in the registry.</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-4 bg-[#0d1117] border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-orange-500/50 transition-all"
              >
                Force Registry Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full">
              {candidates.map((candidate, idx) => (
                <CandidateCard key={candidate.id || candidate._id || idx} c={candidate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ c }: { c: any }) {
    const candidateId = c.id || c._id?.toString() || "";
    return (
        <div className="group relative bg-[#0d1117] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-orange-500/30 transition-all duration-500 flex flex-col hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)]">
            <div className="p-8 pb-4 flex-grow">
                <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center font-black text-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 border border-orange-500/10 shadow-inner">
                    {c.name?.charAt(0) || <User className="w-6 h-6" />}
                </div>
                <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 group-hover:border-orange-500/20 group-hover:bg-orange-500/10 transition-all">
                    <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-orange-500 tracking-widest">{c.party || "IND"}</span>
                </div>
                </div>

                <h3 className="text-2xl font-black mb-1 group-hover:text-orange-500 transition-colors uppercase tracking-tight leading-none">{c.name || "Untitled"}</h3>
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                   ID: {candidateId.slice(-12).toUpperCase()}
                </p>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-gray-500 uppercase tracking-widest">Election</span>
                        <span className="font-black text-white uppercase">{c.electionName || c.election || "National"}</span>
                    </div>
                </div>
            </div>

            <div className="p-2">
                <Link 
                    href={`/candidates/${candidateId}`}
                    className="w-full bg-white/5 py-4 flex items-center justify-center space-x-2 rounded-[1.5rem] border border-white/10 group-hover:bg-orange-500 transition-all duration-500"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-white">Profile Detail</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform group-hover:text-white" />
                </Link>
            </div>
        </div>
    );
}
