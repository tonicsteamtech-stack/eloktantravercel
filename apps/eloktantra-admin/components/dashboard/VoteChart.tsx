'use client';

const data = [
  { name: 'Modi', votes: 4000 },
  { name: 'Gandhi', votes: 3000 },
  { name: 'Kejriwal', votes: 2000 },
  { name: 'Thackeray', votes: 2780 },
  { name: 'Banerjee', votes: 1890 },
];

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function VoteChart() {
  const maxVotes = Math.max(...data.map((item) => item.votes));
  const totalVotes = data.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Real-time Vote Share</h3>
          <p className="text-xs font-medium text-gray-400">Distribution of decrypted votes across top 5 candidates</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Votes</div>
          <div className="text-2xl font-black text-gray-900">{totalVotes.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-5">
        {data.map((candidate, index) => {
          const width = `${(candidate.votes / maxVotes) * 100}%`;
          const share = ((candidate.votes / totalVotes) * 100).toFixed(1);

          return (
            <div key={candidate.name} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-black text-gray-900 truncate">{candidate.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{share}%</span>
                  <span className="text-sm font-black text-gray-700">{candidate.votes.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width, backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
