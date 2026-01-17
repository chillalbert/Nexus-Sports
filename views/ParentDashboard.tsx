
import React, { useState } from 'react';

const ParentDashboard: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const handleKillSwitch = () => {
    if (window.confirm("CRITICAL: This will instantly suspend the minor's account and notify regional admins. Proceed?")) {
      setIsLocked(true);
      setActiveAlert("ACCOUNT SUSPENDED - EMERGENCY PROTOCOL ACTIVE");
    }
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">GUARDIAN <span className="text-emerald-400">HUB</span></h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
             <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Monitoring: StrikeForce99</p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shadow-inner">
          🛡️
        </div>
      </header>

      {activeAlert && (
        <div className="bg-red-500 p-4 rounded-2xl animate-pulse text-center border-2 border-red-400">
          <p className="text-[10px] font-black uppercase tracking-widest text-white">{activeAlert}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 backdrop-blur-sm shadow-xl group hover:border-emerald-500/20 transition-all">
          <span className="text-2xl mb-3 block">📡</span>
          <h3 className="text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Active Match</h3>
          <p className="text-xs font-bold leading-tight">16:00 @ Central Park<br/><span className="text-emerald-400">Confirmed</span></p>
        </div>
        <div className="bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800 backdrop-blur-sm shadow-xl group hover:border-emerald-500/20 transition-all">
          <span className="text-2xl mb-3 block">👮</span>
          <h3 className="text-[9px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Safety Logs</h3>
          <p className="text-xs font-bold leading-tight">14 Clean scans<br/><span className="text-zinc-500">0 PII detections</span></p>
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Mirror Feed (Persistent Archive)</h3>
        <div className="space-y-3">
          <button className="w-full bg-zinc-900/50 p-5 rounded-[2rem] border border-emerald-500/20 text-left hover:bg-emerald-500/5 transition-all group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Match Lobby: Basket-1v1</span>
              <span className="text-[10px] text-zinc-600 font-bold">2m ago</span>
            </div>
            <p className="text-xs text-zinc-400 italic group-hover:text-zinc-200 transition-colors">"Let's go! Ready for the match." - DribbleKing</p>
          </button>
          
          <button className="w-full bg-zinc-900/50 p-5 rounded-[2rem] border border-zinc-800 text-left opacity-60 hover:opacity-100 transition-all group">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Private DM: AlexJ</span>
              <span className="text-[10px] text-zinc-600 font-bold">1h ago</span>
            </div>
            <p className="text-xs text-zinc-400 italic group-hover:text-zinc-200 transition-colors">"Gg on that win yesterday." - StrikeForce99</p>
          </button>
        </div>
      </section>

      <section className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-3xl">🚫</span>
          <div>
            <h3 className="text-red-500 font-black uppercase text-xs tracking-widest">Emergency Kill-Switch</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter mt-1">Instant Account Freeze</p>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed italic">
          Suspends all active matches, reveals hidden PII to guardians, and initiates a manual audit of recent history.
        </p>
        <button 
          onClick={handleKillSwitch}
          disabled={isLocked}
          className="w-full bg-red-600 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
        >
          {isLocked ? 'SYSTEM LOCKED' : 'SUSPEND ALL ACTIVITY'}
        </button>
      </section>
      
      <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 text-center">
         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hard-Partitioned Partition ID: NX-9981-SEC</p>
      </div>
    </div>
  );
};

export default ParentDashboard;
