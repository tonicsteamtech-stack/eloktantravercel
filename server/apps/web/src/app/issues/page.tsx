'use client';

import Link from 'next/link';

export default function IssuesPage() {
  const issues = [
    {
      id: 1,
      title: 'Road repair in Dwarka Sector 10',
      description: 'The road near Metro Pillar 124 is badly damaged and has multiple potholes.',
      location: 'Dwarka Sector 10',
      constituency: 'South Delhi',
      status: 'IN PROGRESS',
      issue_type: 'Roads',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Street lighting issue in Rohini',
      description: 'The street lights in Sector 5 are not working for the last 3 days.',
      location: 'Rohini Sector 5',
      constituency: 'North West Delhi',
      status: 'OPEN',
      issue_type: 'Electricity',
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Water supply interruption',
      description: 'No water supply in Vikas Nagar since morning.',
      location: 'Vikas Nagar',
      constituency: 'West Delhi',
      status: 'RESOLVED',
      issue_type: 'Water Supply',
      created_at: new Date().toISOString(),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black mb-2 orange-text-gradient uppercase tracking-tight">Civic Reports</h1>
            <p className="text-gray-400 font-medium text-lg">Real-time civic issues feed in your constituency.</p>
          </div>
          <Link
            href="/issues/report"
            className="px-8 py-4 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-full transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            + Report New Issue
          </Link>
        </header>

        <div className="space-y-6">
          {issues.map((issue) => (
            <div key={issue.id} className="glass-card p-8 border-white/5 hover:border-primary/20 transition-all duration-300 group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    {issue.issue_type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    issue.status === 'RESOLVED' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : issue.status === 'IN PROGRESS'
                    ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {issue.status}
                  </span>
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-gray-600">
                  {new Date(issue.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <h2 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">
                {issue.title}
              </h2>
              
              <p className="text-gray-400 font-medium mb-6 leading-relaxed">
                {issue.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-bold uppercase tracking-widest">{issue.location} • {issue.constituency}</span>
                </div>
                
                <button className="text-sm font-black uppercase tracking-widest text-primary hover:text-accent transition-colors">
                  View Updates →
                </button>
              </div>
            </div>
          ))}

          <div className="text-center pt-12">
            <p className="text-gray-500 font-bold mb-6 italic">You have reached the end of the recent reports feed.</p>
            <Link 
              href="/issues/report"
              className="text-primary font-black uppercase tracking-widest hover:underline"
            >
              Report another issue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
