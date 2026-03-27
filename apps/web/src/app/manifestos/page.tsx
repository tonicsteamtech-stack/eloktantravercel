'use client';

import { useState, useEffect } from 'react';
import { FileText, ArrowRight, User, Vote, Target, ShieldCheck, ChevronDown } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

export default function ManifestosPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [manifestos, setManifestos] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get('/api/elections');
        setElections(res.data.elections || []);
      } catch (err) {
        console.error('Failed to fetch elections', err);
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    const fetchConstituencies = async () => {
      try {
        const res = await axios.get(`/api/constituencies?electionId=${selectedElection}`);
        setConstituencies(res.data.constituencies || []);
        setSelectedConstituency('');
      } catch (err) {
        console.error('Failed to fetch constituencies', err);
      }
    };
    fetchConstituencies();
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection || !selectedConstituency) { setManifestos([]); return; }
    const fetchManifestos = async () => {
      try {
        const res = await axios.get(`/api/manifestos?electionId=${selectedElection}&constituencyId=${selectedConstituency}`);
        setManifestos(res.data.manifestos || []);
      } catch (err) {
        console.error('Failed to fetch manifestos', err);
      }
    };
    fetchManifestos();
  }, [selectedElection, selectedConstituency]);

  return (
    <div className="min-h-screen" style={{ background: '#f2f4f7', fontFamily: 'Noto Sans, Arial, sans-serif' }}>

      {/* Page Header Banner */}
      <div style={{ background: '#003087', borderBottom: '4px solid #FF9933' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 rounded" style={{ background: '#FF9933' }} />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
              Digital Manifestos
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-4">
            डिजिटल घोषणापत्र • Cryptographically verified and immutable official policy commitments
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto max-w-7xl text-xs text-gray-500">
          <span>Home</span> <span className="mx-2">›</span> <span className="text-gray-800 font-medium">Manifestos</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* Filter Panel */}
        <div className="bg-white border border-gray-200 rounded p-6 mb-8" style={{ borderTop: '3px solid #003087' }}>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">Filter by Election &amp; Constituency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step 1 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Vote className="w-3.5 h-3.5" /> Step 1: Select Election Cycle
              </label>
              <div className="relative">
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="gov-input appearance-none pr-10"
                >
                  <option value="">Choose an Election Cycle</option>
                  {elections.map(el => <option key={el._id} value={el._id}>{el.title}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {/* Step 2 */}
            <div className={`transition-opacity ${!selectedElection ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Step 2: Select Constituency
              </label>
              <div className="relative">
                <select
                  value={selectedConstituency}
                  disabled={!selectedElection}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                  className="gov-input appearance-none pr-10"
                >
                  <option value="">{selectedElection ? 'Select Local Region' : 'Await Election Selection'}</option>
                  {constituencies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {selectedConstituency ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {manifestos.length > 0 ? (
              manifestos.map((m) => (
                <div key={m._id} className="gov-card gov-card-saffron p-6 flex flex-col">
                  {/* Candidate Header */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,48,135,0.08)', color: '#003087' }}>
                      {m.candidatePhoto ? (
                        <img src={m.candidatePhoto} alt={m.candidateName} className="w-full h-full object-cover rounded" />
                      ) : (
                        <User className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>{m.candidateName}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#FF9933' }}>{m.partyName}</p>
                    </div>
                  </div>

                  <h2 className="font-semibold text-gray-700 mb-3 text-base" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>{m.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed italic mb-4 flex-1">"{m.content}"</p>

                  {m.priorities?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Core Priorities</p>
                      <div className="flex flex-wrap gap-2">
                        {m.priorities.map((p: string, i: number) => (
                          <span key={i} className="px-3 py-1 text-xs rounded border border-gray-200 bg-gray-50 text-gray-600">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#138808' }}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Digital Ledger
                    </div>
                    <Link href={`/candidates/${m.candidateId}`} className="btn-gov-primary text-xs py-2 px-4">
                      Full Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-gray-200 rounded p-16 text-center" style={{ borderTop: '3px solid #003087' }}>
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <h3 className="font-semibold text-gray-500 mb-1" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>No Manifestos Registered</h3>
                <p className="text-sm text-gray-400">Awaiting verified uploads for this constituency.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded p-16 text-center" style={{ borderTop: '3px solid #003087' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(0,48,135,0.06)' }}>
              <Target className="w-8 h-8" style={{ color: '#003087' }} />
            </div>
            <h2 className="text-lg font-semibold text-gray-600 mb-2" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>Awaiting Regional Selection</h2>
            <p className="text-sm text-gray-400">Select an election cycle and constituency above to browse local manifestos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
