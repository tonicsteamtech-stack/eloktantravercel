'use client';

import Link from 'next/link';

export default function CandidateProfilePage({ params }: { params: { id: string } }) {
  // Mock data for UI demonstration
  const candidate = {
    id: params.id,
    name: 'Arvind Sharma',
    party: 'Independent',
    constituency: 'South Delhi',
    education: 'Masters in Political Science',
    criminalCases: 0,
    assets: 15000000,
    liabilities: 2000000,
    promises: [
      { id: 1, title: '24/7 Water Supply', progress: 65, status: 'In Progress' },
      { id: 2, title: 'Digital Literacy for All', progress: 40, status: 'In Progress' },
      { id: 3, title: 'New Public Hospital', progress: 10, status: 'Not Started' },
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/candidates" className="group flex items-center text-gray-500 hover:text-primary font-bold transition-colors">
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Candidates
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Header Region - Left Col */}
          <div className="lg:col-span-4">
            <div className="glass-card p-10 text-center sticky top-24 border-white/5">
              <div className="w-32 h-32 rounded-3xl bg-primary/10 flex items-center justify-center font-black text-5xl text-primary mx-auto mb-8 shadow-2xl shadow-primary/20">
                {candidate.name.charAt(0)}
              </div>
              <h1 className="text-3xl font-black mb-2 orange-text-gradient uppercase tracking-tight">{candidate.name}</h1>
              <p className="text-lg text-gray-400 font-bold mb-8">{candidate.party}</p>
              
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="bg-secondary/50 p-4 rounded-2xl border border-white/5">
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Constituency</div>
                  <div className="text-lg font-bold text-gray-200">{candidate.constituency}</div>
                </div>
                <div className={`p-4 rounded-2xl border ${candidate.criminalCases > 0 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Criminal Cases</div>
                  <div className="text-2xl font-black">{candidate.criminalCases}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Region - Right Col */}
          <div className="lg:col-span-8 space-y-8">
            {/* Background & Education */}
            <section className="glass-card p-8 border-white/5">
              <h2 className="text-2xl font-black mb-8 border-b border-white/5 pb-4 uppercase tracking-tight">Audit Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Background</h3>
                  <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5">
                    <div className="text-xs font-bold text-gray-500 mb-1">Education</div>
                    <div className="text-lg font-bold text-gray-200">{candidate.education}</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Wealth Check</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Assets</span>
                      <span className="text-lg font-bold text-green-500">₹{candidate.assets.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/30 border border-white/5 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Liabilities</span>
                      <span className="text-lg font-bold text-red-500">₹{candidate.liabilities.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Promises Tracker */}
            <section className="glass-card p-8 border-white/5">
              <h2 className="text-2xl font-black mb-8 border-b border-white/5 pb-4 uppercase tracking-tight">Campaign Promises</h2>
              <div className="space-y-8">
                {candidate.promises.map(promise => (
                  <div key={promise.id} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-black text-gray-200">{promise.title}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          promise.status === 'Completed' ? 'text-green-500' : 'text-primary'
                        }`}>
                          {promise.status}
                        </span>
                      </div>
                      <span className="text-xl font-black orange-text-gradient">{promise.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary orange-gradient transition-all duration-1000" 
                        style={{ width: `${promise.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
