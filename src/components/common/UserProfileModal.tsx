import { useState } from 'react';
import { X, User, Mail, Lock, Save, Camera, CheckCircle2, Database } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { authService } from '../../services/api';
import { useToast } from './Toast';
import BackupRestorePanel from '../settings/BackupRestorePanel';

interface UserProfileModalProps {
  onClose: () => void;
}

const UserProfileModal = ({ onClose }: UserProfileModalProps) => {
  const { user, setUser, updateUserAvatar } = useStore();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'profile' | 'password' | 'backup'>('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    user?.avatarUrl
      ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${user.avatarUrl}`
      : localStorage.getItem('sivilize_avatar') || ''
  );

  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Foto maksimal 2MB', 'warning'); return; }
    if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar', 'warning'); return; }

    // Preview lokal dulu
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload ke server
    try {
      const response = await authService.uploadAvatar(file);
      if (response.success && response.data?.avatarUrl) {
        updateUserAvatar(response.data.avatarUrl);
        localStorage.setItem('sivilize_avatar', avatarPreview);
        showToast('Foto profil diperbarui', 'success');
      }
    } catch {
      // Fallback: simpan ke localStorage saja
      const reader2 = new FileReader();
      reader2.onload = ev => {
        const result = ev.target?.result as string;
        localStorage.setItem('sivilize_avatar', result);
        showToast('Foto profil diperbarui (lokal)', 'success');
      };
      reader2.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.updateProfile({ name: profileData.name, email: profileData.email });
      if (response.success) {
        setUser({ ...user!, name: response.data.name, email: response.data.email });
        showToast('Profil berhasil diperbarui', 'success');
      }
    } catch {
      showToast('Gagal memperbarui profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Password baru tidak cocok', 'warning'); return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast('Password minimal 8 karakter', 'warning'); return;
    }
    setLoading(true);
    try {
      await authService.updateProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password berhasil diubah', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      showToast('Password lama salah atau terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Profil Saya</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-white"><X size={20} /></button>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary overflow-hidden flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-colors">
              <Camera size={12} className="text-white" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="text-white font-bold">{user?.name}</p>
            <p className="text-text-secondary text-xs">{user?.email}</p>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-background p-1 rounded-xl border border-border">
          <button onClick={() => setTab('profile')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'profile' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
            Edit Profil
          </button>
          <button onClick={() => setTab('password')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'password' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
            Ubah Password
          </button>
          <button onClick={() => setTab('backup')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'backup' ? 'bg-primary text-white' : 'text-text-secondary'}`}>
            <Database size={13} className="inline mr-1" />Backup
          </button>
        </div>

        {tab === 'profile' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary uppercase font-bold">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary uppercase font-bold">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none" />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Simpan Perubahan</>}
            </button>
          </div>
        )}

        {tab === 'password' && (
          <div className="space-y-4">
            {[
              { label: 'Password Lama', key: 'currentPassword', placeholder: '••••••••' },
              { label: 'Password Baru', key: 'newPassword', placeholder: 'Min. 8 karakter' },
              { label: 'Konfirmasi Password Baru', key: 'confirmPassword', placeholder: 'Ulangi password baru' },
            ].map(field => (
              <div key={field.key} className="space-y-1">
                <label className="text-xs text-text-secondary uppercase font-bold">{field.label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input type="password" value={passwordData[field.key as keyof typeof passwordData]}
                    onChange={e => setPasswordData({...passwordData, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary outline-none" />
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={16} /> Ubah Password</>}
            </button>
          </div>
        )}
        {tab === 'backup' && (
          <BackupRestorePanel />
        )}
      </div>
    </div>
  );
};

export default UserProfileModal;
