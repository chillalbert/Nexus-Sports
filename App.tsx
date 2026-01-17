
import React, { useState, useEffect } from 'react';
import { UserCategory, Match, User, Sport, ApplicationStatus, DrillVideo } from './types';
import Layout from './components/Layout';
import Discovery from './views/Discovery';
import Lobby from './views/Lobby';
import ParentDashboard from './views/ParentDashboard';
import WatchFeed from './views/WatchFeed';
import Friends from './views/Friends';
import Auth from './views/Auth';
import TechnicalBlueprint from './views/TechnicalBlueprint';
import CreateMatch from './views/CreateMatch';
import TournamentView from './views/Tournament';
import Verification from './views/Verification';
import { MOCK_MATCHES, MOCK_USERS, MOCK_VIDEOS } from './constants';

const GOOGLE_FORM_URL = "https://forms.gle/rjCy4KgTx7qPxrLZA";

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('discovery');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [isCreatingMatch, setIsCreatingMatch] = useState(false);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [videos, setVideos] = useState<DrillVideo[]>(MOCK_VIDEOS);
  
  // Global simulated user database with persistence
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUserProfile(parsed);
        if (parsed.ageCategory === 'parent') {
          setActiveTab('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('nexus_user');
      }
    }
  }, []);

  const persistUser = (user: User) => {
    setUserProfile(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    
    setAllUsers(prev => {
      const next = prev.map(u => u.id === user.id ? user : u);
      localStorage.setItem('nexus_all_users', JSON.stringify(next));
      return next;
    });
  };

  const handleLogin = (user: User) => {
    setUserProfile(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    
    setAllUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      let next;
      if (!exists) {
        next = [...prev, user];
      } else {
        next = prev.map(u => u.id === user.id ? user : u);
      }
      localStorage.setItem('nexus_all_users', JSON.stringify(next));
      return next;
    });

    const isAdmin = user.isAdmin || user.email === 'sportssquareauthor@gmail.com';
    if (user.ageCategory === 'parent') setActiveTab('dashboard');
    else if (isAdmin) setActiveTab('verification');
    else setActiveTab('discovery');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUserProfile(null);
    setActiveTab('discovery');
    setShowBlueprint(false);
  };

  const handleApplyForVideo = () => {
    if (!userProfile) return;
    window.open(GOOGLE_FORM_URL, '_blank');
    const updated = { 
      ...userProfile, 
      applicationStatus: 'pending' as ApplicationStatus,
      notifications: [...(userProfile.notifications || []), "Application submitted. Checking eligibility..."]
    };
    persistUser(updated);
  };

  const handleVerificationAction = (userId: string, status: 'approved' | 'declined') => {
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.id === userId) {
          const notification = status === 'approved' 
            ? "ACCESS GRANTED: You can now post drills to the Watch feed! 📹" 
            : "ACCESS DENIED: Your content application did not meet our pro standards.";
          
          return {
            ...u,
            applicationStatus: status as ApplicationStatus,
            canPostVideos: status === 'approved',
            notifications: [...(u.notifications || []), notification]
          };
        }
        return u;
      });
      localStorage.setItem('nexus_all_users', JSON.stringify(updatedList));
      
      if (userProfile?.id === userId) {
        const syncUser = updatedList.find(u => u.id === userId);
        if (syncUser) {
          setUserProfile(syncUser);
          localStorage.setItem('nexus_user', JSON.stringify(syncUser));
        }
      }
      return updatedList;
    });
  };

  const handleToggleFollow = (targetId: string) => {
    if (!userProfile) return;
    const isFollowing = userProfile.following.includes(targetId);
    
    const newFollowing = isFollowing 
      ? userProfile.following.filter(id => id !== targetId)
      : [...userProfile.following, targetId];
    
    const updatedMe = { ...userProfile, following: newFollowing };
    
    setAllUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userProfile.id) return updatedMe;
        if (u.id === targetId) {
          const newFollowers = isFollowing
            ? (u.followers || []).filter(id => id !== userProfile.id)
            : [...(u.followers || []), userProfile.id];
          return { ...u, followers: newFollowers };
        }
        return u;
      });
      localStorage.setItem('nexus_all_users', JSON.stringify(next));
      return next;
    });

    setUserProfile(updatedMe);
    localStorage.setItem('nexus_user', JSON.stringify(updatedMe));
  };

  const handlePostVideo = (title: string, sport: Sport) => {
    if (!userProfile) return;
    const newVideo: DrillVideo = {
      id: `v-${Date.now()}`,
      title,
      author: userProfile.username,
      authorId: userProfile.id,
      videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      likes: 0,
      comments: 0,
      sport
    };
    setVideos([newVideo, ...videos]);
    persistUser({
      ...userProfile,
      notifications: [...(userProfile.notifications || []), `Video "${title}" posted successfully!`]
    });
  };

  const handleCreateMatch = (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
    setIsCreatingMatch(false);
    setSelectedMatch(newMatch);
  };

  if (!userProfile) {
    return <Auth onLogin={handleLogin} />;
  }

  const role = userProfile.ageCategory;
  const isAdmin = userProfile.isAdmin || userProfile.email === 'sportssquareauthor@gmail.com';

  const renderContent = () => {
    if (showBlueprint) return <TechnicalBlueprint />;

    switch (activeTab) {
      case 'dashboard':
        return <ParentDashboard />;
      case 'discovery':
        return (
          <Discovery 
            role={role} 
            onJoinMatch={(m) => setSelectedMatch(m)} 
            onCreateRequest={() => setIsCreatingMatch(true)}
            matches={matches}
          />
        );
      case 'watch':
        return (
          <WatchFeed 
            currentUser={userProfile} 
            videos={videos} 
            onFollowToggle={handleToggleFollow}
            onPostVideo={handlePostVideo}
          />
        );
      case 'friends':
        return (
          <Friends 
            role={role} 
            currentUser={userProfile} 
            allUsers={allUsers}
            onFollowToggle={handleToggleFollow}
          />
        );
      case 'tournament':
        return <TournamentView role={role} />;
      case 'verification':
        return isAdmin ? (
          <Verification 
            pendingUsers={allUsers.filter(u => u.applicationStatus === 'pending')}
            onAction={handleVerificationAction}
          />
        ) : (
          <div className="p-20 text-center opacity-40 font-black uppercase text-xs">Security Clearance Insufficient</div>
        );
      case 'profile':
        return (
          <div className="p-6 space-y-8 pb-32">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-4xl font-black italic shadow-2xl border-4 border-white/10">
                {(userProfile.username || 'NS').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                  {userProfile.username}
                  {isAdmin && <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded-full not-italic tracking-widest font-black shadow-lg">ADMIN</span>}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">{role === 'parent' ? 'Guardian' : 'Elite Prospect'}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                  <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Lv. {Math.floor(userProfile.elo['Basketball 1v1'] / 300)}</span>
                </div>
              </div>
            </div>

            {role !== 'parent' && !userProfile.isAdmin && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform pointer-events-none">
                   <span className="text-6xl">📹</span>
                </div>
                <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Creator Status</h3>
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    userProfile.applicationStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                    userProfile.applicationStatus === 'pending' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                    userProfile.applicationStatus === 'declined' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-zinc-800 text-zinc-600 border border-zinc-700'
                  }`}>
                    {userProfile.applicationStatus || 'UNREGISTERED'}
                  </span>
                </div>
                
                {(!userProfile.applicationStatus || userProfile.applicationStatus === 'none' || userProfile.applicationStatus === 'declined') && (
                  <div className="relative z-10">
                    <p className="text-xs text-zinc-400 leading-relaxed italic mb-5">
                      {userProfile.applicationStatus === 'declined' 
                        ? "Your application was declined. Ensure your content meets athletic standards and re-apply."
                        : "Apply to become a verified creator and post pro drills to the global Watch feed."}
                    </p>
                    <button 
                      onClick={handleApplyForVideo}
                      className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-xl"
                    >
                      {userProfile.applicationStatus === 'declined' ? 'RE-SUBMIT APPLICATION' : 'APPLY TO POST'}
                    </button>
                  </div>
                )}
                
                {userProfile.applicationStatus === 'pending' && (
                  <div className="text-center py-4 relative z-10">
                    <p className="text-xs text-blue-400 font-black uppercase tracking-widest animate-pulse">Verification In Progress</p>
                  </div>
                )}
                
                {userProfile.applicationStatus === 'approved' && (
                  <div className="bg-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 relative z-10 text-center">
                    <p className="text-xs text-emerald-400 font-black uppercase tracking-[0.2em] mb-1 italic">✓ ELITE CREATOR ACCESS</p>
                  </div>
                )}
              </div>
            )}

            {userProfile.notifications && userProfile.notifications.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">System Alerts</h3>
                   <button onClick={() => persistUser({...userProfile, notifications: []})} className="text-[8px] text-zinc-700 font-black uppercase hover:text-white">Clear</button>
                </div>
                {userProfile.notifications.slice().reverse().map((n, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-xs text-zinc-300 italic shadow-xl flex gap-4 animate-in slide-in-from-right duration-500">
                    <span className="text-emerald-500 font-black">!</span>
                    {n}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-around bg-zinc-900/50 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-md">
              <div className="text-center group cursor-pointer">
                <p className="text-xl font-black italic group-hover:text-emerald-400 transition-colors">{userProfile.followers?.length || 0}</p>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Followers</p>
              </div>
              <div className="w-px h-8 bg-zinc-800 self-center" />
              <div className="text-center group cursor-pointer">
                <p className="text-xl font-black italic group-hover:text-emerald-400 transition-colors">{userProfile.following?.length || 0}</p>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Following</p>
              </div>
              <div className="w-px h-8 bg-zinc-800 self-center" />
              <div className="text-center">
                <p className="text-xl font-black italic group-hover:text-emerald-400 transition-colors">14</p>
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Matches</p>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-6 tracking-[0.3em]">Skill ELO DNA</h3>
              <div className="space-y-6">
                {Object.entries(userProfile.elo).map(([sport, rating]) => (
                  <div key={sport} className="flex justify-between items-center group">
                    <span className="text-[10px] font-black text-zinc-300 group-hover:text-emerald-400 uppercase tracking-tight w-24">{sport}</span>
                    <div className="flex items-center gap-4 flex-1 mx-4 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${((rating as number)/2500)*100}%` }}></div>
                    </div>
                    <span className="text-[11px] font-black italic text-emerald-400 w-10 text-right">{rating}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setShowBlueprint(!showBlueprint)}
                className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-left flex justify-between items-center group hover:border-emerald-500/30 transition-all shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🛠️</span>
                  <span className="text-[11px] font-black uppercase tracking-widest">System Architecture</span>
                </div>
                <span className="font-black text-zinc-700 group-hover:text-emerald-400">→</span>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full bg-red-500/5 border border-red-500/20 p-6 rounded-3xl text-left flex justify-between items-center group hover:bg-red-500/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">🚪</span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-red-500">Sign Out & Wipe Data</span>
                </div>
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={role} user={userProfile}>
      {renderContent()}
      
      {selectedMatch && (
        <Lobby 
          match={selectedMatch} 
          role={role} 
          onClose={() => setSelectedMatch(null)} 
        />
      )}

      {isCreatingMatch && userProfile && (
        <CreateMatch 
          role={role}
          userId={userProfile.id}
          onCreate={handleCreateMatch}
          onCancel={() => setIsCreatingMatch(false)}
        />
      )}
    </Layout>
  );
};

export default App;
