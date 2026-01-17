
import React, { useState, useEffect, useMemo } from 'react';
import { DrillVideo, User, Sport } from '../types';

interface WatchFeedProps {
  currentUser: User;
  videos: DrillVideo[];
  onFollowToggle: (authorId: string) => void;
  onPostVideo: (title: string, sport: Sport) => void;
}

const WatchFeed: React.FC<WatchFeedProps> = ({ currentUser, videos, onFollowToggle, onPostVideo }) => {
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSport, setUploadSport] = useState<Sport>(Sport.BASKETBALL_1V1);

  // Advanced Recommendation Engine
  const rankedVideos = useMemo(() => {
    return [...videos].map(v => {
      const isFollowing = currentUser.following.includes(v.authorId);
      const isLiked = likedVideos.has(v.id);
      
      // Score-based ranking
      const followBonus = isFollowing ? 10000 : 0;
      const likeBonus = isLiked ? 500 : 0;
      const randomness = Math.floor(Math.random() * 200);
      const activityScore = (v.likes * 2) + (v.comments * 5);
      
      return { ...v, score: followBonus + likeBonus + activityScore + randomness };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [videos, currentUser.following, likedVideos]);

  const handleLike = (id: string) => {
    setLikedVideos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    onPostVideo(uploadTitle, uploadSport);
    setShowUploadModal(false);
    setUploadTitle('');
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-between items-center p-8 bg-gradient-to-b from-black/95 via-black/40 to-transparent backdrop-blur-[1px]">
        <div className="w-10"></div>
        <div className="flex gap-8">
          <button className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 hover:text-white transition-all">Squad</button>
          <button className="text-[10px] font-black uppercase tracking-[0.5em] text-white border-b-2 border-emerald-500 pb-1.5">Global</button>
        </div>
        <div>
          {currentUser.canPostVideos && (
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-10 h-10 rounded-2xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-90 transition-all"
            >
              +
            </button>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black italic uppercase mb-6 tracking-tighter">New Drill Post</h3>
            <form onSubmit={handlePostSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Drill Title</label>
                <input 
                  autoFocus
                  placeholder="e.g. Crossover Isolation Drills"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Sport Category</label>
                <select 
                  value={uploadSport}
                  onChange={(e) => setUploadSport(e.target.value as Sport)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-sm outline-none appearance-none"
                >
                  {Object.values(Sport).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 py-4 text-xs font-black uppercase text-zinc-500">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 text-black py-4 rounded-2xl text-xs font-black uppercase shadow-lg shadow-emerald-500/20">Post Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar h-full bg-zinc-950">
        {rankedVideos.length === 0 ? (
          <div className="h-full flex items-center justify-center p-12 text-center opacity-30">
            <p className="font-black uppercase tracking-widest text-xs italic">No transmissions found in this sector.</p>
          </div>
        ) : rankedVideos.map((video) => (
          <div key={video.id} className="h-full w-full snap-start relative bg-black flex items-center justify-center group overflow-hidden">
            <video 
              src={video.videoUrl} 
              className="w-full h-full object-cover opacity-90 transition-opacity duration-1000 group-hover:opacity-100" 
              loop 
              muted 
              autoPlay 
              playsInline
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-transparent to-black/30 pointer-events-none" />

            {/* Side Interaction Bar */}
            <div className="absolute bottom-32 right-4 flex flex-col items-center gap-8 z-30">
              <div className="flex flex-col items-center relative mb-4">
                <div className="w-16 h-16 rounded-3xl border-2 border-emerald-500/60 p-1 bg-black/60 backdrop-blur-3xl shadow-2xl">
                  <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center font-black italic border border-white/10 text-emerald-400 text-xl">
                    {video.author[0].toUpperCase()}
                  </div>
                </div>
                <button 
                  onClick={() => onFollowToggle(video.authorId)}
                  className={`absolute -bottom-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-[3px] border-black transition-all hover:scale-125 ${currentUser.following.includes(video.authorId) ? 'bg-zinc-800 text-emerald-500 rotate-[360deg]' : 'bg-emerald-500 text-black shadow-emerald-500/40'}`}
                >
                  {currentUser.following.includes(video.authorId) ? '✓' : '+'}
                </button>
              </div>

              <button 
                onClick={() => handleLike(video.id)} 
                className="flex flex-col items-center gap-1.5 group/btn"
              >
                <div className={`w-12 h-12 rounded-2xl backdrop-blur-3xl flex items-center justify-center transition-all duration-300 border border-white/5 ${likedVideos.has(video.id) ? 'bg-red-500 text-white scale-110 shadow-red-500/40' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  <span className={`text-2xl ${likedVideos.has(video.id) ? 'animate-bounce' : ''}`}>🔥</span>
                </div>
                <span className={`text-[10px] font-black tracking-widest ${likedVideos.has(video.id) ? 'text-red-400' : 'text-zinc-500'}`}>
                  {video.likes + (likedVideos.has(video.id) ? 1 : 0)}
                </span>
              </button>

              <button className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-3xl flex items-center justify-center text-white border border-white/5 hover:bg-white/20 transition-all">
                  <span className="text-2xl">💬</span>
                </div>
                <span className="text-[10px] font-black tracking-widest text-zinc-500">{video.comments}</span>
              </button>

              <button className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-3xl flex items-center justify-center text-white border border-white/5 hover:bg-white/20 transition-all">
                  <span className="text-2xl">🚀</span>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Share</span>
              </button>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-10 left-6 right-20 z-30 animate-in fade-in slide-in-from-left duration-1000">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-2xl font-black italic tracking-tighter drop-shadow-2xl">@{video.author}</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[7px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">Verified Elite</span>
              </div>
              <p className="text-base text-zinc-100 font-bold leading-tight drop-shadow-2xl line-clamp-2 mb-6 pr-4">
                {video.title}. Executing at tempo. #athletic #dna #nexus
              </p>
              <div className="flex items-center gap-3 bg-white/5 w-fit px-5 py-3 rounded-2xl backdrop-blur-3xl border border-white/10 shadow-2xl group/audio cursor-pointer hover:bg-white/20 transition-all">
                 <div className="w-6 h-6 rounded-full bg-zinc-950 flex items-center justify-center animate-spin-slow">
                   <span className="text-xs">🎵</span>
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">HYPER-DRILL AUDIO 09</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchFeed;
