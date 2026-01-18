
import React, { useState } from 'react';
import { User, UserCategory } from '../types';

interface FriendsProps {
  role: UserCategory;
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  allUsers: User[];
}

const Friends: React.FC<FriendsProps> = ({ role, currentUser, onFollowToggle, allUsers }) => {
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'discover' | 'messages'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  
  const otherUsers = allUsers.filter(u => u.ageCategory === role && u.id !== currentUser.id);
  
  const filteredUsers = otherUsers.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const followingList = filteredUsers.filter(u => currentUser.following.includes(u.id));
  const discoverList = filteredUsers.filter(u => !currentUser.following.includes(u.id));

  return (
    <div className="p-4 space-y-6">
      {/* Search Header */}
      <div className="relative group">
        <input 
          type="text"
          placeholder="Search Athlete DNA..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-emerald-500 transition-all shadow-xl"
        />
        <span className="absolute right-5 top-5 text-zinc-600 font-black">🔍</span>
      </div>

      <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 sticky top-0 z-10 backdrop-blur-xl shadow-xl">
        <button 
          onClick={() => setActiveSubTab('friends')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'friends' ? 'bg-emerald-500 text-black' : 'text-zinc-500'
          }`}
        >
          SQUAD
        </button>
        <button 
          onClick={() => setActiveSubTab('discover')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'discover' ? 'bg-emerald-500 text-black' : 'text-zinc-500'
          }`}
        >
          RECRUIT
        </button>
        <button 
          onClick={() => setActiveSubTab('messages')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'messages' ? 'bg-emerald-500 text-black' : 'text-zinc-500'
          }`}
        >
          COMMS
        </button>
      </div>

      {activeSubTab === 'messages' ? (
        <div className="space-y-4">
          <div className="bg-zinc-900/50 p-16 rounded-[3rem] text-center border border-zinc-800 shadow-inner">
            <span className="text-5xl block mb-6 grayscale opacity-40">💬</span>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-loose">
              Encrypted Messaging Active<br/>
              <span className="text-emerald-500/50">Monitoring strictly professional</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest px-1">
            {activeSubTab === 'friends' ? 'Sector Connections' : 'Global Athlete Search'}
          </h3>
          
          {(activeSubTab === 'friends' ? followingList : discoverList).length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/20 rounded-[3rem] border border-zinc-800 border-dashed">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">No matching DNA profiles found.</p>
            </div>
          ) : (
            (activeSubTab === 'friends' ? followingList : discoverList).map(user => (
              <div key={user.id} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500/40 transition-all shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl font-black italic border border-zinc-700 shadow-inner group-hover:text-emerald-400 transition-colors">
                    {user.username.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm italic tracking-tight uppercase">{user.username}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Lv. {Math.floor(user.elo['Basketball 1v1'] / 300)} Athlete</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onFollowToggle(user.id)}
                  className={`px-8 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-90 ${
                    currentUser.following.includes(user.id) 
                      ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                      : 'bg-white text-black hover:bg-emerald-400'
                  }`}
                >
                  {currentUser.following.includes(user.id) ? 'DISCONNECT' : 'RECRUIT'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
