
import React, { useState } from 'react';
import { UserCategory } from '../types';

interface TournamentProps {
  role: UserCategory;
}

const TournamentView: React.FC<TournamentProps> = ({ role }) => {
  const [isEnrolled, setIsEnrolled] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-emerald-500/20 border border-emerald-500/50 p-8 rounded-[2rem] text-center shadow-[0_0_30px_rgba(52,211,153,0.1)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="text-6xl">🏆</span>
        </div>
        <h2 className="text-2xl font-black italic mb-2 tracking-tighter uppercase relative z-10">SPRING ARENA 2024</h2>
        <div className="h-1 w-12 bg-emerald-400 mx-auto mb-4 rounded-full relative z-10"></div>
        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] relative z-10">
          {isEnrolled ? '✓ YOU ARE REGISTERED' : 'Registration closes in 4 Days'}
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Regional Hub: Manhattan North</h3>
        <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-between shadow-inner relative group overflow-hidden">
          <div className={`space-y-6 transition-all duration-500 ${isEnrolled ? 'opacity-100 scale-100' : 'opacity-20 grayscale pointer-events-none'}`}>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest">Quarter Finals</span>
              <span className="text-[10px] text-emerald-400 font-bold">SCHEDULING...</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 text-center text-[10px] font-black tracking-widest italic">STRIKE_99</div>
              <div className="text-[10px] font-black italic text-zinc-600">VS</div>
              <div className="flex-1 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 text-center text-[10px] font-black tracking-widest italic">B_BALLER</div>
            </div>
            <div className="flex items-center justify-between gap-4 opacity-50">
              <div className="flex-1 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 text-center text-[10px] font-black tracking-widest italic">KOBE_FAN</div>
              <div className="text-[10px] font-black italic text-zinc-600">VS</div>
              <div className="flex-1 bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 text-center text-[10px] font-black tracking-widest italic">PRO_TEACH</div>
            </div>
            <div className="flex justify-center pt-8">
               <div className="w-40 h-24 border-2 border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center font-black relative overflow-hidden group/final">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover/final:bg-emerald-500/10 transition-colors"></div>
                  <span className="relative z-10 text-[9px] text-zinc-500 tracking-[0.3em] uppercase">Grand Finals</span>
                  <span className="relative z-10 text-emerald-400 text-xl italic mt-1">1,000 COINS</span>
               </div>
            </div>
          </div>
          {!isEnrolled && (
            <div className="absolute inset-0 flex items-center justify-center p-12 text-center pointer-events-none">
              <p className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-loose">
                Enroll now to see the regional bracket and secure your seeding based on ELO.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {!isEnrolled ? (
        <button 
          onClick={() => setIsEnrolled(true)}
          className="w-full bg-white text-black font-black py-5 rounded-[2rem] text-xs tracking-[0.3em] uppercase active:scale-95 transition-all shadow-2xl hover:bg-emerald-400"
        >
          ENROLL IN ARENA
        </button>
      ) : (
        <div className="text-center p-6 border border-zinc-800 border-dashed rounded-[2rem]">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Seeding process initiated. Matches will be revealed on the 1st of the month.</p>
        </div>
      )}
    </div>
  );
};

export default TournamentView;
