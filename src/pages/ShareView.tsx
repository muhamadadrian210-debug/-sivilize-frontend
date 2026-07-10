import { useEffect, useState } from 'react';
import { 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  Eye, 
  ClipboardList, 
  Camera, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { projectService } from '../services/api';
import { formatCurrency } from '../utils/calculations';
import { type RABItem } from '../store/useStore';

interface SharedProjectData {
  projectName: string;
  location: string;
  versions: Array<{
    id: string;
    versionNum: number;
    timestamp: number;
    label?: string;
    rabItems: RABItem[];
    financialSettings: {
      overhead: number;
      profit: number;
      tax: number;
      contingency: number;
    };
    summary?: {
      subtotal: number;
      overheadAmount: number;
      profitAmount: number;
      contingencyAmount: number;
      taxAmount: number;
      grandTotal: number;
    };
  }>;
  dailyLogs?: Array<{
    id: string;
    date: string;
    text: string;
    photos: string[];
    status?: 'Normal' | 'Warning' | 'Kendala';
    progressPercent?: number;
  }>;
  manualProgress?: Record<number, number>;
  startDate?: string;
  endDate?: string;
  status?: string;
  createdAt: string;
  sharedBy?: string;
}

const ShareView = () => {
  const [shareData, setShareData] = useState<SharedProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'rab' | 'progress'>('rab');

  // Baca token dari URL
  const token = window.location.pathname.split('/share/')[1] || '';

  useEffect(() => {
    if (!token) {
      setError('Link tidak valid atau sudah kedaluwarsa');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await projectService.getSharedProject(token);
        if (response.success) {
          setShareData(response.data as unknown as SharedProjectData);
        } else {
          setError('Link tidak valid atau sudah kedaluwarsa');
        }
      } catch {
        setError('Link tidak valid atau sudah kedaluwarsa');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary text-sm font-semibold">Memuat data proyek...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Eye size={32} className="text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl">Link Tidak Valid</h2>
          <p className="text-text-secondary text-sm">{error || 'Link tidak valid atau sudah kedaluwarsa'}</p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm justify-center w-full"
          >
            <ExternalLink size={15} />
            Buka Portal Utama
          </a>
        </div>
      </div>
    );
  }

  const selectedVersion = shareData.versions[selectedVersionIdx];
  const items = selectedVersion?.rabItems || [];
  const summary = selectedVersion?.summary;
  const financials = selectedVersion?.financialSettings;

  // Group items by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, RABItem[]>);

  // Hitung overall progress
  const getOverallProgress = () => {
    if (shareData.manualProgress && Object.keys(shareData.manualProgress).length > 0) {
      const keys = Object.keys(shareData.manualProgress).map(Number).sort((a, b) => b - a);
      return shareData.manualProgress[keys[0]];
    }
    if (shareData.dailyLogs && shareData.dailyLogs.length > 0) {
      const sorted = [...shareData.dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return sorted[0].progressPercent || 0;
    }
    return 0;
  };

  const overallProgress = getOverallProgress();

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'Selesai Pembangunan', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
      case 'ongoing': return { text: 'Dalam Pelaksanaan', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default: return { text: 'Perencanaan (Draft)', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    }
  };

  const statusObj = getStatusLabel(shareData.status || 'draft');

  const getPhotoUrl = (photo: string) => {
    if (photo.startsWith('data:image')) return photo;
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://sivilize-backend.vercel.app';
    return `${API_BASE}${photo}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Header */}
      <header className="bg-card/85 backdrop-blur-md border-b border-border px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-black text-xs">S</span>
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">SIVILIZE HUB PRO</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full">
          <Eye size={12} />
          Portal Owner
        </span>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Project Info Header */}
        <div className="glass-card p-6 space-y-4 border border-border/80">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 size={20} className="text-primary" />
                <h1 className="text-white font-black text-xl tracking-tight">{shareData.projectName}</h1>
                <span className={`text-[10px] font-extrabold border px-2.5 py-0.5 rounded-full tracking-wider uppercase ${statusObj.color}`}>
                  {statusObj.text}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-xs font-medium">
                <MapPin size={13} />
                <span>{shareData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-xs font-medium">
                <Calendar size={13} />
                <span>Dibuat: {new Date(shareData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              {shareData.sharedBy && (
                <p className="text-text-secondary text-[11px] font-medium">Pelaksana Proyek: <span className="text-white font-bold">{shareData.sharedBy}</span></p>
              )}
            </div>
            {summary && activeSubTab === 'rab' && (
              <div className="text-right">
                <p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest">Estimasi Anggaran</p>
                <p className="text-primary font-black text-2xl tracking-tight">{formatCurrency(summary.grandTotal)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border bg-card/40 rounded-xl overflow-hidden p-1 gap-1">
          <button
            onClick={() => setActiveSubTab('rab')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'rab'
                ? 'bg-primary text-white shadow-glow'
                : 'text-text-secondary hover:text-white hover:bg-border/30'
            }`}
          >
            <FileSpreadsheet size={14} />
            Tabel Anggaran (RAB)
          </button>
          <button
            onClick={() => setActiveSubTab('progress')}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeSubTab === 'progress'
                ? 'bg-primary text-white shadow-glow'
                : 'text-text-secondary hover:text-white hover:bg-border/30'
            }`}
          >
            <Activity size={14} />
            Laporan & Progres Harian
          </button>
        </div>

        {/* ── TAB 1: RAB TABLE ── */}
        {activeSubTab === 'rab' && (
          <>
            {/* Version Selector */}
            {shareData.versions.length > 1 && (
              <div className="glass-card p-4 border border-border">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-widest block mb-2">Pilih Revisi Anggaran</label>
                <select
                  value={selectedVersionIdx}
                  onChange={e => setSelectedVersionIdx(parseInt(e.target.value))}
                  className="h-10 bg-background border border-border rounded-xl px-3 text-white text-sm focus:border-primary outline-none"
                >
                  {shareData.versions.map((v, idx) => (
                    <option key={v.id} value={idx}>
                      Revisi v{v.versionNum} — {v.label || new Date(v.timestamp).toLocaleDateString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-4">
              {Object.entries(grouped).map(([category, catItems]) => {
                const subtotal = catItems.reduce((s, i) => s + i.total, 0);
                return (
                  <div key={category} className="glass-card overflow-hidden border border-border/50">
                    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                      <span className="text-primary font-bold text-xs uppercase tracking-widest">{category}</span>
                      <span className="text-primary font-bold text-sm">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/50 text-text-secondary text-[10px] uppercase font-bold tracking-wider">
                            <th className="text-left py-3 px-4">Uraian</th>
                            <th className="text-right py-3 px-4">Volume</th>
                            <th className="text-center py-3 px-4">Sat</th>
                            <th className="text-right py-3 px-4">Harga Satuan</th>
                            <th className="text-right py-3 px-4">Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catItems.map(item => (
                            <tr key={item.id} className="border-b border-border/30 hover:bg-white/2 transition-colors">
                              <td className="py-2.5 px-4 text-white font-medium">{item.name}</td>
                              <td className="py-2.5 px-4 text-right text-text-secondary">{item.volume.toFixed(2)}</td>
                              <td className="py-2.5 px-4 text-center text-text-secondary">{item.unit}</td>
                              <td className="py-2.5 px-4 text-right text-text-secondary">{formatCurrency(item.unitPrice)}</td>
                              <td className="py-2.5 px-4 text-right text-white font-bold">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Financial Summary */}
            {summary && financials && (
              <div className="glass-card p-6 space-y-3 border border-border">
                <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">Ringkasan Anggaran Biaya</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Subtotal Pekerjaan</span>
                    <span className="text-white font-semibold">{formatCurrency(summary.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Overhead ({financials.overhead}%)</span>
                    <span className="text-white font-semibold">{formatCurrency(summary.overheadAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Profit ({financials.profit}%)</span>
                    <span className="text-white font-semibold">{formatCurrency(summary.profitAmount)}</span>
                  </div>
                  {financials.contingency > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Contingency ({financials.contingency}%)</span>
                      <span className="text-white font-semibold">{formatCurrency(summary.contingencyAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">PPN ({financials.tax}%)</span>
                    <span className="text-white font-semibold">{formatCurrency(summary.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-3 border-t border-border/80">
                    <span className="text-white text-sm">GRAND TOTAL</span>
                    <span className="text-primary text-lg tracking-tight">{formatCurrency(summary.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB 2: PROGRESS & DAILY LOGS ── */}
        {activeSubTab === 'progress' && (
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="glass-card p-6 border border-border/80 relative overflow-hidden">
              <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest mb-3">Keseluruhan Progres Fisik</p>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="h-4 bg-border/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 shadow-glow"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary mt-2">
                    <span>Mulai Pembangunan</span>
                    <span>{overallProgress}% Selesai</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-3xl font-black text-primary tracking-tight">{overallProgress}%</span>
                </div>
              </div>

              {shareData.startDate && shareData.endDate && (
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border/50 text-xs">
                  <div>
                    <span className="text-text-secondary block">Tanggal Mulai Kontrak</span>
                    <span className="text-white font-bold mt-0.5 block">{new Date(shareData.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Estimasi Serah Terima</span>
                    <span className="text-white font-bold mt-0.5 block">{new Date(shareData.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Logs Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList size={16} className="text-primary" />
                  Buku Harian Lapangan
                </h3>
                <span className="text-[10px] text-text-secondary font-bold">
                  Total: {shareData.dailyLogs?.length || 0} Laporan
                </span>
              </div>

              {!shareData.dailyLogs || shareData.dailyLogs.length === 0 ? (
                <div className="glass-card p-8 text-center border border-border/50 space-y-2">
                  <HelpCircle size={32} className="text-text-secondary mx-auto opacity-55" />
                  <h4 className="text-white font-bold text-sm">Laporan Kosong</h4>
                  <p className="text-text-secondary text-xs">Belum ada aktivitas konstruksi harian yang dilaporkan oleh pelaksana di lapangan.</p>
                </div>
              ) : (
                <div className="relative border-l border-border/80 ml-3 space-y-6 pt-2">
                  {[...shareData.dailyLogs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log) => {
                      const logStatus = log.status || 'Normal';
                      return (
                        <div key={log.id} className="relative pl-6 group">
                          {/* Dot marker */}
                          <div className={`absolute left-0 -translate-x-[5.5px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0b0f19] shadow-glow ${
                            logStatus === 'Kendala' ? 'bg-red-500 shadow-red-500/20' :
                            logStatus === 'Warning' ? 'bg-yellow-500 shadow-yellow-500/20' :
                            'bg-green-500 shadow-green-500/20'
                          }`} />

                          {/* Log Card */}
                          <div className="glass-card p-5 border border-border/50 hover:border-primary/45 transition-colors space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <span className="text-white font-extrabold text-xs">
                                {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  logStatus === 'Kendala' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  logStatus === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                  'bg-green-500/10 text-green-400 border-green-500/20'
                                }`}>
                                  {logStatus}
                                </span>
                                {log.progressPercent !== undefined && (
                                  <span className="text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                                    Progres: {log.progressPercent}%
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-text-secondary text-xs leading-relaxed whitespace-pre-wrap">
                              {log.text}
                            </p>

                            {/* Gallery */}
                            {log.photos && log.photos.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                                {log.photos.map((photo, pIdx) => (
                                  <div key={pIdx} className="relative aspect-video rounded-lg overflow-hidden border border-border group/photo bg-black">
                                    <img 
                                      src={getPhotoUrl(photo)} 
                                      alt={`Aktivitas ${log.date}`} 
                                      className="w-full h-full object-cover group-hover/photo:scale-105 transition-transform" 
                                    />
                                    <div className="absolute bottom-1 right-1 bg-black/60 p-1 rounded text-white opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                      <Camera size={10} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="glass-card p-6 text-center space-y-3 border border-border/50">
          <p className="text-text-secondary text-sm">
            Dibuat secara sah dengan <span className="text-primary font-bold">SIVILIZE HUB PRO</span>
          </p>
          <p className="text-[10px] text-text-secondary">
            Bagian dari ekosistem digital **PT Sivilize Corp Indonesia**
          </p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm justify-center py-2.5 px-6"
          >
            <ExternalLink size={15} />
            Buka Portal Utama — Gratis
          </a>
        </div>
      </main>
    </div>
  );
};

export default ShareView;
