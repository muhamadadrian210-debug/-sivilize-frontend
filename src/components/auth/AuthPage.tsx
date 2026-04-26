import { useState, type FormEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, KeyRound, CheckCircle2, Shield } from 'lucide-react';
import { authService } from '../../services/api';
import { useStore } from '../../store/useStore';
import { LogoCivil as CivilEngineeringLogo } from '../LogoCivil';

type AxiosLikeError = {
  response?: { data?: { message?: string; resetToken?: string; resetUrl?: string; errors?: { message: string }[] } };
};

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'otp';

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setUser, setAuthenticated } = useStore();
  const [rememberMe, setRememberMe] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // OTP state
  const [otpPurpose, setOtpPurpose] = useState<'login' | 'register'>('login');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', newPassword: '', confirmPassword: '', role: 'user'
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) { setResetToken(token); setMode('reset'); }
    else if (window.location.pathname.includes('reset-password')) {
      setMode('reset'); setError('Link reset tidak valid. Silakan minta link reset baru.');
    }
    const saved = localStorage.getItem('sivilize_remember_me');
    if (saved) {
      try {
        const { email } = JSON.parse(saved);
        setFormData(prev => ({ ...prev, email }));
        setRememberMe(true);
      } catch { localStorage.removeItem('sivilize_remember_me'); }
    }
  }, []);

  // Countdown timer untuk resend OTP
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  // ── Handle OTP input ──────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digits = [...otpDigits];
    digits[index] = value.slice(-1);
    setOtpDigits(digits);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // ── Send OTP ──────────────────────────────────────────────
  const handleSendOtp = async (purpose: 'login' | 'register') => {
    // Validasi format email dulu di frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid. Contoh: nama@gmail.com');
      return;
    }
    setLoading(true); setError('');
    setSuccess('⏳ Kode OTP sedang dikirimkan ke Gmail Anda, silahkan dicek...');
    try {
      await authService.sendOtp(formData.email, purpose);
      setOtpPurpose(purpose);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setSuccess('');
      setMode('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e = err as AxiosLikeError;
      setSuccess('');
      setError(e.response?.data?.message || 'Email tidak valid atau tidak dapat menerima pesan.');
    } finally { setLoading(false); }
  };

  // ── Submit form (login/register → trigger OTP) ────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    try {
      if (mode === 'login') {
        // Verifikasi password dulu, baru kirim OTP
        const response = await authService.login({ email: formData.email, password: formData.password, rememberMe });
        if (response.success) {
          // Cek apakah user sudah pernah OTP verified sebelumnya
          const otpVerified = localStorage.getItem('sivilize_otp_verified');
          if (otpVerified === formData.email.toLowerCase()) {
            // Sudah pernah login & OTP — langsung masuk
            setUser(response.data);
            setAuthenticated(true);
            if (rememberMe) localStorage.setItem('sivilize_remember_me', JSON.stringify({ email: formData.email }));
            else localStorage.removeItem('sivilize_remember_me');
            setLoading(false);
            return;
          }
          // Belum pernah OTP atau sudah logout — wajib OTP
          if (rememberMe) localStorage.setItem('sivilize_remember_me', JSON.stringify({ email: formData.email }));
          else localStorage.removeItem('sivilize_remember_me');
          setLoading(false);
          await handleSendOtp('login');
          return;
        }
      } else if (mode === 'register') {
        // Validasi dulu, baru kirim OTP
        if (formData.password.length < 8) {
          setError('Password minimal 8 karakter'); setLoading(false); return;
        }
        setLoading(false);
        await handleSendOtp('register');
        return;
      } else if (mode === 'forgot') {
        const response = await authService.forgotPassword(formData.email);
        if (response.success) {
          if ((response.data as { resetToken?: string })?.resetToken) {
            setResetToken((response.data as { resetToken: string }).resetToken);
            setSuccess(`Link reset: ${(response.data as { resetUrl?: string }).resetUrl || ''}`);
          } else {
            setSuccess(`Email reset password telah dikirim ke ${formData.email}. Cek inbox Anda.`);
          }
        }
      } else if (mode === 'reset') {
        if (!resetToken) { setError('Link reset tidak valid.'); setLoading(false); return; }
        if (formData.newPassword !== formData.confirmPassword) { setError('Password baru tidak cocok'); setLoading(false); return; }
        if (formData.newPassword.length < 8) { setError('Password minimal 8 karakter'); setLoading(false); return; }
        const response = await authService.resetPassword(resetToken, formData.newPassword);
        if (response.success) {
          setSuccess('Password berhasil diubah!');
          setTimeout(() => { setMode('login'); setError(''); setSuccess(''); window.history.replaceState({}, '', '/'); }, 2000);
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosLikeError;
      const errData = axiosErr.response?.data;
      if (errData?.errors) setError(errData.errors.map(e => e.message).join('\n'));
      else if (!axiosErr.response) setError('Tidak ada respon dari server. Periksa koneksi internet Anda atau coba lagi beberapa saat lagi.');
      else setError(errData?.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally { setLoading(false); }
  };

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('Masukkan 6 digit OTP'); return; }
    setLoading(true); setError('');
    try {
      const response = await authService.verifyOtp({
        email: formData.email,
        otp,
        purpose: otpPurpose,
        name: otpPurpose === 'register' ? formData.name : undefined,
        password: otpPurpose === 'register' ? formData.password : undefined,
      });
      if (response.success) {
        // Simpan flag — user ini sudah OTP verified, skip OTP di login berikutnya
        localStorage.setItem('sivilize_otp_verified', formData.email.toLowerCase());
        setUser(response.data);
        setAuthenticated(true);
      }
    } catch (err: unknown) {
      const e = err as AxiosLikeError;
      setError(e.response?.data?.message || 'OTP salah atau kedaluwarsa.');
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally { setLoading(false); }
  };

  const Logo = () => (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-glow mb-4 text-white">
        <CivilEngineeringLogo size={40} variant="icon" className="text-white" />
      </div>
      <h1 className="text-3xl font-black text-white italic tracking-tighter">SIVILIZE HUB PRO</h1>
      <p className="text-text-secondary mt-2">Platform Teknik Sipil Berbasis AI</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Logo />
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass-card p-8">

            {/* ── OTP STEP ── */}
            {mode === 'otp' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield size={28} className="text-primary" />
                  </div>
                  <h2 className="text-white font-bold text-xl">Verifikasi OTP</h2>
                  <p className="text-text-secondary text-sm mt-2">
                    Kode 6 digit telah dikirim ke<br />
                    <span className="text-white font-bold">{formData.email}</span>
                  </p>
                  <p className="text-text-secondary text-xs mt-1">dari <span className="text-primary font-bold">Sivilize Corp</span></p>
                </div>

                {/* OTP Input boxes */}
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-2xl font-black bg-background border-2 rounded-xl text-white outline-none transition-all ${
                        digit ? 'border-primary shadow-glow' : 'border-border focus:border-primary'
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-xs font-bold text-center">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpDigits.join('').length < 6}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Verifikasi & Masuk</span>
                    </>
                  )}
                </button>

                <div className="text-center space-y-2">
                  {/* Tombol buka email client */}
                  <a
                    href={`https://mail.google.com/mail/u/?authuser=${encodeURIComponent(formData.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 border border-border rounded-xl text-sm text-text-secondary hover:text-white hover:border-primary/50 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 4H4C2.9 4 2 4.9 2 6v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"/>
                    </svg>
                    Buka Gmail
                  </a>

                  {otpCountdown > 0 ? (
                    <p className="text-text-secondary text-xs">Kirim ulang dalam <span className="text-white font-bold">{otpCountdown}s</span></p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp(otpPurpose)}
                      disabled={loading}
                      className="text-xs text-primary hover:text-primary/80 font-bold transition-colors"
                    >
                      Kirim ulang OTP
                    </button>
                  )}
                  <br />
                  <button
                    type="button"
                    onClick={() => { setMode(otpPurpose); setError(''); setOtpDigits(['','','','','','']); }}
                    className="text-xs text-text-secondary hover:text-white transition-colors"
                  >
                    ← Kembali
                  </button>
                </div>
              </div>
            )}

            {/* ── LOGIN / REGISTER / FORGOT / RESET ── */}
            {mode !== 'otp' && (
              <>
                {(mode === 'login' || mode === 'register') && (
                  <div className="flex gap-4 mb-8 bg-background p-1 rounded-xl border border-border">
                    <button onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary'}`}>Login</button>
                    <button onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'register' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary'}`}>Register</button>
                  </div>
                )}

                {mode === 'forgot' && (
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><KeyRound size={24} className="text-primary" /></div>
                    <h2 className="text-white font-bold text-lg">Lupa Password</h2>
                    <p className="text-text-secondary text-sm mt-1">Masukkan email untuk mendapatkan link reset</p>
                  </div>
                )}

                {mode === 'reset' && (
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><Lock size={24} className="text-primary" /></div>
                    <h2 className="text-white font-bold text-lg">Reset Password</h2>
                    <p className="text-text-secondary text-sm mt-1">Masukkan password baru Anda</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary uppercase font-bold">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all" placeholder="Nama Lengkap" />
                      </div>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary uppercase font-bold">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all" placeholder="email@contoh.com" />
                      </div>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'register') && (
                    <div className="space-y-1">
                      <label className="text-xs text-text-secondary uppercase font-bold">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                        <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all" placeholder="••••••••" />
                      </div>
                      {mode === 'register' && <p className="text-text-secondary text-[11px] mt-1">Min. 8 karakter</p>}
                    </div>
                  )}

                  {mode === 'reset' && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary uppercase font-bold">Password Baru</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                          <input type="password" required value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all" placeholder="Min. 8 karakter" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-text-secondary uppercase font-bold">Konfirmasi Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                          <input type="password" required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none transition-all" placeholder="Ulangi password baru" />
                        </div>
                      </div>
                    </>
                  )}

                  {mode === 'login' && (
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <input id="remember-me" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 bg-background border border-border rounded cursor-pointer accent-primary" />
                        <label htmlFor="remember-me" className="text-xs text-text-secondary cursor-pointer">Ingat saya</label>
                      </div>
                      <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                        className="text-xs text-primary hover:text-primary-hover transition-colors font-bold">
                        Lupa Password?
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                      <p className="text-red-500 text-xs font-bold">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-start gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                      <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                      <p className="text-green-400 text-xs font-bold break-all">{success}</p>
                    </div>
                  )}

                  {/* OTP info badge */}
                  {(mode === 'login' || mode === 'register') && (
                    <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
                      <Shield size={14} className="text-primary shrink-0" />
                      <p className="text-text-secondary text-[11px]">
                        Setelah ini, kode OTP akan dikirim ke email Anda dari <span className="text-primary font-bold">Sivilize Corp</span>
                      </p>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4 group">
                    {loading ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="text-xs text-white/70">Menghubungkan ke server...</span>
                      </div>
                    ) : (
                      <>
                        <span>
                          {mode === 'login' ? 'Lanjut ke Verifikasi OTP' :
                           mode === 'register' ? 'Daftar & Verifikasi OTP' :
                           mode === 'forgot' ? 'Kirim Link Reset' : 'Reset Password'}
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {(mode === 'forgot' || mode === 'reset') && (
                    <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                      className="w-full text-center text-xs text-text-secondary hover:text-white transition-colors mt-2">
                      ← Kembali ke Login
                    </button>
                  )}
                </form>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;
