
import React, { useState } from 'react';
import { UserCategory, User, Sport, ApplicationStatus } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');

  const handleAuth = () => {
    // Admin Credential Verification
    const isAdmin = email === 'sportssquareauthor@gmail.com' && password === 'NexusOwner';
    
    const ageDifMs = Date.now() - new Date(dob || '1995-01-01').getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    const category: UserCategory = age < 18 ? 'minor' : 'adult';

    const mockUser: User = {
      id: isAdmin ? 'admin-system-id' : `u-${Math.random().toString(36).substr(2, 6)}`,
      email: email,
      username: isAdmin ? 'NexusRoot_Admin' : (username || 'EliteAthlete'),
      dob: dob || '1995-01-01',
      ageCategory: isAdmin ? 'adult' : category,
      reliabilityScore: 100,
      coinBalance: isAdmin ? 999999 : 450,
      isVerified: true,
      friends: [],
      followers: [],
      following: [],
      isAdmin: isAdmin,
      applicationStatus: isAdmin ? 'approved' : 'none' as ApplicationStatus,
      canPostVideos: isAdmin ? true : false,
      notifications: isAdmin ? ["Admin access initialized. Root privileges granted."] : [],
      elo: {
        [Sport.BASKETBALL_1V1]: isAdmin ? 2500 : 1000,
        [Sport.FOOTBALL_3V3]: isAdmin ? 2500 : 1000,
        [Sport.SOCCER_3V3]: isAdmin ? 2500 : 1000,
        [Sport.TENNIS_1V1]: isAdmin ? 2500 : 1000,
      }
    };

    onLogin(mockUser);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10 max-w-md mx-auto relative overflow-hidden">
      {/* Immersive Cinematic Background Elements */}
      <div className="absolute top-[-15%] left-[-15%] w-[120%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />

      <div className="text-center z-10 mb-12">
        <h1 className="text-6xl font-black italic text-white mb-2 tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          NEXUS <span className="text-emerald-400">SPORTS</span>
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black leading-loose">
          Hard-Partitioned Microservices Ecosystem
        </p>
      </div>

      <div className="w-full space-y-5 bg-zinc-900/60 p-10 rounded-[3.5rem] border border-zinc-800/80 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10">
        <div className="flex justify-center mb-6">
           <div className="bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{isLogin ? 'Authentication Required' : 'Establish Profile'}</span>
           </div>
        </div>
        
        {!isLogin && (
          <div className="relative group">
            <input 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
            />
          </div>
        )}
        
        <input 
          placeholder="Elite Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
        />
        
        <input 
          type="password"
          placeholder="Security Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
        />

        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-3">Date of Birth (Safety Filter)</label>
            <input 
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
        )}

        <button 
          onClick={handleAuth}
          className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl shadow-2xl shadow-emerald-500/30 active:scale-95 transition-all mt-6 uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-400"
        >
          {isLogin ? 'ENTER LOBBY' : 'ESTABLISH LINK'}
        </button>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full text-zinc-600 text-[10px] uppercase font-black tracking-widest mt-4 hover:text-white transition-colors py-2"
        >
          {isLogin ? "No Clearance? Create One" : "Existing Credentials? Login"}
        </button>
      </div>

      <div className="mt-16 flex items-center justify-center gap-6 opacity-20 grayscale hover:opacity-50 transition-all">
         <span className="text-[10px] font-black italic tracking-widest">BASKETBALL</span>
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
         <span className="text-[10px] font-black italic tracking-widest">SOCCER</span>
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
         <span className="text-[10px] font-black italic tracking-widest">TENNIS</span>
      </div>
      
      <p className="mt-12 text-[8px] text-zinc-700 uppercase font-black tracking-[0.3em] absolute bottom-8">
        End-to-End Encrypted Ecosystem v1.4.2
      </p>
    </div>
  );
};

export default Auth;
