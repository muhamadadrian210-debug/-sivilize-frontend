import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  HelpCircle,
  Plus,
  Globe,
  WifiOff
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import UserProfileModal from './UserProfileModal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

const Navbar = () => {
  const { setActiveTab, notifications, user } = useStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const isOnline = useOnlineStatus();
  const [showProfile, setShowProfile] = useState(false);

  // Avatar priority: server URL > localStorage > initial
  const getAvatarSrc = (): string | null => {
    if (user?.avatarUrl) return `${API_BASE}${user.avatarUrl}`;
    const local = localStorage.getItem('sivilize_avatar');
    if (local) return local;
    return null;
  };

  const avatarSrc = getAvatarSrc();
  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <header className="hidden lg:flex h-20 bg-card/80 backdrop-blur-md border-b border-border fixed top-0 left-64 right-0 z-40 px-8 items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari proyek, AHSP, atau material..."
              className="w-full h-11 bg-background border border-border rounded-xl pl-12 pr-4 text-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Offline badge */}
          {!isOnline && (
            <span className="flex items-center gap-1.5 text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-full">
              <WifiOff size={12} />
              Offline
            </span>
          )}

          <button 
            onClick={() => setActiveTab('kalkulator')}
            className="btn-primary flex items-center gap-2 py-2"
          >
            <Plus size={18} />
            <span>Proyek Baru</span>
          </button>

          <div className="flex items-center gap-3 text-text-secondary">
            {/* Language toggle placeholder */}
            <button 
              className="hover:text-white transition-colors p-2 rounded-lg hover:bg-border"
              title="Bahasa / Language"
            >
              <Globe size={18} />
            </button>

            <button 
              onClick={() => setActiveTab('notifikasi')}
              className="hover:text-white transition-colors p-2 rounded-lg hover:bg-border relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-glow px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('manajemen')}
              className="hover:text-white transition-colors p-2 rounded-lg hover:bg-border"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className="hover:text-white transition-colors p-2 rounded-lg hover:bg-border"
            >
              <HelpCircle size={20} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors flex items-center justify-center bg-primary/20"
              title={user?.name || 'Profil'}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-black text-primary">{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showProfile && <UserProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
};

export default Navbar;
