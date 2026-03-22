'use client';

import Link from 'next/link';
import { useState } from 'react';

// Mock data for UI demonstration
const MOCK_CANDIDATES = [
  { id: '1', name: 'Arvind Sharma', party: 'Independent', constituency: 'South Delhi', criminalCases: 0, assets: 15000000, liabilities: 2000000 },
  { id: '2', name: 'Priya Verma', party: 'Socialist Party', constituency: 'South Delhi', criminalCases: 2, assets: 45000000, liabilities: 5000000 },
  { id: '3', name: 'Rahul Gupta', party: 'National Party', constituency: 'West Delhi', criminalCases: 1, assets: 82000000, liabilities: 12000000 },
  { id: '4', name: 'Sneha Reddy', party: 'Regional Front', constituency: 'East Delhi', criminalCases: 0, assets: 28000000, liabilities: 1500000 },
];

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState('All');

  const parties = ['All', 'Independent', 'Socialist Party', 'National Party', 'Regional Front'];

  const filteredCandidates = MOCK_CANDIDATES.filter(c => 
    (searchTerm === '' || c.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedParty === 'All' || c.party === selectedParty)
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight leading-tight">Electoral Candidates</h1>
        <p className="text-sm md:text-lg text-gray-400 font-medium leading-relaxed">Transparency is the foundation of democracy. Browse and verify the records of those who wish to lead.</p>
      </header>

      {/* Filters & Search */}
      <div className="glass-card p-4 md:p-6 mb-8 md:mb-12 border-white/5 flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search candidates by name..."
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
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-secondary/50 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {party}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredCandidates.map((candidate) => (
          <Link 
            key={candidate.id} 
            href={`/candidates/${candidate.id}`}
            className="group glass-card overflow-hidden hover:bg-secondary/80 transition-all duration-300 sm:hover:-translate-y-2 border-white/5 hover:border-primary/20 flex flex-col"
          >
            <div className="p-6 md:p-8 flex-grow">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl md:text-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {candidate.name.charAt(0)}
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary text-gray-400 border border-white/5">
                  {candidate.party}
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-black mb-1 group-hover:text-primary transition-colors leading-tight uppercase tracking-tight">{candidate.name}</h2>
              <p className="text-gray-500 text-xs md:text-sm font-bold mb-6 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {candidate.constituency}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Net Worth</div>
                  <div className="text-base md:text-lg font-bold text-gray-200">₹{(candidate.assets / 10000000).toFixed(1)}Cr</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Criminal Cases</div>
                  <div className={`text-base md:text-lg font-bold ${candidate.criminalCases > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {candidate.criminalCases}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 py-3 px-6 md:px-8 text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all">
              View Full Audit →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
