'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';

interface Candidate {
  id: string;
  name: string;
  party: string;
  constituency: string;
  criminalCases: number;
  netWorth: number;
}

export default function CandidatesPage() {
  const params = useParams();
  const electionId = (params.id as string) || '';

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'netWorth' | 'criminalCases'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  const parties = ['All', 'AAP', 'BJP', 'INC', 'BSP', 'IND', 'NCP'];

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        
        // Build query string
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (selectedParty !== 'All') queryParams.append('party', selectedParty);
        queryParams.append('limit', '1000'); // Fetch enough to sort locally
        
        const response = await fetch(`${baseUrl}/candidates/${electionId}?${queryParams.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setCandidates(result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to fetch candidates');
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Connection to backend failed. Make sure the server is running on :5001');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedParty, electionId]);

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        const compare = valA.localeCompare(valB);
        return sortOrder === 'asc' ? compare : -compare;
      }
      
      if (typeof valA === 'number' && typeof valB === 'number') {
         return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      
      return 0;
    });
  }, [candidates, sortBy, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center space-x-2 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-500">
        <Link href="/elections" className="hover:text-primary transition-colors">Elections</Link>
        <span>/</span>
        <span className="text-white">{electionId.replace('-', ' ')}</span>
      </div>

      <header className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
        <div className="flex justify-center mb-6">
          <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Real-time Election Data
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-4 orange-text-gradient uppercase tracking-tight leading-tight">Electoral Candidates</h1>
        <p className="text-sm md:text-lg text-gray-400 font-medium leading-relaxed">
          Directly scraped from official records. Transparency and accountability for {electionId}.
        </p>
      </header>

      {/* Filters, Search & Sort */}
      <div className="glass-card p-4 md:p-6 mb-8 md:mb-12 border-white/5 flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:items-center justify-between">
            <div className="relative flex-1">
            <input
                type="text"
                placeholder="Search candidates by name or constituency..."
                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-12 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm md:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {parties.map(party => (
                <button
                key={party}
                onClick={() => setSelectedParty(party)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-[10px] md:text-sm transition-all whitespace-nowrap uppercase tracking-widest ${
                    selectedParty === party 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 border-primary' 
                    : 'bg-secondary/50 text-gray-400 hover:text-white border border-white/5'
                }`}
                >
                {party}
                </button>
            ))}
            </div>
        </div>

        <div className="flex items-center space-x-4 border-t border-white/10 pt-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sort by:</span>
            <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-secondary/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
                <option value="name">Name</option>
                <option value="netWorth">Net Worth</option>
                <option value="criminalCases">Criminal Cases</option>
            </select>
            
            <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="bg-secondary/50 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary flex items-center"
            >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing with Voter Records...</p>
        </div>
      ) : error ? (
        <div className="p-12 glass-card text-center border-red-500/20">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-white font-black text-xl mb-2">SYSTEM ERROR</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-red-500/20 text-red-500 rounded-xl font-bold uppercase text-xs hover:bg-red-500 hover:text-white transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : sortedCandidates.length === 0 ? (
        <div className="p-12 glass-card text-center border-white/5">
             <h3 className="text-white font-black text-xl mb-2">NO CANDIDATES FOUND</h3>
             <p className="text-gray-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
            <span>Showing {sortedCandidates.length} potential leaders</span>
            <span>Verified Status: ✅ SECURE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sortedCandidates.map((candidate) => (
              <div 
                key={candidate.id} 
                className="group glass-card overflow-hidden transition-all duration-300 sm:hover:-translate-y-2 border-white/5 hover:border-primary/20 flex flex-col"
              >
                <div className="p-6 md:p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl md:text-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {candidate.name.charAt(0)}
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-gray-400 border border-white/5 group-hover:border-primary/30 transition-all">
                      {candidate.party}
                    </span>
                  </div>
                  
                  <h2 className="text-xl md:text-2xl font-black mb-1 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{candidate.name}</h2>
                  <p className="text-gray-500 text-xs md:text-sm font-bold mb-6 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {candidate.constituency}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Declared Assets</div>
                      <div className="text-base md:text-lg font-bold text-gray-200">
                        ₹{(candidate.netWorth / 10000000).toFixed(2)}Cr
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Criminal Cases</div>
                      <div className={`text-base md:text-lg font-bold ${candidate.criminalCases > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {candidate.criminalCases}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/candidates/${candidate.id}`}
                  className="bg-primary/5 py-4 px-6 md:px-8 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all border-t border-white/5 hover:border-transparent"
                >
                  Examine Audit Record →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
