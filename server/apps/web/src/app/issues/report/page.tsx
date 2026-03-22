'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReportIssuePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    issueType: 'Roads',
    location: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submission logic would go here
    console.log('Reporting issue:', formData);
    alert('Issue reported successfully!');
    router.push('/issues');
  };

  const categories = ['Roads', 'Water Supply', 'Electricity', 'Sanitation', 'Public Safety', 'Other'];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black mb-4 orange-text-gradient uppercase tracking-tight">Report Civic Issue</h1>
          <p className="text-gray-400 font-medium">Help improve your constituency by reporting local problems directly to representatives.</p>
        </header>

        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-12 border-white/5 space-y-8 shadow-2xl shadow-primary/5">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Issue Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, issueType: cat })}
                    className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                      formData.issueType === cat 
                      ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-secondary/50 border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Exact Location</label>
              <input
                type="text"
                required
                placeholder="e.g. Near Metro Pillar 124, Dwarka Sector 10"
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Please provide more details about the issue..."
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Upload Evidence (Photos)</label>
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-all cursor-pointer group">
                <svg className="w-12 h-12 text-gray-500 mb-4 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-bold text-gray-400 group-hover:text-gray-200 transition-colors text-center">
                  Click to upload or drag and drop images
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-2 font-black">
                  Max 5 files • PNG, JPG, WEBP
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-5 bg-primary hover:bg-accent text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-[0.98]"
            >
              Submit Civic Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
