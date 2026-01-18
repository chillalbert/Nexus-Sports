
import React, { useState, useEffect, useRef } from 'react';
import { Match, Message, UserCategory, User, MatchStatus } from '../types';
import { safetyGuardian } from '../services/gemini';

interface LobbyProps {
  match: Match;
  onClose: () => void;
  role: UserCategory;
  onUpdateMatch?: (match: Match) => void;
  onAwardCoins?: (amount: number) => void;
}

const Lobby: React.FC<LobbyProps> = ({ match, onClose, role, onUpdateMatch, onAwardCoins }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMatchTime = new Date(match.scheduledAt).getTime() <= Date.now();
  const myCheckIn = match.checkInStatus[currentUser?.id || ''] || 'none';
  
  useEffect(() => {
    const saved = localStorage.getItem('nexus_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    
    setMessages([{
      id: 'sys-1',
      senderId: 'system',
      senderName: 'NEXUS SYSTEM',
      text: `Lobby active. Ground verification required at match time.`,
      timestamp: new Date().toISOString()
    }]);
  }, [match.id]);

  useEffect(() => {
    let timer: any;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleCancelMatch();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleCheckIn = (status: 'here' | 'delayed') => {
    if (!currentUser) return;
    
    const updatedMatch = {
      ...match,
      checkInStatus: { ...match.checkInStatus, [currentUser.id]: status }
    };

    if (status === 'delayed') {
      setIsTimerActive(true);
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'SYSTEM',
        text: `User reported delay. 5-minute penalty timer initiated.`,
        timestamp: new Date().toISOString()
      }]);
    } else {
      setIsTimerActive(false);
    }

    // Logic for transitioning to Handshake
    const everyoneCheckedIn = Object.values(updatedMatch.checkInStatus).every(s => s !== 'none');
    const everyoneHere = Object.values(updatedMatch.checkInStatus).every(s => s === 'here');

    if (everyoneHere) {
      updatedMatch.status = MatchStatus.HANDSHAKE;
    } else if (everyoneCheckedIn && !everyoneHere) {
      // Keep in Check-in if someone is delayed
      updatedMatch.status = MatchStatus.CHECK_IN;
    }

    onUpdateMatch?.(updatedMatch);
  };

  const handleCancelMatch = () => {
    const updated = { ...match, status: MatchStatus.CANCELED };
    onUpdateMatch?.(updated);
    alert("Match cancelled due to no-show protocol.");
    onClose();
  };

  const handleReportWin = () => {
    if (!currentUser) return;
    const updated = { ...match, status: MatchStatus.COMPLETED, winnerId: currentUser.id };
    onUpdateMatch?.(updated);
    onAwardCoins?.(50);
    alert("Match Verified! +50 Coins awarded to your DNA.");
    onClose();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !currentUser) return;
    const newMessage: Message = { 
      id: Math.random().toString(), 
      senderId: currentUser.id, 
      senderName: currentUser.username, 
      text: input, 
      timestamp: new Date().toISOString() 
    };
    
    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setIsScanning(true);
    
    const safety = await safetyGuardian(currentInput);
    if (!safety.isSafe) {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { 
        ...m, 
        isFlagged: true, 
        text: '🚫 Content redacted for safety.' 
      } : m));
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-md mx-auto animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-900">
        <button onClick={onClose} className="text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">← Exit</button>
        <h2 className="font-black italic text-sm tracking-tighter uppercase text-emerald-400">Match Lobby</h2>
        <div className={`w-2 h-2 rounded-full ${myCheckIn === 'here' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`}></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
        {/* Arena Protocol Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🏟️</span>
            <div>
              <h3 className="text-white font-black uppercase text-[10px] tracking-widest leading-none">{match.sport}</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Status: {match.status.toUpperCase()}</p>
            </div>
          </div>
          
          {isMatchTime && (match.status === MatchStatus.CREATED || match.status === MatchStatus.CHECK_IN) && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="text-center py-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 mb-4">
                <p className="text-[10px] font-black text-emerald-400 uppercase italic">Arrival Confirmation Active</p>
                <p className="text-[9px] text-zinc-500 mt-1 uppercase">Must confirm physical presence</p>
              </div>
              
              {myCheckIn === 'none' ? (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleCheckIn('here')}
                    className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase shadow-lg active:scale-95 transition-all"
                  >
                    I'm Here
                  </button>
                  <button 
                    onClick={() => handleCheckIn('delayed')}
                    className="flex-1 bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl text-[10px] uppercase border border-zinc-700 active:scale-95 transition-all"
                  >
                    Not Here Yet
                  </button>
                </div>
              ) : (
                <div className="text-center p-4">
                   <p className="text-xs font-black text-emerald-500 uppercase italic">Waiting for opponent...</p>
                </div>
              )}
            </div>
          )}

          {isTimerActive && (
            <div className="mt-4 p-5 bg-red-500/10 border border-red-500/30 rounded-[2rem] text-center animate-pulse">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Penalty Clock</p>
              <p className="text-3xl font-black italic text-white font-mono">{formatTime(timeLeft)}</p>
              <p className="text-[8px] text-zinc-500 mt-2 uppercase italic leading-relaxed">Match terminates if participants fail to arrive before zero.</p>
            </div>
          )}

          {match.status === MatchStatus.HANDSHAKE && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-500">
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] text-center">
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 italic underline decoration-emerald-500/30">Verification Protocol</p>
                <div className="bg-black py-4 rounded-2xl border border-zinc-800 shadow-inner">
                  <span className="text-4xl font-black tracking-[0.3em] text-white italic">{match.verificationCodes[currentUser?.id || ''] || 'VERIFY'}</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-5 leading-relaxed font-bold uppercase">
                  Swap this code with your opponent.<br/>
                  <span className="text-zinc-600">Enter their code to unlock match tools.</span>
                </p>
              </div>
              <button 
                onClick={() => {
                  const updated = { ...match, status: MatchStatus.IN_PROGRESS };
                  onUpdateMatch?.(updated);
                }}
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-[10px] uppercase shadow-xl active:scale-95 transition-all hover:bg-emerald-400"
              >
                Start Match
              </button>
            </div>
          )}

          {match.status === MatchStatus.IN_PROGRESS && (
            <div className="mt-4 space-y-6 text-center animate-in zoom-in duration-500">
               <div className="py-6">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    <span className="text-4xl animate-bounce">🔥</span>
                  </div>
                  <p className="text-xs font-black uppercase text-emerald-400 tracking-widest">Active Challenge</p>
               </div>
               <button 
                 onClick={handleReportWin}
                 className="w-full bg-emerald-500 text-black font-black py-5 rounded-2xl text-[10px] uppercase shadow-2xl hover:bg-emerald-400 active:scale-95 transition-all"
               >
                 I Won - Claim 50 Coins
               </button>
            </div>
          )}
        </div>

        {/* Chat Feed */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex justify-center mb-6">
            <span className="bg-zinc-900 text-[8px] text-zinc-600 px-4 py-1.5 rounded-full uppercase font-black tracking-[0.2em] border border-zinc-800">Secure Comms Active</span>
          </div>
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.senderId === currentUser?.id ? 'items-end' : m.senderId === 'system' ? 'items-center w-full' : 'items-start'}`}>
              <div className={`px-5 py-3.5 rounded-[1.8rem] text-xs max-w-[85%] shadow-xl ${
                m.senderId === 'system' ? 'bg-zinc-900/30 text-zinc-500 text-center italic w-full border border-zinc-800' :
                m.senderId === currentUser?.id ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-white'
              }`}>
                {m.text}
              </div>
              <span className="text-[8px] text-zinc-700 mt-1 uppercase font-black tracking-widest px-2">{m.senderName}</span>
            </div>
          ))}
          {isScanning && <div className="text-[9px] text-emerald-500/50 italic animate-pulse px-3">Guardian scan in progress...</div>}
        </div>
      </div>

      <div className="p-6 bg-zinc-950 border-t border-zinc-900">
        <div className="flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Focus on the game..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-emerald-500 text-white shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-500 text-black font-black w-14 rounded-2xl shadow-xl active:scale-90 flex items-center justify-center text-xl transition-all"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
