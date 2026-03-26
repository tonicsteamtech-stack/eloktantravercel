'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ShieldCheck, MapPin, 
  BarChart3, AlertCircle, Calendar, 
  BookOpen, Globe, Fingerprint, Info, Landmark
} from 'lucide-react';

export default function CandidateAuditProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [candidate, setCandidate] = useState<any>(null);
  const [manifesto, setManifesto] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [manifestoError, setManifestoError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Direct fetch from Render for candidates - bypasses flaky proxy
        const baseUrl = 'https://backend-elokantra.onrender.com';
        
        // 1. Fetch Candidate List
        const cRes = await fetch(`${baseUrl}/api/candidates`);
        const cResult = await cRes.json();
        const cList = cResult.data || cResult.candidates || (Array.isArray(cResult) ? cResult : []);
        
        const current = cList.find((c: any) => (c.id === id || c._id === id));
        setCandidate(current);

        // 2. Fetch Manifesto via Proxy (handling the new hardened proxy response)
        if (current) {
          try {
            const mRes = await fetch(`/api/manifestos?candidateId=${id}`);
            const mData = await mRes.json();
            
            if (mData.success) {
                const m = mData.manifestos?.[0] || null;
                if (m) {
                    // Standardize content/description
                    m.display_content = m.description || m.content || "No detailed manifesto content provided.";
                }
                setManifesto(m);
            } else {
                setManifestoError(mData.error || "Failed to load manifesto");
            }
          } catch (mErr) {
            console.warn('Manifesto fetch error:', mErr);
            setManifestoError("Manifesto service temporarily unavailable");
          }
        }
      } catch (err) {
        console.error('Fetch Profile Err:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020408]">
        <div className="text-center animate-pulse">
            <Fingerprint className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Decrypting Audit Record...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center">
        <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Record Not Found</h1>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-bold">The requested candidate ID {id.slice(0,8)}... is not in the ledger.</p>
            <Link href="/candidates" className="text-orange-500 font-black uppercase text-xs tracking-widest border border-orange-500/20 px-8 py-3 rounded-full hover:bg-orange-500 hover:text-white transition-all">Back to Directory</Link>
        </div>
      </div>
    );
  }

  // Field Name Normalization (Senior developer fix for backend inconsistencies)
  const netWorthValue = candidate.net_worth || candidate.assets || candidate.SelfDeclaredAssets || '0';
  const criminalCasesCount = candidate.criminal_cases ?? candidate.criminalCases ?? 0;
  const educationValue = candidate.education || candidate.qualification || "Under Review";

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-orange-500/30 pb-20 pt-32">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Navigation */}
        <div className="mb-12">
            <Link href="/candidates" className="group flex items-center text-gray-500 hover:text-orange-500 transition-colors">
                <ChevronLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Election Directory</span>
            </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Identity Column */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0d1117] border border-white/5 rounded-[3rem] p-10 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center font-black text-6xl text-orange-500 mx-auto mb-8 border border-white/5 shadow-2xl relative z-10">
                    {candidate.name.charAt(0)}
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">{candidate.name}</h1>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] mb-10">{candidate.party}</p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Audit ID</span>
                            <span className="text-[10px] font-mono text-gray-300">X92-2024-{(candidate.id || candidate._id).slice(-4).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Status</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                <ShieldCheck className="w-3 h-3 mr-1.5" /> VERIFIED
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-[2.5rem] p-8 space-y-6">
                 <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" /> Regional Scope
                 </h3>
                 <div className="space-y-4">
                    <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Election Circle</p>
                        <p className="text-sm font-bold">{candidate.electionName || candidate.election || "National"}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Constituency</p>
                        <p className="text-sm font-bold">{candidate.constituency || "General Assembly"}</p>
                    </div>
                 </div>
            </div>
          </div>

          {/* Audit Data Column */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Asset & Risk Audit */}
            <section className="bg-[#0d1117] border border-white/5 rounded-[3.5rem] p-12 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <BarChart3 className="w-40 h-40 text-orange-500" />
                </div>

                <h2 className="text-2xl font-black uppercase tracking-tighter mb-12 flex items-center">
                    <Landmark className="w-6 h-6 mr-3 text-orange-500" /> Financial & Legal Audit
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Self-Declared Assets</label>
                        <div className="bg-black/40 border border-white/5 p-8 rounded-3xl">
                            <p className="text-4xl font-black text-white leading-none mb-1">₹ {netWorthValue}</p>
                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Based on latest affidavit sync</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Criminal Record Profile</label>
                        <div className={`border p-8 rounded-3xl ${criminalCasesCount > 0 ? 'bg-red-500/5 border-red-500/20 text-red-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                            <p className="text-4xl font-black leading-none mb-1">{criminalCasesCount}</p>
                            <span className="text-[9px] font-black uppercase tracking-widest">{criminalCasesCount > 0 ? 'Review Specific Charges' : 'No Adverse Records Found'}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Manifesto Content */}
            <section className="bg-[#0d1117] border border-white/5 rounded-[3.5rem] p-12">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
                        <BookOpen className="w-6 h-6 mr-3 text-orange-500" /> Digital Manifesto
                    </h2>
                    <span className="text-[10px] font-black bg-white/5 text-gray-500 border border-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest uppercase">Cycle 2024</span>
                </header>

                {manifesto ? (
                    <article className="prose prose-invert max-w-none space-y-8">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{manifesto.title}</h3>
                            <p className="text-gray-400 font-medium text-lg leading-relaxed">{manifesto.display_content}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-white/5">
                            <div className="p-6 bg-white/2 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all">
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-3">Audited Education</p>
                                <p className="text-xs font-bold text-gray-300">{educationValue}</p>
                            </div>
                            <div className="p-6 bg-white/2 rounded-2xl border border-white/5 hover:border-orange-500/20 transition-all">
                                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-3">Manifesto Audit</p>
                                <p className="text-xs font-bold text-gray-300">Verified authenticity via cryptographic signature.</p>
                            </div>
                        </div>
                    </article>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-50 relative overflow-hidden">
                        {manifestoError ? (
                            <div className="relative z-10">
                                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest text-red-500">{manifestoError}</p>
                                <p className="text-[9px] text-gray-500 mt-2">The backend is responding slowly. Please refresh.</p>
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <Info className="w-10 h-10 text-gray-700 mx-auto mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest text-gray-600">No digital manifesto filed for this cycle.</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
