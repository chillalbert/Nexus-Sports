
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, UserCategory, PrivateMessage } from '../types';

interface FriendsProps {
  role: UserCategory;
  currentUser: User;
  onFollowToggle: (userId: string) => void;
  allUsers: User[];
  messages: PrivateMessage[];
  onSendMessage: (receiverId: string, text: string) => void;
}

const Friends: React.FC<FriendsProps> = ({ role, currentUser, onFollowToggle, allUsers, messages, onSendMessage }) => {
  const [activeSubTab, setActiveSubTab] = useState<'friends' | 'discover' | 'messages'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Explicitly ensuring users only see their own category for safe partitioning
  const partitionedUsers = useMemo(() => 
    allUsers.filter(u => u.ageCategory === role && u.id !== currentUser.id),
    [allUsers, role, currentUser.id]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return partitionedUsers;
    return partitionedUsers.filter(u => 
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [partitionedUsers, searchQuery]);

  const followingList = useMemo(() => 
    partitionedUsers.filter(u => currentUser.following.includes(u.id)),
    [partitionedUsers, currentUser.following]
  );
  
  const discoverList = useMemo(() => 
    searchResults.filter(u => !currentUser.following.includes(u.id)),
    [searchResults, currentUser.following]
  );

  const activeConversation = useMemo(() => {
    if (!selectedChatUser) return [];
    return messages.filter(m => 
      (m.senderId === currentUser.id && m.receiverId === selectedChatUser.id) ||
      (m.senderId === selectedChatUser.id && m.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, selectedChatUser, currentUser.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation.length]);

  const handleSend = async () => {
    if (!chatInput.trim() || !selectedChatUser) return;
    setIsScanning(true);
    onSendMessage(selectedChatUser.id, chatInput);
    setChatInput('');
    setTimeout(() => setIsScanning(false), 500);
  };

  if (selectedChatUser) {
    return (
      <div className="flex flex-col h-full bg-black animate-in slide-in-from-right duration-300">
        <header className="p-6 bg-zinc-950 border-b border-zinc-900 flex items-center gap-4">
          <button onClick={() => setSelectedChatUser(null)} className="text-zinc-500 hover:text-white font-black text-xs uppercase tracking-widest">← Back</button>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black italic border border-zinc-700">
                {selectedChatUser.username.substring(0,1).toUpperCase()}
             </div>
             <div>
               <h4 className="font-black italic text-sm tracking-tighter uppercase">{selectedChatUser.username}</h4>
               <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Safe Channel Active</span>
             </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {activeConversation.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <p className="text-[10px] font-black uppercase tracking-widest italic">Channel empty. Send a packet.</p>
            </div>
          ) : (
            activeConversation.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.senderId === currentUser.id ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3.5 rounded-[1.8rem] text-xs max-w-[85%] shadow-xl ${
                  m.senderId === currentUser.id 
                    ? 'bg-emerald-500 text-black font-bold' 
                    : 'bg-zinc-900 border border-zinc-800 text-white'
                }`}>
                  {m.text}
                </div>
                <span className="text-[7px] text-zinc-700 mt-1 uppercase font-black tracking-widest px-2">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
          {isScanning && <div className="text-[9px] text-emerald-500/50 italic animate-pulse px-3">Guardian scanning...</div>}
        </div>

        <div className="p-6 bg-zinc-950 border-t border-zinc-900">
          <div className="flex gap-3">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Enter transmission..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-emerald-500 text-white shadow-inner"
            />
            <button 
              onClick={handleSend}
              className="bg-emerald-500 text-black font-black w-14 rounded-2xl shadow-xl active:scale-90 flex items-center justify-center text-xl"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="relative group">
        <input 
          type="text"
          placeholder={`Search ${role === 'adult' ? 'Adult' : 'Youth'} Athletes...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-xs text-white placeholder:text-zinc-700 outline-none focus:border-emerald-500 transition-all"
        />
      </div>

      <div className="flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800 sticky top-0 z-10 backdrop-blur-xl shadow-xl">
        <button 
          onClick={() => setActiveSubTab('friends')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'friends' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'
          }`}
        >
          SQUAD
        </button>
        <button 
          onClick={() => setActiveSubTab('discover')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'discover' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'
          }`}
        >
          RECRUIT
        </button>
        <button 
          onClick={() => setActiveSubTab('messages')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeSubTab === 'messages' ? 'bg-emerald-500 text-black shadow-lg' : 'text-zinc-500'
          }`}
        >
          COMMS
        </button>
      </div>

      {activeSubTab === 'messages' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Active Channels</h3>
            <span className="text-[9px] text-zinc-700 font-black uppercase">{followingList.length} CONNECTED</span>
          </div>

          {followingList.length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/20 rounded-[3rem] border border-zinc-800 border-dashed">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">No connections in this sector.</p>
            </div>
          ) : (
            followingList.map(user => {
              const lastMsg = messages.filter(m => (m.senderId === user.id && m.receiverId === currentUser.id) || (m.senderId === currentUser.id && m.receiverId === user.id)).pop();
              return (
                <div key={user.id} onClick={() => setSelectedChatUser(user)} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2.8rem] flex items-center justify-between group hover:border-emerald-500/40 transition-all cursor-pointer shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-zinc-800 flex items-center justify-center text-2xl font-black italic border border-zinc-700 group-hover:text-emerald-400">
                      {user.username.substring(0,1).toUpperCase()}
                    </div>
                    <div className="overflow-hidden max-w-[150px]">
                      <h4 className="font-black text-sm italic uppercase truncate">{user.username}</h4>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase truncate mt-1">
                        {lastMsg ? lastMsg.text : 'Secure link open.'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">
              {activeSubTab === 'friends' ? 'Sector Connections' : 'Global Recruiting'}
            </h3>
            <span className="text-[9px] text-zinc-700 font-black uppercase">
              {(activeSubTab === 'friends' ? followingList : discoverList).length} RESULTS
            </span>
          </div>
          
          {(activeSubTab === 'friends' ? followingList : discoverList).length === 0 ? (
            <div className="text-center py-24 bg-zinc-900/20 rounded-[3rem] border border-zinc-800 border-dashed">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Sector search returned no signatures.</p>
            </div>
          ) : (
            (activeSubTab === 'friends' ? followingList : discoverList).map(user => (
              <div key={user.id} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-[2.8rem] flex items-center justify-between group hover:border-emerald-500/40 transition-all shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.8rem] bg-zinc-800 flex items-center justify-center text-2xl font-black italic border border-zinc-700 group-hover:text-emerald-400">
                    {user.username.substring(0,1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm italic uppercase">{user.username}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">ATHLETE DNA</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => onFollowToggle(user.id)}
                    className={`px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-90 ${
                      currentUser.following.includes(user.id) 
                        ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                        : 'bg-white text-black hover:bg-emerald-400 shadow-white/5'
                    }`}
                  >
                    {currentUser.following.includes(user.id) ? 'DISCONNECT' : 'RECRUIT'}
                  </button>
                  <button 
                    onClick={() => setSelectedChatUser(user)}
                    className="px-8 py-2 rounded-2xl text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    MESSAGE
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Friends;
