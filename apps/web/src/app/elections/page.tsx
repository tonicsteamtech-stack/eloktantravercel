'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ElectionItem {
  id: string;
  name: string;
}

interface ElectionCategory {
  category: string;
  items: ElectionItem[];
}

export default function ElectionsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ElectionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // const hasToken = localStorage.getItem('voting_token') || sessionStorage.getItem('voting_token');
    // if (!hasToken) {
    //   router.push('/vote');
    // }

    const fetchElections = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await fetch(`${baseUrl}/elections`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchElections();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Loading Elections Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 text-center">
            <div className="flex justify-center mb-6">
                <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    Elections Browser
                </span>
            </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4 orange-text-gradient uppercase tracking-tight leading-none">Global Elections</h1>
          <p className="text-gray-400 font-medium text-sm md:text-xl max-w-2xl mx-auto">
            Explore democratic processes and view candidates for each verified election.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No elections found.</div>
        ) : (
          categories.map((cat, idx) => (
            <section key={idx} className="mb-20">
              <div className="flex items-center space-x-4 mb-8">
                  <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">{cat.category}</h2>
                  <div className="h-1 flex-grow bg-gradient-to-r from-primary/50 to-transparent rounded-full opacity-20" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cat.items.map(election => (
                    <div key={election.id} className="group glass-card overflow-hidden transition-all duration-300 sm:hover:-translate-y-2 border-white/5 hover:border-primary/20 flex flex-col cursor-pointer" onClick={() => router.push(`/elections/${election.id}`)}>
                      <div className="p-6 md:p-8 flex-grow flex items-center h-full min-h-[160px]">
                        <h2 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{election.name}</h2>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="w-full py-4 text-center font-black uppercase tracking-widest transition-all text-xs bg-secondary/50 text-gray-400 group-hover:text-white border-t border-white/5 group-hover:bg-primary group-hover:border-primary">
                          View Candidates →
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
