import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Transparent Candidates',
      description: 'Deep dive into candidate backgrounds, criminal records, and financial disclosures.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: 'Direct Civic Reporting',
      description: 'Report civic issues directly to local representatives and track resolution progress.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      title: 'Promise Tracking',
      description: 'Hold leaders accountable by tracking manifestos against real-world progress.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: 'AI Manifesto Comparison',
      description: 'Use advanced AI to compare policy platforms and understand key differences.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Secure Voting',
      description: 'Transparent and secure digital voting experiments powered by blockchain.',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center pt-16 md:pt-24 pb-24 md:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary rounded-full blur-[80px] md:blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-accent rounded-full blur-[80px] md:blur-[120px]" />
        </div>

        <div className="text-center max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-6 md:mb-8 tracking-tighter orange-text-gradient">
            eLoktantra
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-10 md:mb-12 text-gray-400 leading-relaxed font-medium">
            Empowering Indian democracy through transparency, <br className="hidden sm:block" />
            accountability, and active civic participation.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
            <Link 
              href="/candidates" 
              className="group relative w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 bg-primary hover:bg-accent rounded-full font-bold text-lg md:text-xl transition-all shadow-2xl shadow-primary/30 hover:shadow-primary/50 overflow-hidden text-center"
            >
              <span className="relative z-10">Explore Platform</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 md:px-10 py-4 md:py-5 glass-card hover:bg-white/10 rounded-full font-bold text-lg md:text-xl transition-all border-white/10 hover:border-white/20 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="mt-24 md:mt-40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl w-full px-4">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="group p-6 md:p-8 glass-card hover:bg-secondary/80 transition-all duration-300 sm:hover:-translate-y-2 border-white/5 hover:border-primary/20"
            >
              <div className="mb-4 md:mb-6 p-3 w-fit rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm md:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
          
          {/* Dashboard Quick Link Card */}
          <Link 
            href="/dashboard"
            className="group p-6 md:p-8 glass-card border-dashed border-white/20 hover:border-primary transition-all flex flex-col items-center justify-center text-center bg-transparent"
          >
            <div className="mb-4 md:mb-6 p-3 rounded-full bg-primary/10 group-hover:bg-primary transition-all duration-300">
              <svg className="w-8 h-8 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Ready to Start?</h3>
            <p className="text-sm text-gray-400">Jump straight into your constituency dashboard</p>
          </Link>
        </div>
      </section>

      {/* Trust Section / Stats */}
      <section className="py-16 md:py-24 border-t border-white/5 bg-secondary/30">
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-1 md:mb-2">1.4B</div>
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">Citizens</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-1 md:mb-2">543</div>
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">Constituencies</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-1 md:mb-2">8.5k+</div>
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">Candidates</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-primary mb-1 md:mb-2">100%</div>
            <div className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-widest">Transparency</div>
          </div>
        </div>
      </section>
    </div>
  );
}
