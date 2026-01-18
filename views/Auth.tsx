
import React, { useState, useEffect } from 'react';
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
  const [error, setError] = useState('');

  const getAllUsers = (): User[] => {
    const saved = localStorage.getItem('nexus_all_users');
    return saved ? JSON.parse(saved) : [];
  };

  const handleAuth = () => {
    setError('');
    const allUsers = getAllUsers();
    
    if (!email || !password) {
      setError('Credentials required.');
      return;
    }

    const lowerEmail = email.toLowerCase();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === lowerEmail);

    if (isLogin) {
      if (!existingUser) {
        setError('No profile found with this email.');
        return;
      }
      onLogin(existingUser);
    } else {
      if (existingUser) {
        setError('An account with this email already exists.');
        return;
      }
      if (!username) {
        setError('Username required for DNA signature.');
        return;
      }
      if (allUsers.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('This username is already claimed.');
        return;
      }
      if (!dob) {
        setError('Date of Birth required for partitioning.');
        return;
      }

      const isAdmin = lowerEmail === 'sportssquareauthor@gmail.com' && password === 'NexusOwner';
      const ageDifMs = Date.now() - new Date(dob).getTime();
      const ageDate = new Date(ageDifMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const category: UserCategory = age < 18 ? 'minor' : 'adult';

      const newUser: User = {
        id: isAdmin ? 'admin-system-id' : `u-${Math.random().toString(36).substr(2, 6)}`,
        email: lowerEmail,
        username: username,
        dob: dob,
        ageCategory: category,
        reliabilityScore: 100,
        coinBalance: 450,
        isVerified: true,
        friends: [],
        followers: [],
        following: [],
        isAdmin: isAdmin,
        applicationStatus: isAdmin ? 'approved' : 'none',
        canPostVideos: isAdmin ? true : false,
        notifications: isAdmin ? ["Admin access initialized."] : ["Welcome to Nexus. Ready for the arena."],
        elo: {
          [Sport.BASKETBALL_1V1]: 1000,
          [Sport.FOOTBALL_3V3]: 1000,
          [Sport.SOCCER_3V3]: 1000,
          [Sport.TENNIS_1V1]: 1000,
        }
      };

      // Add to global list immediately to prevent race conditions
      const updatedList = [...allUsers, newUser];
      localStorage.setItem('nexus_all_users', JSON.stringify(updatedList));
      onLogin(newUser);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-10 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-15%] w-[120%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="text-center z-10 mb-12">
        <h1 className="text-6xl font-black italic text-white mb-2 tracking-tighter">
          NEXUS <span className="text-emerald-400">SPORTS</span>
        </h1>
        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] font-black">
          Identity Verification Hub
        </p>
      </div>

      <div className="w-full space-y-5 bg-zinc-900/60 p-10 rounded-[3.5rem] border border-zinc-800 backdrop-blur-3xl shadow-2xl relative z-10">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</p>
          </div>
        )}
        
        {!isLogin && (
          <input 
            placeholder="Athlete Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
          />
        )}
        
        <input 
          placeholder="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
        />
        
        <input 
          type="password"
          placeholder="Security Key"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-700 shadow-inner"
        />

        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-3">Date of Birth</label>
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
          className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-all mt-6 uppercase tracking-[0.2em] text-[11px]"
        >
          {isLogin ? 'OPEN CHANNEL' : 'SYNC DNA'}
        </button>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="w-full text-zinc-600 text-[10px] uppercase font-black tracking-widest mt-4 hover:text-white transition-colors py-2"
        >
          {isLogin ? "No DNA found? Register" : "Found DNA? Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
