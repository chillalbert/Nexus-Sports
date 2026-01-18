
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
  
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nexus_all_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === 'sportssquareauthor@gmail.com') {
          parsed.isAdmin = true;
          parsed.canPostVideos = true;
          parsed.applicationStatus = 'approved';
        }
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

  const handleUpdateMatch = (updated: Match) => {
    setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMatch(updated);
  };

  const handleAwardCoins = (amount: number) => {
    if (!userProfile) return;
    persistUser({ ...userProfile, coinBalance: (userProfile.coinBalance || 0) + amount });
  };

  const handleLogin = (user: User) => {
    if (user.email === 'sportssquareauthor@gmail.com') {
      user.isAdmin = true;
      user.canPostVideos = true;
      user.applicationStatus = 'approved';
    }
    setUserProfile(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    setAllUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      let next = exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
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
    persistUser({ 
      ...userProfile, 
      applicationStatus: 'pending' as ApplicationStatus,
      notifications: [...(userProfile.notifications || []), "Application submitted. Checking eligibility..."]
    });
  };

  const handleVerificationAction = (userId: string, status: 'approved' | 'declined') => {
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.id === userId) {
          const notification = status === 'approved' 
            ? "ACCESS GRANTED: You can now post drills to the Watch feed! 📹" 
            : "ACCESS DENIED: Your content application did not meet our pro standards.";
          return { ...u, applicationStatus: status as ApplicationStatus, canPostVideos: status === 'approved', notifications: [...(u.notifications || []), notification] };
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
    const newFollowing = isFollowing ? userProfile.following.filter(id => id !== targetId) : [...userProfile.following, targetId];
    const updatedMe = { ...userProfile, following: newFollowing };
    setAllUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userProfile.id) return updatedMe;
        if (u.id === targetId) {
          const newFollowers = isFollowing ? (u.followers || []).filter(id => id !== userProfile.id) : [...(u.followers || []), userProfile.id];
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
    const newVideo: DrillVideo = { id: `v-${Date.now()}`, title, author: userProfile.username, authorId: userProfile.id, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes: 0, comments: 0, sport, popularityScore: 999999 };
    setVideos([newVideo, ...videos]);
    persistUser({ ...userProfile, notifications: [...(userProfile.notifications || []), `Video "${title}" posted successfully!`] });
  };

  if (!userProfile) return <Auth onLogin={handleLogin} />;
  const role = userProfile.ageCategory;
  const isAdmin = userProfile.isAdmin || userProfile.email === 'sportssquareauthor@gmail.com';

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={role} user={userProfile}>
      {showBlueprint ? <TechnicalBlueprint /> : 
        activeTab === 'dashboard' ? <ParentDashboard /> :
        activeTab === 'discovery' ? <Discovery role={role} onJoinMatch={(m) => setSelectedMatch(m)} onCreateRequest={() => setIsCreatingMatch(true)} matches={matches} /> :
        activeTab === 'watch' ? <WatchFeed currentUser={userProfile} videos={videos} onFollowToggle={handleToggleFollow} onPostVideo={handlePostVideo} /> :
        activeTab === 'friends' ? <Friends role={role} currentUser={userProfile} allUsers={allUsers} onFollowToggle={handleToggleFollow} /> :
        activeTab === 'tournament' ? <TournamentView role={role} /> :
        activeTab === 'verification' ? <Verification pendingUsers={allUsers.filter(u => u.applicationStatus === 'pending')} onAction={handleVerificationAction} /> :
        activeTab === 'profile' ? <div className="p-6 pb-32">
          {/* Reuse profile code from previous version */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-4xl font-black italic shadow-2xl border-4 border-white/10">
              {(userProfile.username || 'NS').substring(0,2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                {userProfile.username}
                {isAdmin && <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded-full tracking-widest font-black shadow-lg">ADMIN</span>}
              </h2>
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Lv. {Math.floor(userProfile.elo['Basketball 1v1'] / 300)} Athlete</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-left flex justify-between items-center text-red-500 font-black uppercase text-xs">Sign Out 🚪</button>
        </div> : null
      }
      {selectedMatch && <Lobby match={selectedMatch} role={role} onClose={() => setSelectedMatch(null)} onUpdateMatch={handleUpdateMatch} onAwardCoins={handleAwardCoins} />}
      {isCreatingMatch && userProfile && <CreateMatch role={role} userId={userProfile.id} onCreate={(m) => { setMatches([m, ...matches]); setIsCreatingMatch(false); setSelectedMatch(m); }} onCancel={() => setIsCreatingMatch(false)} />}
    </Layout>
  );
};

export default App;
