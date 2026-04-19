import { 
  LayoutDashboard, 
  Calculator, 
  Database, 
  BookOpen, 
  Settings, 
  LogOut,
  UserCircle,
  BarChart3,
  ShieldCheck,
  Bell,
  X,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const { activeTab, setActiveTab, userRole, logout, user, notifications } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kalkulator', label: 'Kalkulator RAB', icon: Calculator },
    { id: 'analysis', label: 'Analisis Struktur', icon: BarChart3 },
    { id: 'ahsp', label: 'AHSP Database', icon: Database },
    { id: 'buku-harian', label: 'Buku Harian', icon: BookOpen },
    { id: 'manajemen', label: 'Manajemen Proyek', icon: Settings },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Control Panel', icon: ShieldCheck }] : []),
  ];

  // Bottom nav items untuk mobile (5 item utama)
  const bottomNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kalkulator', label: 'RAB', icon: Calculator },
    { id: 'buku-harian', label: 'Harian', icon: BookOpen },
    { id: 'manajemen', label: 'Proyek', icon: Settings },
    { id: 'notifikasi', label: 'Notif', icon: Bell, badge: unreadCount },
  ];

  const handleNav = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── DESKTOP SIDEBAR (hidden di mobile) ── */}
      <div className="hidden lg:flex w-64 h-screen bg-card border-r border-border flex-col fixed left-0 top-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Sivilize Hub</h1>
            <p className="text-primary text-xs font-semibold tracking-wider uppercase">Pro Edition</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-text-secondary hover:bg-border hover:text-white"
                  )}
                >
                  <Icon size={20} className={cn(
                    "transition-colors",
                    isActive ? "text-primary" : "text-text-secondary group-hover:text-white"
                  )} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-0 w-1 h-6 bg-primary rounded-l-full shadow-glow" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border">
            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-text-secondary">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || 'Engineer'}</p>
              <p className="text-text-secondary text-xs truncate capitalize">{user?.role || userRole}</p>
            </div>
            <button onClick={() => logout()} className="text-text-secondary hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE TOP BAR ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-white font-bold text-base">Sivilize Hub Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNav('notifikasi')}
            className="relative p-2 text-text-secondary hover:text-white"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary rounded-full text-white text-[9px] font-black flex items-center justify-center px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-text-secondary hover:text-white"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full bg-card border-r border-border flex flex-col z-10">
            <div className="p-5 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Sivilize Hub</p>
                  <p className="text-primary text-[10px] font-semibold uppercase tracking-wider">Pro Edition</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-text-secondary hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-text-secondary hover:bg-border hover:text-white"
                      )}
                    >
                      <Icon size={20} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-3 bg-background rounded-xl border border-border mb-3">
                <div className="w-9 h-9 rounded-full bg-border flex items-center justify-center">
                  <UserCircle size={22} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user?.name || 'Engineer'}</p>
                  <p className="text-text-secondary text-xs truncate capitalize">{user?.role || userRole}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-card border-t border-border flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative",
                isActive ? "text-primary" : "text-text-secondary"
              )}
            >
              <div className="relative">
                <Icon size={22} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-primary rounded-full text-white text-[8px] font-black flex items-center justify-center px-0.5">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
