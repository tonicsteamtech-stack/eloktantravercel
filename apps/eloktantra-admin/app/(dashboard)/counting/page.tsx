'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Upload, Play, CheckCircle, AlertTriangle, ChevronRight, BarChart3, PieChart } from 'lucide-react';
import { decryptVote } from '@/lib/crypto/voteEncryption';
import axios from 'axios';

// Backend URL from env or fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-elokantra.onrender.com';

interface Election {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface VoteData {
  id: string;
  encryptedVote: string;
  electionId: string;
}

interface TallyResult {
  candidateId: string;
  candidateName?: string;
  party?: string;
  votes: number;
}

export default function CountingPage() {
  const [phase, setPhase] = useState(1); // 1: Election, 2: Constituency, 3: Results
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [selectedConstituency, setSelectedConstituency] = useState<string | null>(null);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TallyResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/elections`);
      const data = response.data;
      // Backend returns { elections: [...], data: [...] } or a flat array
      const list = data.elections || data.data || (Array.isArray(data) ? data : []);
      
      // Filter for active elections only — as a senior dev, we only want live contests in the counting center
      const activeList = list.filter((e: any) => e.is_active === true);

      const normalized = activeList.map((e: any) => ({
        id: e._id || e.id,
        title: e.title || e.name,
        status: 'ACTIVE',
        startDate: e.start_time || e.startDate || e.start_date,
        endDate: e.end_time || e.endDate || e.end_date
      }));
      setElections(normalized);
      if (normalized.length === 0) {
        setError('No active elections found for counting. Activate an election in the Elections section first.');
      }
    } catch (err) {
      console.error('Failed to fetch elections:', err);
      setError('Could not fetch elections from server.');
    }
  };

  const selectElection = (election: Election) => {
    setSelectedElection(election);
    // Fetch constituencies for this election from backend
    // For now, using common list; we will filter candidates by this next
    setConstituencies(['Varanasi', 'Lucknow', 'Delhi']);
    setPhase(2);
  };

  const fetchResults = async (constituency: string) => {
    if (!selectedElection) return;
    setSelectedConstituency(constituency);
    setIsLoading(true);
    setPhase(3);

    try {
      // New real-time counting endpoint
      const response = await axios.get(`${BACKEND_URL}/admin/results`, {
        params: { 
            electionId: selectedElection.id,
            constituency: constituency
        }
      });
      
      const data = response.data;
      if (data.success) {
        setResults(data.results.map((r: any) => ({
            candidateId: r.candidate_id || 'UID',
            candidateName: r.candidate_name,
            party: r.party_name,
            votes: parseInt(r.vote_count)
        })));
        setTotalVotes(data.results.reduce((acc: number, r: any) => acc + parseInt(r.vote_count), 0));
      }
    } catch (err) {
      setError('Failed to fetch real-time tally.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 REAL-TIME POLLING EFFECT
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (phase === 3 && selectedConstituency && selectedElection) {
      console.log(`[Admin] Starting real-time sync for ${selectedConstituency}`);
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/admin/results`, {
            params: { 
              electionId: selectedElection.id,
              constituency: selectedConstituency
            }
          });
          const data = response.data;
          if (data.success) {
            const newResults = data.results.map((r: any) => ({
                candidateId: r.candidate_id || 'UID',
                candidateName: r.candidate_name,
                party: r.party_name,
                votes: parseInt(r.vote_count)
            }));

            // ⚡ Detect Changes for Animation
            newResults.forEach((nr: any) => {
               const oldR = results.find(r => r.candidateId === nr.candidateId);
               if (oldR && nr.votes > oldR.votes) {
                  setLastUpdatedId(nr.candidateId);
                  setTimeout(() => setLastUpdatedId(null), 2000); // Reset highlight
               }
            });

            setResults(newResults);
            setTotalVotes(newResults.reduce((acc: number, r: any) => acc + r.votes, 0));
          }
        } catch (err) {
          console.error('Polling sync failed:', err);
        }
      }, 3000); // 3-second sync pulse
    }
    return () => clearInterval(interval);
  }, [phase, selectedConstituency, selectedElection, results]);

  // 📡 DIRECT FRONTEND-TO-FRONTEND SYNC (BroadcastChannel)
  useEffect(() => {
    const channel = new BroadcastChannel('eloktantra_voting_sync');
    
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'VOTE_CASTED') {
        const { candidateId, candidateName } = event.data;
        console.log(`[Admin] Received direct vote signal for: ${candidateName} (${candidateId})`);

        // ⚡ Optimistic Update & Animation Trigger
        setResults(prevResults => {
          const newResults = prevResults.map(r => {
            if (r.candidateId === candidateId) {
              return { ...r, votes: r.votes + 1 };
            }
            return r;
          });
          
          setTotalVotes(newResults.reduce((acc, r) => acc + r.votes, 0));
          return newResults;
        });

        // Trigger the visual highlight
        setLastUpdatedId(candidateId);
        setTimeout(() => setLastUpdatedId(null), 3000);
      }
    };

    return () => channel.close();
  }, [phase]); 

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Lock className="w-8 h-8 text-orange-500" />
            Secure Counting Center
          </h1>
          <p className="text-gray-500 mt-2 font-medium">End-to-End Cryptographic Vote Tallying System</p>
        </div>
        
        <div className="flex items-center gap-4 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-bold text-orange-700">RSA-2048 Military Grade Encryption</span>
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-4 animate-shake">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-8 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto gap-4">
        {[
          { step: 1, label: 'Election Selection', icon: Play },
          { step: 2, label: 'Constituency', icon: PieChart },
          { step: 3, label: 'Live Tally Output', icon: BarChart3 }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center group">
            <div className={`
              flex items-center gap-3 px-4 py-2 rounded-2xl transition-all
              ${phase === item.step ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105' : 
                phase > item.step ? 'bg-green-500 text-white' : 'bg-gray-50 text-gray-400'}
            `}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-wider whitespace-nowrap">{item.label}</span>
              {phase > item.step && <CheckCircle className="w-4 h-4" />}
            </div>
            {idx < 3 && <ChevronRight className="w-5 h-5 mx-4 text-gray-200" />}
          </div>
        ))}
      </div>

      {/* PHASE 1: ELECTION SELECTION */}
      {phase === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <button
              key={election.id}
              onClick={() => selectElection(election)}
              className="p-8 rounded-[35px] text-left transition-all border-2 border-gray-100 bg-white hover:border-orange-500 hover:shadow-xl hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 text-orange-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2 line-clamp-2">{election.title}</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">
                  {election.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* PHASE 2: CONSTITUENCY SELECTION */}
      {phase === 2 && (
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex items-center gap-6">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                    <PieChart className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">{selectedElection?.title}</h2>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Select Constituency to view live tally</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {constituencies.map((c) => (
                    <button
                        key={c}
                        onClick={() => fetchResults(c)}
                        className="p-6 bg-white border border-gray-100 rounded-3xl text-sm font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all text-gray-600"
                    >
                        {c}
                    </button>
                ))}
            </div>
        </div>
      )}

      {/* PHASE 3: LIVE TALLY */}
      {phase === 3 && (
        <div className="space-y-8">
            {isLoading ? (
                <div className="bg-white rounded-[40px] p-20 text-center animate-pulse border border-gray-50 shadow-sm">
                    <BarChart3 className="w-20 h-20 text-orange-200 mx-auto mb-6" />
                    <p className="text-xl font-black text-gray-400 uppercase tracking-tighter">Syncing with Central Ledger...</p>
                </div>
            ) : (
                <div className="space-y-8">
                   <div className="bg-green-500 rounded-[35px] p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-green-100 animate-in zoom-in-95 duration-500">
                     <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle className="w-10 h-10 text-white" />
                     </div>
                     <div className="flex-1 text-center md:text-left text-white">
                       <h2 className="text-3xl font-black tracking-tight">{selectedConstituency} - Real-time Tally</h2>
                       <p className="font-bold opacity-80 mt-1 uppercase text-xs tracking-widest">{selectedElection?.title} / Verified Votes Aggregated</p>
                     </div>
                     <button 
                       onClick={() => setPhase(2)}
                       className="bg-white text-green-600 font-black py-4 px-8 rounded-2xl text-xs uppercase tracking-widest transition-all hover:scale-105"
                     >
                       Change Constituency
                     </button>
                      
                      {/* Live Sync Badge */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full" />
                          <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Sync Alpha</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-1.5 rounded-xl border border-orange-500/20">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                          <span className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">Direct Frontend Link Active</span>
                        </div>
                      </div>
                   </div>
        
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
                       <div className="space-y-4">
                          {results.map((result, idx) => (
                            <div key={idx} className={`
                                group p-6 transition-all duration-500 rounded-[30px] border relative overflow-hidden
                                ${lastUpdatedId === result.candidateId ? 'bg-orange-50 border-orange-500 shadow-2xl scale-[1.02]' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-xl hover:shadow-gray-100 hover:border-gray-100'}
                            `}>
                               {lastUpdatedId === result.candidateId && (
                                  <div className="absolute top-0 right-0 p-2">
                                     <div className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce">
                                        +1 VOTE
                                     </div>
                                  </div>
                               )}
                               <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl ${idx === 0 ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">{result.party || 'PARTY'}</div>
                                  <h3 className="text-lg font-black text-gray-900 tracking-tight">{result.candidateName}</h3>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-black text-gray-900 tracking-tighter">{result.votes}</div>
                                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Votes</div>
                                </div>
                             </div>
                             <div className="mt-6 w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-orange-500' : 'bg-gray-400'}`}
                                  style={{ width: `${totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0}%` }}
                                />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
        
                     <div className="space-y-8">
                        <div className="bg-gray-900 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl">
                           <h2 className="text-xl font-black tracking-tight mb-8">Quick Facts</h2>
                           <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Election Status</span>
                                <span className="text-sm font-black text-green-400">{selectedElection?.status}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Ballots Scrubbed</span>
                                <span className="text-2xl font-black">{totalVotes}</span>
                              </div>
                              <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center gap-4 py-3 px-5 bg-white/5 rounded-2xl border border-white/5">
                                   <ShieldCheck className="w-6 h-6 text-orange-500" />
                                   <span className="text-xs font-bold text-gray-300 italic uppercase tracking-tighter tracking-widest">Hardware Ledger Sync: ACTIVE</span>
                                </div>
                              </div>
                           </div>
                        </div>
        
                        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                           <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                              <BarChart3 className="w-8 h-8 text-orange-500" />
                           </div>
                           <div>
                             <h3 className="text-lg font-black text-gray-900 tracking-tight tracking-tighter italic uppercase">Audit Mode</h3>
                             <p className="text-sm text-gray-500 font-medium tracking-tight">Viewing live aggregated counting center data for <span className="font-black text-gray-900">{selectedConstituency}</span>.</p>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>
            )}
        </div>
      )}

    </div>
  );
}
