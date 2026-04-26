/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextValue {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navbar
    'nav.newProject': 'Proyek Baru',
    'nav.notifications': 'Notifikasi',
    'nav.settings': 'Pengaturan',
    'nav.help': 'Bantuan',
    'nav.offline': 'Offline',
    // Auth
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.logout': 'Keluar',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Nama Lengkap',
    'auth.forgotPassword': 'Lupa Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.sendResetLink': 'Kirim Link Reset',
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.createProject': 'Buat Proyek Baru',
    'dashboard.totalProjects': 'Total Proyek',
    'dashboard.ongoingProjects': 'Proyek Berjalan',
    'dashboard.completedProjects': 'Proyek Selesai',
    // Notifications
    'notifications.title': 'Notifikasi',
    'notifications.markAllRead': 'Tandai Semua Dibaca',
    'notifications.noNotifications': 'Tidak ada notifikasi',
    // Features
    'features.shareRAB': 'Bagikan RAB',
    'features.backup': 'Backup Data',
    'features.restore': 'Restore Data',
    'features.laborCalc': 'Kalkulator Upah',
    'features.versionCompare': 'Bandingkan Versi',
    'features.financialReport': 'Laporan Keuangan',
    'features.shareViaWA': 'Kirim via WhatsApp',
    'features.offlineMode': 'Mode Offline',
    'features.exportPDF': 'Export PDF',
    'features.exportExcel': 'Export Excel',
    'features.printExport': 'Cetak / Export',
  },
  en: {
    // Navbar
    'nav.newProject': 'New Project',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.offline': 'Offline',
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Full Name',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.resetPassword': 'Reset Password',
    'auth.sendResetLink': 'Send Reset Link',
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.createProject': 'Create New Project',
    'dashboard.totalProjects': 'Total Projects',
    'dashboard.ongoingProjects': 'Ongoing Projects',
    'dashboard.completedProjects': 'Completed Projects',
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.markAllRead': 'Mark All as Read',
    'notifications.noNotifications': 'No notifications',
    // Features
    'features.shareRAB': 'Share RAB',
    'features.backup': 'Backup Data',
    'features.restore': 'Restore Data',
    'features.laborCalc': 'Labor Calculator',
    'features.versionCompare': 'Compare Versions',
    'features.financialReport': 'Financial Report',
    'features.shareViaWA': 'Send via WhatsApp',
    'features.offlineMode': 'Offline Mode',
    'features.exportPDF': 'Export PDF',
    'features.exportExcel': 'Export Excel',
    'features.printExport': 'Print / Export',
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('sivilize_language') as Language) || 'id';
  });

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sivilize_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['id'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return ctx;
}
