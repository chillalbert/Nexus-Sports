
import React, { useState } from 'react';
import { Sport, Match, MatchStatus, UserCategory } from '../types';
import { MOCK_VENUES } from '../constants';

interface CreateMatchProps {
  role: UserCategory;
  userId: string;
  onCreate: (match: Match) => void;
  onCancel: () => void;
}

const CreateMatch: React.FC<CreateMatchProps> = ({ role, userId, onCreate, onCancel }) => {
  const [sport, setSport] = useState<Sport>(Sport.BASKETBALL_1V1);
  const [level, setLevel] = useState(3);
  const [isCompetitive, setIsCompetitive] = useState(true);
  const [venueId, setVenueId] = useState(MOCK_VENUES[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMatch: Match = {
      id: Math.random().toString(36).substr(2, 9),
      sport,
      skillLevelReq: level,
      isCompetitive,
      venueId,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: MatchStatus.CREATED,
      ageCategory: role,
      creatorId: userId,
      participants: [userId]
    };
    onCreate(newMatch);
  };

  return (
    <div className="fixed inset-0 bg-black z-[110] flex flex-col max-w-md mx-auto animate-in fade-in slide-in-from-bottom-10 duration-300">
      <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
        <button onClick={onCancel} className="text-zinc-500 text-xs font-black uppercase tracking-widest">Cancel</button>
        <h2 className="text-sm font-black italic">CREATE NEW CHALLENGE</h2>
        <div className="w-10"></div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Sport</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(Sport).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSport(s)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  sport === s ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tight">{s}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Skill Level (1-5)</label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={`flex-1 py-4 rounded-xl font-black text-sm transition-all ${
                  level === l ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-600'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
          <div>
            <h4 className="text-sm font-bold">Competitive Mode</h4>
            <p className="text-[10px] text-zinc-500 uppercase">Affects ELO Ratings</p>
          </div>
          <button
            type="button"
            onClick={() => setIsCompetitive(!isCompetitive)}
            className={`w-14 h-8 rounded-full p-1 transition-colors ${isCompetitive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full transition-transform ${isCompetitive ? 'translate-x-6' : ''}`} />
          </button>
        </section>

        <section className="space-y-4">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Venue Cluster</label>
          <select 
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm outline-none appearance-none text-white"
          >
            {MOCK_VENUES.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
          <p className="text-[9px] text-zinc-500 italic px-1">Specific pin reveals after participants confirm.</p>
        </section>
      </form>

      <footer className="p-6 bg-zinc-950 border-t border-zinc-900">
        <button 
          onClick={handleSubmit}
          className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/10 active:scale-95 transition-all"
        >
          HOST MATCH
        </button>
      </footer>
    </div>
  );
};

export default CreateMatch;
