import Link from 'next/link';

export default function Dashboard() {
  const recentIssues = [
    { id: 1, title: 'Road repair in Dwarka Sector 10', status: 'In Progress', location: 'Dwarka' },
    { id: 2, title: 'Street lighting issue in Rohini', status: 'Reported', location: 'Rohini' },
  ];

  const topCandidates = [
    { id: 1, name: 'Arvind Sharma', party: 'Independent', constituency: 'South Delhi' },
    { id: 2, name: 'Priya Verma', party: 'Socialist Party', constituency: 'South Delhi' },
  ];

  const recentPromises = [
    { id: 1, title: '24/7 Water Supply', progress: 65, status: 'In Progress' },
    { id: 2, title: 'New Public Park', progress: 100, status: 'Completed' },
  ];

  const elections = [
    { id: 1, title: 'State Assembly 2024', status: 'Upcoming', date: 'Dec 15, 2024' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black mb-2 orange-text-gradient uppercase tracking-tight">Citizen Dashboard</h1>
        <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">Welcome back. Track election transparency and civic issues in your constituency.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Left Column - Main Updates */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Recent Civic Issues */}
          <section className="glass-card p-6 md:p-8 border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Recent Civic Issues</span>
              </h2>
              <Link href="/issues" className="text-xs md:text-sm text-primary hover:text-accent font-bold">View All</Link>
            </div>
            <div className="space-y-4">
              {recentIssues.map(issue => (
                <div key={issue.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/50 border border-white/5 hover:border-primary/20 transition-all gap-3">
                  <div>
                    <h3 className="font-bold text-gray-200 text-sm md:text-base">{issue.title}</h3>
                    <p className="text-xs md:text-sm text-gray-500">{issue.location}</p>
                  </div>
                  <span className={`w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${
                    issue.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
              <Link href="/issues/report" className="block w-full py-3 md:py-4 mt-2 text-center border border-dashed border-white/10 rounded-xl hover:border-primary/50 text-gray-400 hover:text-primary transition-all font-bold text-sm">
                + Report New Issue
              </Link>
            </div>
          </section>

          {/* Recent Promises Tracker */}
          <section className="glass-card p-6 md:p-8 border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold flex items-center space-x-2">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Promise Tracker</span>
              </h2>
              <Link href="/promises" className="text-xs md:text-sm text-primary hover:text-accent font-bold">View All</Link>
            </div>
            <div className="space-y-6">
              {recentPromises.map(promise => (
                <div key={promise.id} className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-bold">
                    <span className="text-gray-200">{promise.title}</span>
                    <span className="text-primary">{promise.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
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

        {/* Right Column - Sidebars */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Top Candidates */}
          <section className="glass-card p-6 md:p-8 border-white/5">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Candidates</span>
            </h2>
            <div className="space-y-4">
              {topCandidates.map(candidate => (
                <Link 
                  href={`/candidates/${candidate.id}`} 
                  key={candidate.id}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition-all group"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary group-hover:bg-primary/20 group-hover:scale-110 transition-all text-sm md:text-base">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-200 group-hover:text-primary transition-colors text-sm md:text-base">{candidate.name}</h3>
                    <p className="text-[10px] md:text-xs text-gray-500">{candidate.party} • {candidate.constituency}</p>
                  </div>
                </Link>
              ))}
              <Link href="/candidates" className="block text-center py-3 text-xs md:text-sm font-bold text-gray-500 hover:text-white transition-colors">
                View All Candidates
              </Link>
            </div>
          </section>

          {/* Secure Voting Gateway */}
          <section className="glass-card p-6 md:p-8 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/10">
            <h2 className="text-xl font-black mb-6 flex items-center space-x-2 text-primary uppercase tracking-tighter">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Secure Voting Gateway</span>
            </h2>
            <div className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed italic font-medium">
                Elections are restricted to verified citizens. Complete biometric verification to unlock the ballot.
              </p>
              <Link 
                href="/vote" 
                className="block w-full py-4 bg-primary hover:bg-accent text-white text-center font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                Launch Verification →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
