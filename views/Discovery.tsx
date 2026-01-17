
import React, { useState, useEffect } from 'react';
import { Sport, Match, UserCategory } from '../types';
import { findRealVenues } from '../services/gemini';

interface DiscoveryProps {
  role: UserCategory;
  onJoinMatch: (match: Match) => void;
  onCreateRequest: () => void;
  matches: Match[];
}

const Discovery: React.FC<DiscoveryProps> = ({ role, onJoinMatch, onCreateRequest, matches }) => {
  const [filterSport, setFilterSport] = useState<string>('All');
  const [realVenues, setRealVenues] = useState<any[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(0.5);
  const [hasError, setHasError] = useState(false);
  
  const filteredMatches = matches.filter(m => {
    const roleMatch = m.ageCategory === role;
    const sportMatch = filterSport === 'All' || m.sport === filterSport;
    return roleMatch && sportMatch;
  });

  const searchWithExpansion = async (sport: string, lat: number, lng: number) => {
    setIsLoadingVenues(true);
    setHasError(false);
    setRealVenues([]);
    
    // Strict incremental sequence as requested
    const radii = [0.5, 1, 5, 10, 15];
    
    for (const radius of radii) {
      setCurrentRadius(radius);
      // Wait for a natural scanning feel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const results = await findRealVenues(sport, lat, lng, radius);
      if (results && results.length > 0) {
        setRealVenues(results);
        setIsLoadingVenues(false);
        return;
      }
    }
    
    setRealVenues([]);
    setHasError(true);
    setIsLoadingVenues(false);
  };

  useEffect(() => {
    const lat = 40.7128; 
    const lng = -74.0060;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => searchWithExpansion(filterSport === 'All' ? 'Sports' : filterSport, pos.coords.latitude, pos.coords.longitude),
        () => searchWithExpansion(filterSport === 'All' ? 'Sports' : filterSport, lat, lng)
      );
    } else {
      searchWithExpansion(filterSport === 'All' ? 'Sports' : filterSport, lat, lng);
    }
  }, [filterSport]);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Sector Discovery</h2>
        <button 
          onClick={onCreateRequest}
          className="bg-emerald-500 text-black text-[10px] font-black px-4 py-2 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          + HOST CHALLENGE
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', ...Object.values(Sport)].map(sport => (
          <button
            key={sport}
            onClick={() => setFilterSport(sport)}
            className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${
              filterSport === sport ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Verified Parks</h3>
          {isLoadingVenues && (
            <span className="text-[8px] text-emerald-500 animate-pulse font-black uppercase">Scanning {currentRadius}mi...</span>
          )}
          {!isLoadingVenues && realVenues.length > 0 && (
            <span className="text-[8px] bg-zinc-900 text-zinc-500 px-2 py-1 rounded-full uppercase font-black tracking-widest">Sector Scan: {currentRadius}mi Range</span>
          )}
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar min-h-[140px]">
          {isLoadingVenues ? (
             [1,2].map(i => <div key={i} className="min-w-[240px] h-32 bg-zinc-900/50 rounded-3xl animate-pulse border border-zinc-800/50" />)
          ) : hasError || realVenues.length === 0 ? (
            <div className="w-full bg-zinc-900/20 border border-zinc-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">
                No verified match parks found within 15 miles.<br/>
                <span className="text-emerald-500/50 italic">Sector is currently silent. Try again later.</span>
              </p>
            </div>
          ) : realVenues.map((v, i) => (
            <div key={i} className="min-w-[240px] bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm group hover:border-emerald-500/40 transition-all shadow-xl">
              <h4 className="text-xs font-black italic mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{v.name}</h4>
              <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-tighter mb-5 line-clamp-1 opacity-70">{v.address}</p>
              <a href={v.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-black bg-white uppercase tracking-widest px-4 py-2.5 rounded-xl block text-center transition-all hover:bg-emerald-400">View Intel</a>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">Live Match Sector</h3>
        {filteredMatches.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2.5rem] p-12 text-center shadow-inner">
            <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest italic">No active lobbies in your range.</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-8 hover:border-emerald-500/40 transition-all group backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block border border-emerald-500/20">
                    {match.sport}
                  </span>
                  <h3 className="text-2xl font-black italic leading-none tracking-tighter">{match.isCompetitive ? 'RANKED DUEL' : 'OPEN SCRIMMAGE'}</h3>
                  <p className="text-[10px] text-zinc-500 mt-2 uppercase font-black tracking-widest">Security Clearance: {match.skillLevelReq}</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-black/40 border border-zinc-800 flex items-center justify-center font-black italic text-zinc-500 shadow-inner">
                  #{match.participants.length}
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-10 px-1 relative z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"></span>
                <span className="font-bold uppercase tracking-widest">Ground Intel • Verified Park Hub</span>
              </div>

              <div className="flex justify-between items-center relative z-10">
                <div className="flex -space-x-3">
                  {match.participants.map((p, i) => (
                    <div key={i} className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-black text-zinc-400 shadow-lg">
                      {p.substring(0,2).toUpperCase()}
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => onJoinMatch(match)}
                  className="bg-emerald-500 text-black font-black px-12 py-4 rounded-2xl text-[10px] tracking-[0.2em] uppercase transform active:scale-95 transition-all shadow-2xl hover:bg-emerald-400 shadow-emerald-500/20"
                >
                  JOIN LOBBY
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Discovery;
