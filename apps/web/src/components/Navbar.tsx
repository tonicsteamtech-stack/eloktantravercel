'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English' },
  { code: 'hi', label: 'Hindi',      native: 'हिंदी' },
  { code: 'bn', label: 'Bengali',    native: 'বাংলা' },
  { code: 'ta', label: 'Tamil',      native: 'தமிழ்' },
  { code: 'te', label: 'Telugu',     native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi',    native: 'मराठी' },
  { code: 'gu', label: 'Gujarati',   native: 'ગુજરાતી' },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLang, setActiveLang] = useState(LANGUAGES[0]);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Bootstrap Google Translate
  useEffect(() => {
    if (document.getElementById('gt-script')) return;
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,hi,bn,ta,te,mr,gu', autoDisplay: false },
        'google_translate_element'
      );
    };
    const s = document.createElement('script');
    s.id = 'gt-script';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchLang = (lang: typeof LANGUAGES[0]) => {
    setActiveLang(lang);
    setLangOpen(false);
    // Trigger Google Translate cookie
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = lang.code;
      select.dispatchEvent(new Event('change'));
    }
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Elections', href: '/elections' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'Manifestos', href: '/manifestos' },
    { label: 'Issues', href: '/issues' },
    { label: 'Voter Dashboard', href: '/dashboard' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  return (
    <>
      {/* ── TRICOLOR BAR ── */}
      <div className="gov-tricolor-bar fixed top-0 left-0 right-0 z-50" />

      {/* ── MAIN HEADER ── */}
      <header
        className={`fixed top-[6px] left-0 right-0 z-50 gov-header transition-shadow duration-200 ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        {/* Logo row */}
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          {/* Emblem + Title */}
          <Link href="/" className="flex items-center gap-4 group no-underline">
            {/* Ashoka Chakra SVG emblem */}
            <div className="flex-shrink-0">
              <svg
                width="52"
                height="52"
                viewBox="0 0 52 52"
                fill="none"
                className="drop-shadow-md"
                aria-label="National Emblem"
              >
                {/* Outer ring */}
                <circle cx="26" cy="26" r="24" fill="#FF9933" opacity="0.15" />
                <circle cx="26" cy="26" r="24" stroke="#FF9933" strokeWidth="2" fill="none" />
                {/* Chakra spokes */}
                {Array.from({ length: 24 }, (_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const x1 = 26 + 10 * Math.cos(rad);
                  const y1 = 26 + 10 * Math.sin(rad);
                  const x2 = 26 + 22 * Math.cos(rad);
                  const y2 = 26 + 22 * Math.sin(rad);
                  return (
                    <line
                      key={i}
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke="#003087"
                      strokeWidth="1.2"
                    />
                  );
                })}
                {/* Hub */}
                <circle cx="26" cy="26" r="6" fill="#003087" />
                <circle cx="26" cy="26" r="3" fill="#FF9933" />
                {/* Stars between spokes */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = ((i * 360) / 12 + 7.5) * Math.PI / 180;
                  const cx = 26 + 16 * Math.cos(angle);
                  const cy = 26 + 16 * Math.sin(angle);
                  return <circle key={i} cx={cx} cy={cy} r="1.2" fill="#003087" />;
                })}
              </svg>
            </div>

            <div>
              <div
                className="text-white font-bold leading-tight"
                style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '1.2rem' }}
              >
                eLok<span style={{ color: '#FF9933' }}>Tantra</span>
              </div>
              <div className="text-white/70 text-xs leading-tight" style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}>
                भारत निर्वाचन आयोग • Election Commission of India
              </div>
              <div className="text-white/50 text-[10px] tracking-wider uppercase" style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}>
                Digital Voting &amp; Civic Transparency Platform
              </div>
            </div>
          </Link>

          {/* Right: LangSwitch + Vote CTA + mobile toggle */}
          <div className="flex items-center gap-3">

            {/* ── Language Selector ── */}
            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors"
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', fontFamily: 'Noto Sans, Arial, sans-serif' }}
                aria-label="Select language"
              >
                <Globe className="w-3.5 h-3.5" />
                {activeLang.native}
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded shadow-xl z-50 overflow-hidden"
                  style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => switchLang(lang)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors"
                      style={{ color: activeLang.code === lang.code ? '#003087' : '#374151', fontWeight: activeLang.code === lang.code ? 600 : 400 }}
                    >
                      <span>{lang.native}</span>
                      <span className="text-xs text-gray-400">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Hidden Google Translate element */}
            <div id="google_translate_element" className="hidden" />

            <Link href="/vote" className="btn-gov-accent hidden sm:inline-flex">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cast Vote
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white border border-white/20 rounded"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── NAV STRIP ── */}
        <nav className="gov-nav-strip hidden lg:block">
          <div className="container mx-auto max-w-7xl px-4 flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`gov-nav-link ${isActive(link.href) ? 'gov-nav-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            {/* Citizen Services label on right */}
            <div className="ml-auto px-4 text-white/40 text-xs uppercase tracking-widest" style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}>
              Citizen Portal
            </div>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
        <div
          className={`absolute top-0 left-0 h-full w-72 transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: '#001f5b' }}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <span className="text-white font-semibold" style={{ fontFamily: 'Noto Serif, serif' }}>Navigation</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-white/60 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links */}
          <div className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-3 text-sm border-b border-white/10 transition-colors ${
                  isActive(link.href)
                    ? 'bg-[#FF9933] text-[#1a1a2e] font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                style={{ fontFamily: 'Noto Sans, Arial, sans-serif' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Language Selector */}
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Select Language</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { switchLang(lang); setIsMenuOpen(false); }}
                  className="text-left px-2 py-1.5 rounded text-xs transition-colors"
                  style={{ background: activeLang.code === lang.code ? '#FF9933' : 'rgba(255,255,255,0.07)', color: activeLang.code === lang.code ? '#1a1a2e' : 'rgba(255,255,255,0.75)', fontFamily: 'Noto Sans, Arial, sans-serif', fontWeight: activeLang.code === lang.code ? 600 : 400 }}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile CTAs */}
          <div className="p-4 flex flex-col gap-2 mt-2">
            <Link href="/vote" className="btn-gov-accent justify-center">
              Cast Vote
            </Link>
          </div>

          {/* Satyameva Jayate */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/30 text-xs" style={{ fontFamily: 'Noto Serif, serif' }}>
            सत्यमेव जयते
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
