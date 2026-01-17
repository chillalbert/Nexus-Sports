
import React, { useState } from 'react';
import { UserCategory } from '../types';

interface OnboardingProps {
  onComplete: (role: UserCategory, dob: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [dob, setDob] = useState('');
  const [role, setRole] = useState<UserCategory | null>(null);

  const calculateAge = (birthday: string) => {
    const ageDifMs = Date.now() - new Date(birthday).getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleNext = () => {
    if (step === 1 && dob) {
      const age = calculateAge(dob);
      if (age < 18) setRole('minor');
      else setRole('adult');
      setStep(2);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8 max-w-md mx-auto">
      <h1 className="text-4xl font-extrabold italic text-emerald-400 mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">NEXUS</h1>
      
      {step === 1 ? (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Age Verification</h2>
            <p className="text-zinc-500 text-xs uppercase tracking-widest">Required for safe partitioning</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Date of Birth</label>
            <input 
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <button 
            disabled={!dob}
            onClick={handleNext}
            className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl disabled:opacity-30 transition-all active:scale-95"
          >
            CONTINUE
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold mb-1">Welcome, Athlete</h2>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Category: {role}</p>
          </div>

          <button 
            onClick={() => onComplete(role!, dob)}
            className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-emerald-500 transition-all text-left"
          >
            <span className="text-3xl block mb-2">🏅</span>
            <h3 className="font-bold">Enter the Arena</h3>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Start matching and earning coins</p>
          </button>

          {role === 'minor' && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem]">
               <h3 className="font-bold text-emerald-400 text-sm mb-2">Guardian Consent Required</h3>
               <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-tighter">
                 By proceeding, you confirm a parent has access to the Guardian Portal to monitor match locations and mirror messages.
               </p>
            </div>
          )}

          <button 
            onClick={() => onComplete('parent', dob)}
            className="w-full border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-500 transition-all text-left"
          >
            <span className="text-3xl block mb-2">🛡️</span>
            <h3 className="font-bold text-zinc-300">Guardian Access</h3>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">Monitor child safety and audit logs</p>
          </button>
        </div>
      )}

      <p className="mt-12 text-[9px] text-zinc-600 text-center uppercase tracking-widest leading-loose font-bold max-w-[250px]">
        Nexus uses hard-partitioned databases to isolate minor data from adult environments.
      </p>
    </div>
  );
};

export default Onboarding;
