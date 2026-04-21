import { useEffect, useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Dashboard from './components/dashboard/Dashboard';
import RABCalculator from './components/rab/RABCalculator';
import AHSPDatabase from './components/ahsp/AHSPDatabase';
import DailyLog from './components/daily-log/DailyLog';
import ProjectManagement from './components/rab/ProjectManagement';
import StructuralAnalysis from './components/analysis/StructuralAnalysis';
import AuthPage from './components/auth/AuthPage';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import AboutUs from './components/legal/AboutUs';
import Contact from './components/legal/Contact';
import NotificationPanel from './components/common/NotificationPanel';
import ProjectFeaturePage from './components/common/ProjectFeaturePage';
import { useStore } from './store/useStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './components/common/Toast';
import Onboarding from './components/common/Onboarding';
import AIChat from './components/common/AIChat';
import AdminDashboard from './components/admin/AdminDashboard';
import { checkTokenValidity } from './utils/security';
import PrankPage from './pages/PrankPage';
import LandingPage from './pages/LandingPage';
import ShareView from './pages/ShareView';
import { useDataSync } from './hooks/useDataSync';
import { runNotificationEngine } from './utils/notificationEngine';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const { activeTab, isAuthenticated, setAuthenticated, projects, notifications, addNotification } = useStore();
  const [showAuth, setShowAuth] = useState(false);
  useDataSync(); // Sinkronisasi data proyek dengan server

  // Tampilkan halaman prank jika URL /prank
  if (window.location.pathname === '/prank') {
    return <PrankPage />;
  }

  // Tampilkan halaman share jika URL /share/:token
  if (window.location.pathname.startsWith('/share/')) {
    return <ShareView />;
  }

  // Wake up backend saat app load (handle Vercel cold start)
  useEffect(() => {
    const wakeUpBackend = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://sivilize-backend.vercel.app'}/health`);
      } catch {
        // Ignore — ini hanya untuk wake up server
      }
    };
    wakeUpBackend();
  }, []);

  // Restore auth state from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && checkTokenValidity()) {
      setAuthenticated(true);
    } else if (token) {
      // Token ada tapi expired — auto logout
      localStorage.removeItem('token');
      setAuthenticated(false);
    }
  }, [setAuthenticated]);

  // Cek token validity setiap 5 menit
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        setAuthenticated(false);
      }
    }, 5 * 60 * 1000);

    // Listen event auto-logout dari API interceptor
    const handleAutoLogout = () => setAuthenticated(false);
    window.addEventListener('auth:logout', handleAutoLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth:logout', handleAutoLogout);
    };
  }, [isAuthenticated, setAuthenticated]);

  // Notification engine — jalankan saat authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    runNotificationEngine(projects, notifications, addNotification);
  }, [isAuthenticated, projects]);

  if (!isAuthenticated) {
    if (showAuth) {
      return <ToastProvider><AuthPage /></ToastProvider>;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'kalkulator':
        return <RABCalculator />;
      case 'ahsp':
        return <AHSPDatabase />;
      case 'buku-harian':
        return <DailyLog />;
      case 'manajemen':
        return <ProjectManagement />;
      case 'analysis':
        return <StructuralAnalysis />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'about':
        return <AboutUs />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <AdminDashboard />;
      case 'notifikasi':
        return <NotificationPanel />;
      case 'financial':
        return <ProjectFeaturePage feature="financial" />;
      case 'kurva-s':
        return <ProjectFeaturePage feature="kurva-s" />;
      case 'upah':
        return <ProjectFeaturePage feature="upah" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <LanguageProvider>
      <ToastProvider>
        <Onboarding />
        <AIChat />
        <div className="min-h-screen bg-background text-text-primary flex flex-col">
          <Sidebar />
          <Navbar />
          
          {/* Desktop: pl-64 pt-20 | Mobile: pt-14 pb-16 (top bar + bottom nav) */}
          <main className="lg:pl-64 lg:pt-20 pt-14 pb-16 lg:pb-0 transition-all duration-300 flex-1 flex flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 lg:p-8"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            <Footer />
          </main>
        </div>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;
