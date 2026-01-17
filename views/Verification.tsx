
import React from 'react';
import { User } from '../types';

interface VerificationProps {
  pendingUsers: User[];
  onAction: (userId: string, status: 'approved' | 'declined') => void;
}

const Verification: React.FC<VerificationProps> = ({ pendingUsers, onAction }) => {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">VERIFICATION <span className="text-emerald-400">LOGS</span></h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Reviewing Upload Applications</p>
      </header>

      {pendingUsers.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2rem] p-12 text-center">
          <span className="text-4xl block mb-4 grayscale opacity-30">📂</span>
          <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest leading-loose">
            No pending applications.<br/>
            Check back later for new requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center font-black italic text-black">
                  {user.username.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold">{user.username}</h4>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{user.ageCategory} Athlete</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => onAction(user.id, 'approved')}
                  className="flex-1 bg-emerald-500 text-black font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
                >
                  Accept
                </button>
                <button 
                  onClick={() => onAction(user.id, 'declined')}
                  className="flex-1 bg-zinc-800 text-zinc-400 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 border-dashed text-center">
        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed">
          Accepting grants video upload rights.<br/>
          Declining resets status & sends notification.
        </p>
      </div>
    </div>
  );
};

export default Verification;
