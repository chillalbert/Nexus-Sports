
import React from 'react';
import { UserCategory, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserCategory;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role, user }) => {
  const isAdmin = user?.isAdmin === true || user?.email === 'sportssquareauthor@gmail.com';

  const getNavItems = () => {
    if (role === 'parent') {
      return [
        { id: 'dashboard', label: 'Safety', icon: '🛡️' },
        { id: 'history', label: 'History', icon: '📜' },
        { id: 'settings', label: 'Control', icon: '⚙️' }
      ];
    }
    
    const items = [
      { id: 'discovery', label: 'Find', icon: '🏟️' },
      { id: 'watch', label: 'Watch', icon: '📹' },
      { id: 'tournament', label: 'Arena', icon: '🏆' },
      { id: 'friends', label: 'Squad', icon: '👥' },
      { id: 'profile', label: 'Me', icon: '👤' }
    ];

    if (isAdmin) {
      items.push({ id: 'verification', label: 'Verify', icon: '🔍' });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative shadow-2xl overflow-hidden border-x border-zinc-900">
      <header className="px-6 py-5 flex justify-between items-center border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <h1 className="text-2xl font-black tracking-tighter italic text-emerald-400">
          NEXUS <span className="text-white">SPORTS</span>
        </h1>
        <div className="flex items-center gap-2">
           <span className="text-[9px] bg-zinc-800 px-2.5 py-1.5 rounded-lg text-zinc-400 uppercase font-black tracking-widest border border-zinc-700">
             {role}
           </span>
           {role !== 'parent' && <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
             <span className="text-[10px]">🪙</span>
             <span className="text-[10px] font-black text-emerald-400">{user?.coinBalance || 0}</span>
           </div>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth no-scrollbar">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/95 backdrop-blur-3xl border-t border-zinc-800 flex justify-around items-center py-5 px-2 z-50 shadow-[0_-10px_50px_rgba(0,0,0,0.9)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-2 transition-all duration-500 relative ${
              activeTab === item.id ? 'text-emerald-400 scale-110 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
            {activeTab === item.id && <span className="absolute -bottom-2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,1)]"></span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
