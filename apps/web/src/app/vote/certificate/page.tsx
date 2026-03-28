'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, Download, Home, Award, CheckCircle2 } from 'lucide-react';

function CertificateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const electionName = searchParams?.get('election') || 'General Election 2024';
  const constituency = searchParams?.get('constituency') || 'National / General';
  const voteHash = searchParams?.get('hash') || '0x7a...f92b';
  const date = searchParams?.get('date') || new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', month: 'long', year: 'numeric' 
  });
  const voterId = searchParams?.get('voterId') || 'CITIZEN-XXXX-XXXX';

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 md:py-20 selection:bg-primary/10">
      
      {/* 🛠️ CONTROL PANEL (HIDDEN ON PRINT) */}
      <div className="max-w-4xl mx-auto mb-12 flex flex-wrap items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Democratic Receipt</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Verified Transaction Proof</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => router.push('/dashboard')}
                className="flex items-center px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
                <Home className="w-4 h-4 mr-2" />
                Return Home
            </button>
            
            <button 
                onClick={handleDownload}
                className="flex items-center px-8 py-3 bg-[#003087] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#001f5b] transition-all active:scale-95 shadow-xl shadow-[#003087]/20"
            >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
            </button>
        </div>
      </div>

      {/* 📜 THE CERTIFICATE (PRIME ELEMENT) */}
      <div className="max-w-4xl mx-auto bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-slate-200 overflow-hidden relative print:shadow-none print:border-none print:rounded-none">
        
        {/* Certificate Decoration */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
            <ShieldCheck className="w-[40rem] h-[40rem] rotate-12" />
        </div>

        <div className="p-10 md:p-20 relative z-10 text-center space-y-12">
            
            {/* GOI Header Styling */}
            <div className="space-y-6">
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full border border-slate-200 flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-10 h-10 text-[#003087]" />
                </div>
                <div className="space-y-2">
                    <p className="text-[11px] font-black text-[#003087] uppercase tracking-[0.4em]">eLoktantra | Government of India</p>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">Certificate <br /><span className="text-slate-400">of Acknowledgement</span></h2>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-10">
                <p className="text-slate-600 font-medium text-base md:text-lg leading-relaxed">
                    This is to formally acknowledge that the citizen associated with <br />
                    <span className="font-black text-slate-900 border-b-2 border-slate-100 px-2 uppercase tracking-widest">{voterId}</span> <br />
                    has successfully participated and recorded their vote in the:
                </p>

                {/* Election Details Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 md:p-10 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Election Identifier</p>
                        <h3 className="text-xl md:text-2xl font-black text-[#003087] uppercase tracking-tight">{electionName}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200/60">
                        <div className="text-left">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Constituency</p>
                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{constituency}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Participation Date</p>
                            <p className="font-black text-slate-900 uppercase tracking-tight text-sm">{date}</p>
                        </div>
                    </div>
                </div>

                <p className="text-slate-500 font-bold text-[11px] uppercase tracking-widest leading-loose">
                    Your democratic participation has been cryptographically secured on the <br />
                    decentralized ledger. This document serves as legitimate proof of voting parity.
                </p>
            </div>

            {/* Verification Footer */}
            <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-left space-y-2 max-w-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ledger Proof (immutable hash)</p>
                    <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        <code className="text-[11px] font-black text-slate-600 break-all leading-none">{voteHash}</code>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center p-2 mb-3 grayscale opacity-30">
                        <div className="w-full h-full border border-slate-300 border-dashed rounded flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-slate-400" />
                        </div>
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Consensus Seal</p>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="pt-8">
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.3em] max-w-md mx-auto italic">
                    Note: This document does not reveal candidate preference to ensure ballot anonymity.
                    Generated via eLoktantra Cryptographic Protocol ST-22.
                </p>
            </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .min-h-screen { padding: 0 !important; }
          .print\:hidden { display: none !important; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; border: none !important; width: 100% !important; }
          .p-10, .p-20 { padding: 40px !important; }
          .shadow-\[0_40px_100px_-20px_rgba\(0\,0\,0\,0\.1\)\] { box-shadow: none !important; }
          @page { margin: 1cm; size: auto; }
        }
      `}</style>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="text-center animate-pulse">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating Ballot Receipt...</p>
            </div>
        </div>
    }>
      <CertificateContent />
    </Suspense>
  );
}
