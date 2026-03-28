'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search, ChevronDown, User, Phone, MapPin, IdCard,
  ShieldCheck, X, Eye, FileText
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Voter {
  id: number;
  name: string;
  constituency: string;
  phone: string;
  voter_id: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [filterConstituency, setFilterConstituency] = useState('');

  // Detail modal
  const [detailVoter, setDetailVoter] = useState<Voter | null>(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch('/api/voters');
        const data = await res.json();
        if (data.success) setVoters(data.voters);
        else setError('Unable to load electoral roll data.');
      } catch {
        setError('Failed to connect. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchVoters();
  }, []);

  // ── Derived data ────────────────────────────────────────────────────────────
  const constituencies = useMemo(
    () => Array.from(new Set(voters.map(v => v.constituency))).sort(),
    [voters]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return voters.filter(v => {
      const matchSearch = !q ||
        v.name.toLowerCase().includes(q) ||
        v.voter_id.toLowerCase().includes(q) ||
        v.constituency.toLowerCase().includes(q);
      const matchConst = !filterConstituency || v.constituency === filterConstituency;
      return matchSearch && matchConst;
    });
  }, [voters, search, filterConstituency]);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#f2f4f7', fontFamily: 'Noto Sans, Arial, sans-serif' }}>

      {/* Page Header Banner */}
      <div style={{ background: '#003087', borderBottom: '4px solid #FF9933' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 rounded" style={{ background: '#FF9933' }} />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
              Voter Electoral Roll
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-4">
            मतदाता सूची • Official Electoral Roll published by the Election Commission of India
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto max-w-7xl text-xs text-gray-500">
          <span>Home</span> <span className="mx-2">›</span>
          <span className="text-gray-800 font-medium">Voter Electoral Roll</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">

        {/* Official Notice */}
        <div className="gov-notice mb-5">
          <strong>Official Notice:</strong> This electoral roll is published by the Election Commission of India (ECI) under Section 62 of the Representation of the People Act, 1951. Data is for public reference only. To correct or update your entry, contact your local Electoral Registration Officer (ERO).
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded text-sm" style={{ background: 'rgba(185,28,28,0.06)', color: '#b91c1c', border: '1px solid rgba(185,28,28,0.2)' }}>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Registered Voters', labelHi: 'कुल मतदाता', value: voters.length, color: '#003087' },
            { label: 'Constituencies', labelHi: 'विधानसभा क्षेत्र', value: constituencies.length, color: '#138808' },
            { label: 'Search Results', labelHi: 'खोज परिणाम', value: filtered.length, color: '#FF9933' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded p-4 text-center" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="text-2xl font-bold mb-0.5" style={{ color: s.color, fontFamily: 'Noto Serif, Georgia, serif' }}>{s.value}</div>
              <div className="text-xs font-medium text-gray-500">{s.label}</div>
              <div className="text-xs text-gray-300">{s.labelHi}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                id="voter-search"
                placeholder="Search by name, voter ID or constituency..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="gov-input pl-9"
              />
            </div>
            {/* Constituency filter */}
            <div className="relative md:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="constituency-filter"
                value={filterConstituency}
                onChange={e => setFilterConstituency(e.target.value)}
                className="gov-input pl-9 appearance-none pr-8"
              >
                <option value="">All Constituencies</option>
                {constituencies.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {(search || filterConstituency) && (
              <button
                onClick={() => { setSearch(''); setFilterConstituency(''); }}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded text-sm text-gray-500 hover:bg-gray-50"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#003087', borderTopColor: 'transparent' }} />
              <p className="text-sm text-gray-400">Loading electoral roll...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">No voters found matching your criteria.</p>
              {(search || filterConstituency) && (
                <button
                  onClick={() => { setSearch(''); setFilterConstituency(''); }}
                  className="mt-3 text-xs text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Voter Name</th>
                    <th>Voter ID</th>
                    <th>Constituency</th>
                    <th>Phone</th>
                    <th className="text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((voter, idx) => (
                    <tr key={voter.voter_id}>
                      <td className="text-gray-400 text-xs w-10">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center font-semibold text-sm flex-shrink-0"
                            style={{ background: 'rgba(0,48,135,0.08)', color: '#003087' }}
                          >
                            {voter.name.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className="font-semibold text-gray-800 cursor-pointer hover:underline"
                            onClick={() => setDetailVoter(voter)}
                            style={{ fontFamily: 'Noto Serif, Georgia, serif' }}
                          >
                            {voter.name}
                          </span>
                        </div>
                      </td>
                      <td>
                        <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-700">{voter.voter_id}</code>
                      </td>
                      <td>
                        <span
                          className="gov-badge"
                          style={{ background: 'rgba(0,48,135,0.07)', color: '#003087', border: '1px solid rgba(0,48,135,0.15)' }}
                        >
                          {voter.constituency}
                        </span>
                      </td>
                      <td className="text-gray-600 text-sm">{voter.phone}</td>
                      <td className="text-center">
                        <button
                          onClick={() => setDetailVoter(voter)}
                          title="View Details"
                          className="p-1.5 rounded hover:bg-blue-50 transition-colors"
                          style={{ color: '#003087' }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Showing {filtered.length} of {voters.length} registered voters</span>
              {(search || filterConstituency) && (
                <span className="font-medium" style={{ color: '#FF9933' }}>Filters applied</span>
              )}
            </div>
          )}
        </div>

        {/* Helpline */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <ShieldCheck className="inline w-3.5 h-3.5 mr-1" style={{ color: '#138808' }} />
          To update your voter registration, contact <strong className="text-gray-600">Voter Helpline 1950</strong> or visit your local Electoral Registration Officer.
        </div>
      </div>

      {/* ── Voter Detail Modal (read-only) ── */}
      {detailVoter && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailVoter(null)} />
          <div className="relative w-full max-w-md bg-white rounded shadow-2xl overflow-hidden" style={{ borderTop: '4px solid #003087' }}>
            <div className="gov-section-header justify-between">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> Voter Details</span>
              <button onClick={() => setDetailVoter(null)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded flex items-center justify-center text-2xl font-bold" style={{ background: 'rgba(0,48,135,0.08)', color: '#003087' }}>
                  {detailVoter.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>{detailVoter.name}</h2>
                  <span className="gov-badge gov-badge-active text-xs">Registered Voter</span>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { label: 'Voter ID', value: detailVoter.voter_id, Icon: IdCard },
                  { label: 'Constituency', value: detailVoter.constituency, Icon: MapPin },
                  { label: 'Phone Number', value: detailVoter.phone, Icon: Phone },
                ].map(({ label, value, Icon }) => (
                  <div key={label} className="flex items-center gap-3 py-3">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                This record is published by the Election Commission of India. To update, contact Helpline <strong>1950</strong>.
              </p>
              <button onClick={() => setDetailVoter(null)} className="btn-gov-primary w-full justify-center text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
