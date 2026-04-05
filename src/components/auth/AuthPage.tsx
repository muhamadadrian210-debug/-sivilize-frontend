import { useState, type FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { authService } from '../../services/api';
import { useStore } from '../../store/useStore';
import { LogoCivil as CivilEngineeringLogo } from '../LogoCivil';

type AxiosLikeError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setAuthenticated } = useStore();
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Auto-fill if remember me was enabled
  useEffect(() => {
    const saved = localStorage.getItem('sivilize_remember_me');
    if (saved) {
      const { email, password } = JSON.parse(saved);
      setFormData(prev => ({ ...prev, email, password }));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authService.login({
          email: formData.email,
          password: formData.password,
          rememberMe
        });
      } else {
        response = await authService.register(formData);
      }

      if (response.success) {
        setUser(response.data);
        setAuthenticated(true);

        // Save credentials if remember me is checked
        if (isLogin && rememberMe) {
          localStorage.setItem('sivilize_remember_me', JSON.stringify({
            email: formData.email,
            password: formData.password
          }));
        } else if (isLogin) {
          // Clear if unchecked
          localStorage.removeItem('sivilize_remember_me');
        }
      }
    } catch (err: unknown) {
      console.error('Auth error:', err);
      const axiosErr = err as AxiosLikeError;
      const message = axiosErr.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-glow mb-4 text-white">
            <CivilEngineeringLogo size={40} variant="icon" className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">SIVILIZE HUB PRO</h1>
          <p className="text-text-secondary mt-2">Platform Teknik Sipil Berbasis AI</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <div className="flex gap-4 mb-8 bg-background p-1 rounded-xl border border-border">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-primary text-white shadow-glow' : 'text-text-secondary'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-primary text-white shadow-glow' : 'text-text-secondary'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-text-secondary uppercase font-bold">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                    placeholder="Engineer Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-text-secondary uppercase font-bold">Email Proyek</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                  placeholder="engineer@sivilize.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-text-secondary uppercase font-bold">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center gap-2 pt-2">
                <input 
                  id="remember-me"
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-background border border-border rounded cursor-pointer accent-primary"
                />
                <label htmlFor="remember-me" className="text-xs text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
                  Ingat email dan password saya
                </label>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20 leading-relaxed">{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Masuk ke Platform' : 'Daftar Sekarang'}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
