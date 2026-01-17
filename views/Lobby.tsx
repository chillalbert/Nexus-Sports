
import React, { useState, useEffect, useRef } from 'react';
import { Match, Message, UserCategory, User } from '../types';
import { safetyGuardian } from '../services/gemini';

interface LobbyProps {
  match: Match;
  onClose: () => void;
  role: UserCategory;
}

const Lobby: React.FC<LobbyProps> = ({ match, onClose, role }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [boosts, setBoosts] = useState({ doubleCoins: false, expShield: false, winStreak: false, reliability: false });
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    
    // Initial system message
    setMessages([{
      id: 'sys-1',
      senderId: 'system',
      senderName: 'NEXUS SYSTEM',
      text: `Lobby created for ${match.sport}. Waiting for participants to lock boosts.`,
      timestamp: new Date().toISOString()
    }]);
  }, [match]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      senderId: 'me',
      senderName: currentUser?.username || 'Me',
      text: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setIsScanning(true);

    const safety = await safetyGuardian(currentInput);
    if (!safety.isSafe) {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, isFlagged: true, text: '🚫 Message blocked: PII/Safety violation detected.' } : m
      ));
    }
    setIsScanning(false);

    // Simulated automated response for interactivity
    if (safety.isSafe) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          senderId: 'other',
          senderName: 'DribbleKing',
          text: 'Sounds good. Locking my double coins boost now.',
          timestamp: new Date().toISOString()
        }]);
      }, 1500);
    }
  };

  const isAdmin = currentUser?.isAdmin;

  const toggleBoost = (type: keyof typeof boosts) => {
    if (isReady) return;
    setBoosts(prev => {
      // Non-admins can only have one active boost
      if (!isAdmin) {
        return { doubleCoins: false, expShield: false, winStreak: false, reliability: false, [type]: !prev[type] };
      }
      // Admins can stack everything
      return { ...prev, [type]: !prev[type] };
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-md mx-auto border-x border-zinc-900 animate-in slide-in-from-bottom duration-500 shadow-[0_0_100px_rgba(0,0,0,0.9)]">
      <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-900">
        <button onClick={onClose} className="text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">← Exit</button>
        <h2 className="font-black italic text-sm tracking-tighter uppercase text-emerald-400">Match Lobby</h2>
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-zinc-800'}`}></div>
          <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl drop-shadow-lg">🏟️</span>
            <div>
              <h3 className="text-white font-black uppercase text-[10px] tracking-widest leading-none">{match.sport}</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Confirmed Venue</p>
            </div>
          </div>
          <div className="bg-black/50 p-4 rounded-2xl mb-6 border border-zinc-800/50">
             <p className="text-xs text-zinc-300 leading-relaxed">
               Location: <span className="text-white font-black italic">{isRevealed ? (match.venueName || 'Riverside Park North') : '•••••••• •••• •••••'}</span><br/>
               Handshake ID: <span className="text-emerald-400 font-mono font-bold tracking-widest">NX-8821</span>
             </p>
          </div>
          <button 
            onClick={() => setIsRevealed(true)}
            className={`w-full font-black py-3 rounded-2xl text-[10px] tracking-widest uppercase shadow-xl transition-all active:scale-95 ${
              isRevealed ? 'bg-zinc-800 text-emerald-400 border border-emerald-500/30 cursor-default' : 'bg-emerald-500 text-black shadow-emerald-500/20'
            }`}
          >
            {isRevealed ? '✓ NAVIGATION UNLOCKED' : 'UNLOCK PRECISE LOCATION'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Combat Boosters</h3>
             {isAdmin && <span className="text-[7px] bg-emerald-400 text-black px-1.5 py-0.5 rounded font-black uppercase shadow-[0_0_10px_rgba(52,211,153,0.5)]">Admin Master</span>}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={isReady}
              onClick={() => toggleBoost('doubleCoins')}
              className={`p-5 rounded-[1.8rem] border flex flex-col items-center gap-2 transition-all ${
                boosts.doubleCoins ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-2xl">🪙</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">Double XP</span>
            </button>
            <button 
              disabled={isReady}
              onClick={() => toggleBoost('expShield')}
              className={`p-5 rounded-[1.8rem] border flex flex-col items-center gap-2 transition-all ${
                boosts.expShield ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-2xl">🛡️</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">ELO Shield</span>
            </button>

            {isAdmin && (
              <>
                <button 
                  onClick={() => toggleBoost('winStreak')}
                  className={`p-5 rounded-[1.8rem] border flex flex-col items-center gap-2 transition-all ${
                    boosts.winStreak ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-2xl">🔥</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">10x Multi</span>
                </button>
                <button 
                  onClick={() => toggleBoost('reliability')}
                  className={`p-5 rounded-[1.8rem] border flex flex-col items-center gap-2 transition-all ${
                    boosts.reliability ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span className="text-2xl">⚡</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Insta-Rep</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex justify-center">
            <span className="bg-zinc-950 text-[8px] text-zinc-600 px-4 py-1 rounded-full uppercase font-black tracking-widest border border-zinc-900 shadow-inner">Encrypted Channel • Monitoring Active</span>
          </div>
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.senderId === 'me' ? 'items-end' : m.senderId === 'system' ? 'items-center w-full' : 'items-start'}`}>
              {m.senderId !== 'system' && (
                <div className="flex gap-2 mb-1 px-1">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">{m.senderName}</span>
                </div>
              )}
              <div className={`px-5 py-3 rounded-[1.5rem] text-xs max-w-[85%] shadow-lg ${
                m.senderId === 'system' ? 'bg-zinc-900/30 border border-zinc-800/50 text-zinc-500 text-center italic w-full' :
                m.isFlagged ? 'bg-red-500/10 border border-red-500/30 text-red-400 italic' : 
                m.senderId === 'me' ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-white'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isScanning && <div className="text-[10px] text-emerald-400/50 italic animate-pulse px-2">Guardian scanning...</div>}
        </div>
      </div>

      <div className="p-6 bg-zinc-950 border-t border-zinc-900 space-y-4 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Athlete focus only..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-emerald-500 transition-all text-white placeholder:text-zinc-700 shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-500 text-black font-black w-14 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-90 transition-all flex items-center justify-center text-xl"
          >
            ↑
          </button>
        </div>
        
        <button 
          onClick={() => setIsReady(!isReady)}
          className={`w-full py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] transition-all border shadow-2xl active:scale-95 ${
            isReady ? 'bg-zinc-800 border-zinc-700 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white border-white text-black'
          }`}
        >
          {isReady ? '✓ ALL BOOSTS LOCKED' : 'LOCK CHALLENGE BOOSTS'}
        </button>
        
        <p className="text-[8px] text-zinc-700 text-center uppercase tracking-[0.2em] font-black leading-relaxed">
          Matches mirrored to parent dashboard<br/>
          PII / Bulling result in instant ban
        </p>
      </div>
    </div>
  );
};

export default Lobby;
