
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
  const [isRevealed, setIsRevealed] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
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
      text: `Lobby created for ${match.sport}. Handshake ID: NX-${match.id.substring(0,4).toUpperCase()}`,
      timestamp: new Date().toISOString()
    }]);
  }, [match.id, match.sport]);

  useEffect(() => {
    let timer: any;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleCancelMatch();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const handleCheckIn = (status: 'here' | 'delayed') => {
    const updatedMatch = {
      ...match,
      checkInStatus: { ...match.checkInStatus, [currentUser?.id || '']: status }
    };

    if (status === 'delayed') {
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }

    // Check if both are here (Simulated for 1v1 mock)
    // In a real app we'd wait for a socket event, here we check if total participants are 'here'
    const everyoneHere = Object.values(updatedMatch.checkInStatus).every(s => s === 'here') && match.participants.length > 1;
    
    if (everyoneHere) {
      updatedMatch.status = MatchStatus.HANDSHAKE;
    } else if (status === 'here' && match.participants.length === 1) {
      // For demo: if you are the only one and you check in, we'll simulate an opponent joining and checking in
      updatedMatch.status = MatchStatus.HANDSHAKE;
      updatedMatch.checkInStatus['opponent-sim'] = 'here';
      updatedMatch.verificationCodes['opponent-sim'] = 'ABCD12';
    }

    onUpdateMatch?.(updatedMatch);
  };

  const handleCancelMatch = () => {
    const updated = { ...match, status: MatchStatus.CANCELED };
    onUpdateMatch?.(updated);
    onClose();
  };

  const handleReportWin = () => {
    const updated = { ...match, status: MatchStatus.COMPLETED, winnerId: currentUser?.id };
    onUpdateMatch?.(updated);
    onAwardCoins?.(50);
    alert("Match Verified. 50 Coins Awarded to your DNA profile.");
    onClose();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessage: Message = { id: Math.random().toString(), senderId: 'me', senderName: currentUser?.username || 'Me', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, newMessage]);
    const currentInput = input;
    setInput('');
    setIsScanning(true);
    const safety = await safetyGuardian(currentInput);
    if (!safety.isSafe) {
      setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, isFlagged: true, text: '🚫 Safety violation detected.' } : m));
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col max-w-md mx-auto border-x border-zinc-900 animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="bg-zinc-950 p-6 flex justify-between items-center border-b border-zinc-900">
        <button onClick={onClose} className="text-zinc-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">← Exit</button>
        <h2 className="font-black italic text-sm tracking-tighter uppercase text-emerald-400">Match Lobby</h2>
        <div className="flex gap-1">
          <div className={`w-2 h-2 rounded-full ${myCheckIn === 'here' ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
        {/* Match Info Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏟️</span>
            <div>
              <h3 className="text-white font-black uppercase text-[10px] tracking-widest leading-none">{match.sport}</h3>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Status: {match.status.toUpperCase()}</p>
            </div>
          </div>
          
          {isMatchTime && match.status === MatchStatus.CREATED && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="text-center py-2">
                <p className="text-xs font-black text-white uppercase italic">Arrival Protocol Active</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase">Confirm your physical presence at the park</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => handleCheckIn('here')}
                  className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase shadow-lg hover:bg-emerald-400"
                >
                  I'm Here
                </button>
                <button 
                  onClick={() => handleCheckIn('delayed')}
                  className="flex-1 bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl text-[10px] uppercase border border-zinc-700 hover:bg-zinc-700"
                >
                  Not Here Yet
                </button>
              </div>
            </div>
          )}

          {isTimerActive && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-center">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Penalty Clock</p>
              <p className="text-2xl font-black italic text-white font-mono">{formatTime(timeLeft)}</p>
              <p className="text-[8px] text-zinc-500 mt-2 uppercase">Match cancels if clock hits zero</p>
            </div>
          )}

          {match.status === MatchStatus.HANDSHAKE && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top duration-500">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3 italic">Physical Verification Code</p>
                <div className="bg-black py-3 rounded-xl border border-zinc-800">
                  <span className="text-3xl font-black tracking-[0.3em] text-white italic">{match.verificationCodes[currentUser?.id || '']}</span>
                </div>
                <p className="text-[9px] text-zinc-500 mt-4 leading-relaxed font-bold uppercase">
                  GIVE THIS CODE TO YOUR OPPONENT<br/>
                  ASK THEM FOR THEIR CODE
                </p>
              </div>
              <button 
                onClick={() => {
                  const updated = { ...match, status: MatchStatus.IN_PROGRESS };
                  onUpdateMatch?.(updated);
                }}
                className="w-full bg-white text-black font-black py-4 rounded-2xl text-[10px] uppercase shadow-xl hover:bg-emerald-400"
              >
                Start Match
              </button>
            </div>
          )}

          {match.status === MatchStatus.IN_PROGRESS && (
            <div className="mt-4 space-y-4 text-center">
               <div className="py-4">
                  <span className="text-4xl animate-bounce inline-block">🔥</span>
                  <p className="text-xs font-black uppercase text-emerald-400 mt-2">Battle in Progress</p>
               </div>
               <button 
                 onClick={handleReportWin}
                 className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase shadow-lg"
               >
                 I Won - Report Result
               </button>
            </div>
          )}
        </div>

        {/* Chat Feed */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="flex justify-center">
            <span className="bg-zinc-950 text-[8px] text-zinc-600 px-4 py-1 rounded-full uppercase font-black tracking-widest border border-zinc-900">Encrypted Channel</span>
          </div>
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.senderId === 'me' ? 'items-end' : m.senderId === 'system' ? 'items-center w-full' : 'items-start'}`}>
              <div className={`px-5 py-3 rounded-[1.5rem] text-xs max-w-[85%] shadow-lg ${
                m.senderId === 'system' ? 'bg-zinc-900/30 text-zinc-500 text-center italic w-full border border-zinc-800' :
                m.senderId === 'me' ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-900 border border-zinc-800 text-white'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isScanning && <div className="text-[10px] text-emerald-400/50 italic animate-pulse px-2">Guardian scanning...</div>}
        </div>
      </div>

      <div className="p-6 bg-zinc-950 border-t border-zinc-900 space-y-4">
        <div className="flex gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Athlete focus only..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-xs focus:outline-none focus:border-emerald-500 text-white shadow-inner"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-emerald-500 text-black font-black w-14 rounded-2xl shadow-xl active:scale-90 flex items-center justify-center text-xl"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
