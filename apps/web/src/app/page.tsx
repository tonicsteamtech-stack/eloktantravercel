import Link from 'next/link';

// ─── DATA ────────────────────────────────────────────────────────────────────

const announcements = [
  'General Elections 2024 — Voter Registration Now Open | अभी मतदाता पंजीकरण करें',
  'New: DigiLocker-integrated identity verification for all registered voters',
  'Candidate nomination forms available for Lok Sabha Constituencies',
  'eLoktantra mobile application available on Android and iOS',
  'Voter Helpline: 1950 | Nationwide 24×7 Toll Free',
];

const stats = [
  { value: '1.4B+', label: 'Eligible Citizens', labelHi: 'पात्र नागरिक', icon: '👥' },
  { value: '543', label: 'Lok Sabha Seats', labelHi: 'लोक सभा सीटें', icon: '🏛️' },
  { value: '8,500+', label: 'Registered Candidates', labelHi: 'पंजीकृत प्रत्याशी', icon: '📋' },
  { value: '100%', label: 'Cryptographic Transparency', labelHi: 'पारदर्शिता', icon: '🔐' },
];

const services = [
  {
    title: 'Active Elections',
    titleHi: 'सक्रिय चुनाव',
    description: 'View all ongoing and upcoming election cycles. Track schedules, voting windows, and results.',
    href: '/elections',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    color: '#003087',
  },
  {
    title: 'Candidate Directory',
    titleHi: 'प्रत्याशी निर्देशिका',
    description: 'Full de-anonymized audit — criminal records, asset declarations, party affiliations.',
    href: '/candidates',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: '#138808',
  },
  {
    title: 'Digital Manifestos',
    titleHi: 'डिजिटल घोषणापत्र',
    description: 'Immutably filed policy commitments. Track promises, compare platforms, enforce accountability.',
    href: '/manifestos',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: '#FF9933',
  },
  {
    title: 'Civic Grievances',
    titleHi: 'नागरिक शिकायतें',
    description: 'Report regional infrastructure and community issues. Track redressal linked to representatives.',
    href: '/issues',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: '#b91c1c',
  },
  {
    title: 'Voter Dashboard',
    titleHi: 'मतदाता पोर्टल',
    description: 'Verify your registration, check constituency, and view your cryptographic vote receipt.',
    href: '/dashboard',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    color: '#6d28d9',
  },
  {
    title: 'Secure Ballot',
    titleHi: 'सुरक्षित मतपत्र',
    description: 'AES-256 encrypted, blockchain-verified digital voting. One citizen, one vote, zero fraud.',
    href: '/vote',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: '#003087',
  },
];

const quickLinks = [
  { label: 'Check Voter Registration', href: '/dashboard' },
  { label: 'Find Your Constituency', href: '/voters' },
  { label: 'View Active Candidates', href: '/candidates' },
  { label: 'National Voter Helpline 1950', href: '#' },
  { label: 'Election Schedule & Dates', href: '/elections' },
  { label: 'File Civic Complaint', href: '/issues' },
  { label: 'Download Voter ID (DigiLocker)', href: '/dashboard' },
  { label: 'Candidate Affidavit Search', href: '/candidates' },
];

const importantNotices = [
  {
    date: '28 Mar 2026',
    title: 'General Election Voter Roll Published',
    desc: 'The final electoral roll for the 2026 General Election has been published. Verify your entry at your nearest BLO.',
  },
  {
    date: '26 Mar 2026',
    title: 'Digital Nomination Filing Window Open',
    desc: 'Candidates can now file nominations digitally via the eLoktantra portal. Last date: April 10, 2026.',
  },
  {
    date: '24 Mar 2026',
    title: 'Mock Poll Results Available',
    desc: 'Results of the mock polling exercise conducted in 50 constituencies are now available for review.',
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: '#f2f4f7', fontFamily: 'Noto Sans, Arial, sans-serif' }}>

      {/* ── ANNOUNCEMENT TICKER ── */}
      <div className="gov-marquee-bar overflow-hidden py-2">
        <div className="flex items-center gap-4 px-4">
          <span
            className="flex-shrink-0 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded"
            style={{ background: '#FF9933', letterSpacing: '0.1em' }}
          >
            LIVE
          </span>
          <div className="overflow-hidden flex-1">
            <div className="gov-ticker flex gap-16">
              {announcements.map((a, i) => (
                <span key={i} className="mr-12">• {a}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="gov-hero-banner relative py-16 px-4">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Ccircle cx='40' cy='40' r='36' stroke='%23FFFFFF' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }} />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left text */}
            <div className="text-white space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-white/20 text-white/70 text-xs uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                Official Digital Voting Platform of India
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
                style={{ fontFamily: 'Noto Serif, Georgia, serif' }}
              >
                eLokTantra
                <span className="block text-2xl md:text-3xl mt-1" style={{ color: '#FF9933' }}>
                  इलेक्ट्रॉनिक लोकतंत्र
                </span>
              </h1>

              <p className="text-white/75 text-base leading-relaxed max-w-xl">
                India&apos;s official digital democracy platform. Conduct secure elections, verify candidates, 
                file grievances, and cast your constitutionally guaranteed vote — transparently, verifiably, 
                and from anywhere in the country.
              </p>

              <p
                className="text-white/50 text-sm italic"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                &ldquo;सत्यमेव जयते&rdquo; — Truth Alone Triumphs
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/vote" className="btn-gov-accent">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cast Your Vote
                </Link>
                <Link href="/elections" className="btn-gov-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View Elections
                </Link>
              </div>
            </div>

            {/* Right: Quick links card */}
            <div
              className="bg-white rounded overflow-hidden shadow-xl border border-white/10"
              style={{ borderTop: '4px solid #FF9933' }}
            >
              <div className="gov-section-header">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Citizen Quick Services</span>
              </div>
              <div>
                {quickLinks.map((link, i) => (
                  <Link key={i} href={link.href} className="gov-quick-link">
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="px-4 py-3 text-xs text-gray-400 bg-gray-50 border-t border-gray-100">
                Helpline: <strong>1950</strong> (Toll Free, 24×7)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="gov-stats-strip py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i} className="py-4 border-r border-gray-100 last:border-0">
                <div className="text-3xl font-bold" style={{ color: '#003087', fontFamily: 'Noto Serif, serif' }}>
                  {s.value}
                </div>
                <div className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</div>
                <div className="text-xs text-gray-400" style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}>{s.labelHi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── SERVICES GRID (2/3 width) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section heading */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-6 w-1.5 rounded" style={{ background: '#FF9933' }} />
              <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, serif' }}>
                Citizen Services
                <span className="block text-sm font-normal text-gray-500 mt-0.5" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                  नागरिक सेवाएं
                </span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s, i) => (
                <Link
                  key={i}
                  href={s.href}
                  className="gov-card p-6 block group"
                  style={{ borderTopColor: s.color, textDecoration: 'none' }}
                >
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center mb-4"
                    style={{ background: `${s.color}12`, color: s.color }}
                  >
                    {s.icon}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-0.5 group-hover:underline" style={{ fontFamily: 'Noto Serif, serif' }}>
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-2" style={{ fontFamily: 'Noto Sans, sans-serif' }}>{s.titleHi}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                </Link>
              ))}
            </div>

            {/* Notice Panel */}
            <div className="gov-notice mt-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: '#FF9933' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="font-bold text-sm text-amber-900">Important Notice</span>
              </div>
              <p className="text-sm leading-relaxed">
                All citizens must complete DigiLocker-based identity verification before casting their vote. 
                Please ensure your Aadhaar-linked mobile number is active. 
                Contact Voter Helpline <strong>1950</strong> for assistance.
              </p>
            </div>
          </div>

          {/* ── SIDEBAR (1/3 width) ── */}
          <div className="space-y-6">

            {/* Notices */}
            <div className="bg-white rounded overflow-hidden shadow-sm border border-gray-200">
              <div className="gov-section-header">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Latest Notifications
              </div>
              <div className="divide-y divide-gray-100">
                {importantNotices.map((n, i) => (
                  <div key={i} className="p-4 hover:bg-blue-50/40 transition-colors cursor-pointer">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{n.date}</div>
                    <div className="text-sm font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>{n.title}</div>
                    <p className="text-xs text-gray-500 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <Link href="/elections" className="text-xs font-semibold text-blue-700 hover:underline">
                  View All Notifications →
                </Link>
              </div>
            </div>

            {/* Voter Registration CTA */}
            <div
              className="rounded overflow-hidden shadow-sm"
              style={{ background: '#003087', borderTop: '4px solid #FF9933' }}
            >
              <div className="p-6 text-white text-center space-y-4">
                <div className="text-3xl">🗳️</div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Noto Serif, serif' }}>
                  Ready to Vote?
                </h3>
                <p className="text-white/70 text-xs leading-relaxed">
                  All registered voters with valid DigiLocker-verified identity can cast their secure digital ballot.
                </p>
                <Link href="/vote" className="btn-gov-accent w-full justify-center">
                  Launch Voting Portal
                </Link>
                <Link href="/register" className="block text-white/50 text-xs hover:text-white/80 transition-colors">
                  New voter? Register here →
                </Link>
              </div>
            </div>

            {/* Satyameva Jayate */}
            <div
              className="rounded p-4 text-center border"
              style={{ background: '#fffbeb', borderColor: '#f0d060' }}
            >
              <div className="text-2xl mb-2">🔱</div>
              <div
                className="text-lg font-semibold text-amber-900 mb-1"
                style={{ fontFamily: 'Noto Serif, serif' }}
              >
                सत्यमेव जयते
              </div>
              <div className="text-xs text-amber-700">National Motto of India</div>
              <div className="text-xs text-amber-600 mt-2 italic">
                &ldquo;Truth Alone Triumphs&rdquo;<br />
                — Mundaka Upanishad
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="gov-footer mt-12">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h2 className="text-white font-bold text-xl mb-1" style={{ fontFamily: 'Noto Serif, serif' }}>
                eLok<span style={{ color: '#FF9933' }}>Tantra</span>
              </h2>
              <p className="text-white/50 text-xs mb-3" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                भारत निर्वाचन आयोग<br />
                Election Commission of India
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                Official digital democracy platform. All elections conducted on this portal are constitutionally valid and cryptographically secured.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-white/90 font-semibold text-sm mb-3 uppercase tracking-wider" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                Citizen Services
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Active Elections', href: '/elections' },
                  { label: 'Candidate Directory', href: '/candidates' },
                  { label: 'Voter Dashboard', href: '/dashboard' },
                  { label: 'Issue Tracker', href: '/issues' },
                  { label: 'Cast Vote', href: '/vote' },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="text-white/50 text-xs hover:text-white/90 transition-colors">
                    › {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white/90 font-semibold text-sm mb-3 uppercase tracking-wider" style={{ fontFamily: 'Noto Sans, sans-serif' }}>
                Contact & Help
              </h3>
              <div className="space-y-2 text-xs text-white/50">
                <div>📞 Voter Helpline: <strong className="text-white/80">1950</strong></div>
                <div>🕐 Available 24×7 during elections</div>
                <div>📧 support@eloktantra.gov.in</div>
                <div>🌐 www.eloktantra.gov.in</div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <span className="text-white/30">Technology powered by AI &amp; Blockchain</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom strip */}
        <div className="gov-footer-bottom py-3 px-4">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/30">
            <span>© {new Date().getFullYear()} Election Commission of India — eLoktantra. All Rights Reserved.</span>
            <span>
              Last Updated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              &nbsp;|&nbsp;
              <Link href="#" className="text-white/40 hover:text-white/60">Privacy Policy</Link>
              &nbsp;|&nbsp;
              <Link href="#" className="text-white/40 hover:text-white/60">Terms of Use</Link>
              &nbsp;|&nbsp;
              <Link href="#" className="text-white/40 hover:text-white/60">Accessibility</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
