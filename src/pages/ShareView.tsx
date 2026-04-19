import { useEffect, useState } from 'react';
import { ExternalLink, Building2, MapPin, Calendar, Eye } from 'lucide-react';
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
  createdAt: string;
  sharedBy?: string;
}

const ShareView = () => {
  const [shareData, setShareData] = useState<SharedProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-text-secondary">Memuat data RAB...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Eye size={32} className="text-red-400" />
          </div>
          <h2 className="text-white font-bold text-xl">Link Tidak Valid</h2>
          <p className="text-text-secondary text-sm">{error || 'Link tidak valid atau sudah kedaluwarsa'}</p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <ExternalLink size={15} />
            Buat RAB Anda Sendiri
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

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-black text-xs">SHP</span>
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">SIVILIZE HUB PRO</span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-full">
          <Eye size={12} />
          Read Only
        </span>
      </header>

      <main className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Project Info */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-primary" />
                <h1 className="text-white font-black text-xl">{shareData.projectName}</h1>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <MapPin size={14} />
                <span>{shareData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Calendar size={14} />
                <span>Dibuat: {new Date(shareData.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              {shareData.sharedBy && (
                <p className="text-text-secondary text-xs">Dibagikan oleh: {shareData.sharedBy}</p>
              )}
            </div>
            {summary && (
              <div className="text-right">
                <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">Grand Total</p>
                <p className="text-primary font-black text-2xl">{formatCurrency(summary.grandTotal)}</p>
              </div>
            )}
          </div>

          {/* Version Selector */}
          {shareData.versions.length > 1 && (
            <div className="pt-4 border-t border-border">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-widest block mb-2">Pilih Versi</label>
              <select
                value={selectedVersionIdx}
                onChange={e => setSelectedVersionIdx(parseInt(e.target.value))}
                className="h-10 bg-background border border-border rounded-xl px-3 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {shareData.versions.map((v, idx) => (
                  <option key={v.id} value={idx}>
                    v{v.versionNum} — {v.label || new Date(v.timestamp).toLocaleDateString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RAB Table */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, catItems]) => {
            const subtotal = catItems.reduce((s, i) => s + i.total, 0);
            return (
              <div key={category} className="glass-card overflow-hidden">
                <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex items-center justify-between">
                  <span className="text-primary font-bold text-sm uppercase tracking-widest">{category}</span>
                  <span className="text-primary font-bold text-sm">{formatCurrency(subtotal)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-4 text-text-secondary text-xs font-bold">Uraian</th>
                        <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Volume</th>
                        <th className="text-center py-2 px-4 text-text-secondary text-xs font-bold">Sat</th>
                        <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Harga Satuan</th>
                        <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.map(item => (
                        <tr key={item.id} className="border-b border-border/30 hover:bg-white/2">
                          <td className="py-2 px-4 text-white">{item.name}</td>
                          <td className="py-2 px-4 text-right text-text-secondary">{item.volume.toFixed(2)}</td>
                          <td className="py-2 px-4 text-center text-text-secondary">{item.unit}</td>
                          <td className="py-2 px-4 text-right text-text-secondary">{formatCurrency(item.unitPrice)}</td>
                          <td className="py-2 px-4 text-right text-white font-bold">{formatCurrency(item.total)}</td>
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
          <div className="glass-card p-6 space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Ringkasan Keuangan</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Subtotal Pekerjaan</span>
                <span className="text-white">{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Overhead ({financials.overhead}%)</span>
                <span className="text-white">{formatCurrency(summary.overheadAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Profit ({financials.profit}%)</span>
                <span className="text-white">{formatCurrency(summary.profitAmount)}</span>
              </div>
              {financials.contingency > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Contingency ({financials.contingency}%)</span>
                  <span className="text-white">{formatCurrency(summary.contingencyAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">PPN ({financials.tax}%)</span>
                <span className="text-white">{formatCurrency(summary.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold pt-3 border-t border-border">
                <span className="text-white">GRAND TOTAL</span>
                <span className="text-primary text-xl">{formatCurrency(summary.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="glass-card p-6 text-center space-y-3">
          <p className="text-text-secondary text-sm">Dibuat dengan <span className="text-primary font-bold">SIVILIZE HUB PRO</span></p>
          <p className="text-text-secondary text-xs">Platform RAB Konstruksi Indonesia</p>
          <a
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <ExternalLink size={15} />
            Buat RAB Anda Sendiri — Gratis
          </a>
        </div>
      </main>
    </div>
  );
};

export default ShareView;
