
import React, { useState, useEffect } from 'react';
import { UserCategory, Match, User, Sport, ApplicationStatus, DrillVideo, PrivateMessage } from './types';
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
import { safetyGuardian } from './services/gemini';

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

  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(() => {
    const saved = localStorage.getItem('nexus_private_messages');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        const latestProfile = allUsers.find(u => u.id === parsed.id) || parsed;
        
        // Re-inject admin status for the specific email
        if (latestProfile.email === 'sportssquareauthor@gmail.com') {
          latestProfile.isAdmin = true;
        }
        
        setUserProfile(latestProfile);
        if (latestProfile.ageCategory === 'parent') {
          setActiveTab('dashboard');
        }
      } catch (e) {
        localStorage.removeItem('nexus_user');
      }
    }
  }, [allUsers.length]);

  const persistUser = (user: User) => {
    setUserProfile(user);
    localStorage.setItem('nexus_user', JSON.stringify(user));
    setAllUsers(prev => {
      const exists = prev.some(u => u.id === user.id);
      const next = exists ? prev.map(u => u.id === user.id ? user : u) : [...prev, user];
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
    const updated = { ...userProfile, coinBalance: (userProfile.coinBalance || 0) + amount };
    persistUser(updated);
  };

  const handleSendPrivateMessage = async (receiverId: string, text: string) => {
    if (!userProfile) return;
    
    const msgId = `pm-${Date.now()}`;
    const newMsg: PrivateMessage = {
      id: msgId,
      senderId: userProfile.id,
      senderName: userProfile.username,
      receiverId: receiverId,
      text: text,
      timestamp: new Date().toISOString()
    };

    setPrivateMessages(prev => {
      const next = [...prev, newMsg];
      localStorage.setItem('nexus_private_messages', JSON.stringify(next));
      return next;
    });

    try {
      const safety = await safetyGuardian(text);
      if (safety && !safety.isSafe) {
        setPrivateMessages(prev => {
          const next = prev.map(m => m.id === msgId ? { ...m, isFlagged: true, text: "🚫 Redacted for safety." } : m);
          localStorage.setItem('nexus_private_messages', JSON.stringify(next));
          return next;
        });
      }
    } catch (err) {
      console.error("Safety scan failed:", err);
    }
  };

  const handleLogin = (user: User) => {
    if (user.email === 'sportssquareauthor@gmail.com') {
      user.isAdmin = true;
      user.canPostVideos = true;
      user.applicationStatus = 'approved';
    }
    
    const localRegistry = JSON.parse(localStorage.getItem('nexus_all_users') || '[]');
    const latestFromRegistry = localRegistry.find((u: User) => u.id === user.id) || user;

    persistUser(latestFromRegistry);

    if (latestFromRegistry.ageCategory === 'parent') setActiveTab('dashboard');
    else if (latestFromRegistry.isAdmin) setActiveTab('verification');
    else setActiveTab('discovery');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUserProfile(null);
    setActiveTab('discovery');
  };

  const handleApplyForVideo = () => {
    if (!userProfile) return;
    window.open(GOOGLE_FORM_URL, '_blank');
    persistUser({ 
      ...userProfile, 
      applicationStatus: 'pending',
      notifications: [...(userProfile.notifications || []), "Application submitted. Checking eligibility..."]
    });
  };

  const handleVerificationAction = (userId: string, status: 'approved' | 'declined') => {
    setAllUsers(prev => {
      const updatedList = prev.map(u => {
        if (u.id === userId) {
          const notification = status === 'approved' 
            ? "ACCESS GRANTED: Video upload unlocked!" 
            : "ACCESS DENIED: Standard not met.";
          return { ...u, applicationStatus: status as ApplicationStatus, canPostVideos: status === 'approved', notifications: [...(u.notifications || []), notification] };
        }
        return u;
      });
      localStorage.setItem('nexus_all_users', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const handleToggleFollow = (targetId: string) => {
    if (!userProfile) return;
    const isFollowing = userProfile.following.includes(targetId);
    const newFollowing = isFollowing ? userProfile.following.filter(id => id !== targetId) : [...userProfile.following, targetId];
    persistUser({ ...userProfile, following: newFollowing });
  };

  const handlePostVideo = (title: string, sport: Sport) => {
    if (!userProfile) return;
    const newVideo: DrillVideo = { id: `v-${Date.now()}`, title, author: userProfile.username, authorId: userProfile.id, videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes: 0, comments: 0, sport, popularityScore: 999999 };
    setVideos([newVideo, ...videos]);
    persistUser({ ...userProfile, notifications: [...(userProfile.notifications || []), `Video "${title}" posted.`] });
  };

  if (!userProfile) return <Auth onLogin={handleLogin} />;
  const role = userProfile.ageCategory;
  const isAdmin = userProfile.isAdmin === true || userProfile.email === 'sportssquareauthor@gmail.com';

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} role={role} user={userProfile}>
      {activeTab === 'dashboard' ? <ParentDashboard /> :
        activeTab === 'discovery' ? <Discovery role={role} onJoinMatch={(m) => setSelectedMatch(m)} onCreateRequest={() => setIsCreatingMatch(true)} matches={matches} /> :
        activeTab === 'watch' ? <WatchFeed currentUser={userProfile} videos={videos} onFollowToggle={handleToggleFollow} onPostVideo={handlePostVideo} onApply={handleApplyForVideo} /> :
        activeTab === 'friends' ? <Friends role={role} currentUser={userProfile} allUsers={allUsers} onFollowToggle={handleToggleFollow} messages={privateMessages} onSendMessage={handleSendPrivateMessage} /> :
        activeTab === 'tournament' ? <TournamentView role={role} /> :
        activeTab === 'verification' && isAdmin ? <Verification pendingUsers={allUsers.filter(u => u.applicationStatus === 'pending')} onAction={handleVerificationAction} /> :
        activeTab === 'profile' ? <div className="p-6 pb-32">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-4xl font-black italic shadow-2xl border-4 border-white/10">
              {(userProfile.username || 'NS').substring(0,2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-2">
                {userProfile.username}
                {isAdmin && <span className="text-[8px] bg-white text-black px-2 py-0.5 rounded-full tracking-widest font-black">ADMIN</span>}
              </h2>
              <p className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Athlete DNA Signature</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-left flex justify-between items-center text-red-500 font-black uppercase text-xs">Sign Out</button>
        </div> : <div className="p-10 text-center opacity-30 italic uppercase text-[10px] font-black tracking-widest">Navigation Point Void</div>
      }
      {selectedMatch && <Lobby match={selectedMatch} role={role} onClose={() => setSelectedMatch(null)} onUpdateMatch={handleUpdateMatch} onAwardCoins={handleAwardCoins} />}
      {isCreatingMatch && userProfile && <CreateMatch role={role} userId={userProfile.id} onCreate={(m) => { setMatches([m, ...matches]); setIsCreatingMatch(false); setSelectedMatch(m); }} onCancel={() => setIsCreatingMatch(false)} />}
    </Layout>
  );
};

export default App;
