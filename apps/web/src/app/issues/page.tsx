'use client';

import { useState, useEffect } from 'react';
import {
  AlertOctagon, Globe, MapPin,
  ArrowRight, Search, Info, ShieldAlert,
  MessageSquare, ThumbsUp
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function IssuesHierarchyPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState<string>('');
  const [selectedConstituency, setSelectedConstituency] = useState<string>('');
  const [isLoadingElections, setIsLoadingElections] = useState(true);
  const [isLoadingConstituencies, setIsLoadingConstituencies] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await apiClient.get('/elections', { params: { active: true } });
        setElections(res.data.elections || []);
        if (res.data.elections?.length > 0) setSelectedElection(res.data.elections[0].id);
      } catch (err) {
        console.error('Fetch Elections Err:', err);
      } finally {
        setIsLoadingElections(false);
      }
    };
    fetchElections();
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    const fetchConstituencies = async () => {
      setIsLoadingConstituencies(true);
      setConstituencies([]);
      setSelectedConstituency('');
      try {
        const res = await apiClient.get(`/constituencies`, { params: { electionId: selectedElection } });
        setConstituencies(res.data.constituencies || []);
      } catch (err) {
        console.error('Fetch Constituencies Err:', err);
      } finally {
        setIsLoadingConstituencies(false);
      }
    };
    fetchConstituencies();
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection || !selectedConstituency) { setIssues([]); return; }
    const fetchIssues = async () => {
      setIsLoadingIssues(true);
      try {
        const res = await apiClient.get(`/issues`, { params: { electionId: selectedElection, constituencyId: selectedConstituency } });
        setIssues(res.data.issues || []);
      } catch (err) {
        console.error('Fetch Issues Err:', err);
      } finally {
        setIsLoadingIssues(false);
      }
    };
    fetchIssues();
  }, [selectedElection, selectedConstituency]);

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElection || !selectedConstituency) { alert('Please select an election and constituency first.'); return; }
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/issues', { ...newIssue, electionId: selectedElection, constituencyId: selectedConstituency, location: 'Voter Context', issueType: 'Citizen Report' });
      if (res.data.success || res.status === 200) {
        setNewIssue({ title: '', description: '' });
        setIsReporting(false);
        const refresh = await apiClient.get(`/issues`, { params: { electionId: selectedElection, constituencyId: selectedConstituency } });
        setIssues(refresh.data.issues || []);
      }
    } catch (err) {
      console.error('Report Err:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#f2f4f7', fontFamily: 'Noto Sans, Arial, sans-serif' }}>

      {/* Page Header Banner */}
      <div style={{ background: '#003087', borderBottom: '4px solid #FF9933' }}>
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 rounded" style={{ background: '#FF9933' }} />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
              Civic Grievances
            </h1>
          </div>
          <p className="text-white/60 text-sm ml-4">
            नागरिक शिकायतें • Filter by election cycle and region to view and report local civic issues
          </p>
          <div className="ml-4 mt-4">
            <button
              onClick={() => setIsReporting(true)}
              className="btn-gov-accent"
            >
              <AlertOctagon className="w-4 h-4" />
              Report New Grievance
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto max-w-7xl text-xs text-gray-500">
          <span>Home</span> <span className="mx-2">›</span> <span className="text-gray-800 font-medium">Civic Grievances</span>
        </div>
      </div>

      {/* Floating Report Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setIsReporting(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-2 border-white transition-transform hover:scale-110"
          style={{ background: '#b91c1c' }}
          title="Report Grievance"
        >
          <MessageSquare className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Report Modal */}
      {isReporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsReporting(false)} />
          <div className="relative w-full max-w-lg bg-white rounded shadow-2xl overflow-hidden" style={{ borderTop: '4px solid #b91c1c' }}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>
                Report Grievance
              </h2>
              <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider">Direct channel to electoral moderators</p>

              {!selectedElection || !selectedConstituency ? (
                <div className="gov-notice mb-4">
                  <strong>Action Required:</strong> Please close this and select a target Region/Election first.
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Issue Title</label>
                    <input required type="text" placeholder="e.g. Broken streetlight in Ward 12" className="gov-input" value={newIssue.title} onChange={e => setNewIssue({ ...newIssue, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Grievance Details</label>
                    <textarea required rows={4} placeholder="Describe the impact, duration, and specific location..." className="gov-input resize-none" value={newIssue.description} onChange={e => setNewIssue({ ...newIssue, description: e.target.value })} />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setIsReporting(false)} className="flex-1 py-2.5 border border-gray-200 rounded text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button disabled={isSubmitting} className="flex-[2] py-2.5 rounded text-sm font-semibold text-white transition-colors" style={{ background: '#b91c1c' }}>
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-40" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <Globe className="inline w-3.5 h-3.5 mr-1" />Select Election Scope
              </label>
              <select
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="gov-input"
              >
                {isLoadingElections ? <option>Loading Elections...</option> : null}
                {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
            <div className={`flex-1 transition-opacity ${!selectedElection ? 'opacity-40 pointer-events-none' : ''}`}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                <MapPin className="inline w-3.5 h-3.5 mr-1" />Select Constituency
              </label>
              <select
                disabled={!selectedElection}
                value={selectedConstituency}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="gov-input"
              >
                <option value="">Select Constituency...</option>
                {constituencies.map(c => <option key={c._id} value={c._id}>{c.name} ({c.state})</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Issues Feed */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {!selectedElection || !selectedConstituency ? (
          <div className="bg-white border border-gray-200 rounded p-16 text-center" style={{ borderTop: '3px solid #003087' }}>
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-200" />
            <h3 className="text-lg font-semibold text-gray-500 mb-1" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>Scope Required</h3>
            <p className="text-sm text-gray-400">Select an election scope and constituency to view reported grievances.</p>
          </div>
        ) : isLoadingIssues ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-28 bg-white border border-gray-200 rounded animate-pulse" />)}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-12 text-center" style={{ borderTop: '3px solid #138808' }}>
            <Info className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-semibold text-gray-500">No issues reported in this constituency.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {issues.map((issue) => (
              <div key={issue._id} className="gov-card gov-card-saffron p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base" style={{ fontFamily: 'Noto Serif, Georgia, serif' }}>{issue.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Audit ID: {issue._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 ml-3" style={{ color: '#FF9933' }} />
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">"{issue.description}"</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> 2.4k</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 12 Comments</span>
                  </div>
                  <button className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded border transition-colors" style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fff5f5' }}>
                    Evidence Review <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
