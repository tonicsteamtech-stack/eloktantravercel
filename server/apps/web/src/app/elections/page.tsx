'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useElections } from '@/lib/api/voting';

export default function ElectionsPage() {
  const router = useRouter();
  const { data: elections, isLoading } = useElections();

  useEffect(() => {
    // Restrict direct access to elections until verified
    // We check for 'voting_token' which is set in /vote step 4
    const hasToken = localStorage.getItem('voting_token') || sessionStorage.getItem('voting_token');
    if (!hasToken) {
      router.push('/vote');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Secure Elections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Active Elections</h1>
          <p className="text-slate-600 font-medium text-lg">Participate in secure, anonymous, and blockchain-verified voting. Your vote is your power.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {elections?.map((election) => (
            <div key={election.id} className="glass-card overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-primary/20 flex flex-col">
              <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    election.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    election.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                    'bg-gray-500/10 text-gray-500 border-gray-500/20'
                  }`}>
                    {election.status}
                  </span>
                </div>
                
                <h2 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">{election.title}</h2>
                <div className="space-y-2 text-sm font-bold">
                  <p className="text-slate-500 uppercase tracking-widest text-[10px]">Constituency</p>
                  <p className="text-slate-800">{election.constituency}</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/5 space-y-2">
                  <p className="text-slate-500 uppercase tracking-widest text-[10px]">Ends On</p>
                  <p className="text-slate-800 text-sm">
                    {new Date(election.end_time).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {election.status === 'ACTIVE' ? (
                <div className="flex flex-col">
                  <Link 
                    href={`/vote/${election.id}`}
                    className="w-full py-4 bg-primary hover:bg-accent text-white text-center font-black uppercase tracking-widest transition-all"
                  >
                    Cast Your Vote →
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem(`voter_session_${election.id}`);
                      window.location.href = `/vote/${election.id}`;
                    }}
                    className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 font-black text-[10px] uppercase tracking-widest border-t border-white/5 transition-all"
                  >
                    Developer: Test Vote (No Limits)
                  </button>
                </div>
              ) : (
                <div className="w-full py-4 bg-secondary/50 text-gray-600 text-center font-black uppercase tracking-widest text-xs">
                  {election.status === 'UPCOMING' ? 'Voting Opens Soon' : 'Election Closed'}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/vote/verify" className="text-primary font-black uppercase tracking-widest hover:underline flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 2.944a11.955 11.955 0 01-8.618 3.04m8.618-3.04V7m0 14a11.955 11.955 0 01-8.618-3.04M12 21a11.955 11.955 0 018.618-3.04m-8.618 3.04V14" />
            </svg>
            <span>Verify your past vote hash</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
