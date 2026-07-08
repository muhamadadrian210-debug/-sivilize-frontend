import { useState, useMemo } from 'react';
import { X, FileDown, FileText, Building2, User, Hash, MessageCircle } from 'lucide-react';
import { type Project, type RABItem, type FinancialSettings } from '../../store/useStore';
import { calculateTotalRAB } from '../../utils/calculations';
import { exportToPDF, exportToExcel, exportBoQBlank } from '../../utils/exportUtils';
import { generateWAText, openWhatsApp } from '../../utils/whatsappShare';
import { formatCurrency } from '../../utils/calculations';
import { calculateProjectTKDN } from '../../utils/tkdnUtils';
import { type MaterialGrade } from '../../data/prices';
import { useToast } from '../common/Toast';

interface RABPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Partial<Project>;
  items: RABItem[];
  financials: FinancialSettings;
  grade: MaterialGrade;
}

interface ExportConfig {
  companyName: string;
  estimatorName: string;
  documentNumber: string;
}

const EXPORT_CONFIG_STORAGE_KEY = 'sivilize_export_config';

const generateDocNumber = () => `SIV-${Date.now().toString().slice(-6)}`;

const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  companyName: 'SIVILIZE HUB PRO',
  estimatorName: '',
  documentNumber: generateDocNumber(),
};

const RABPreviewModal = ({ isOpen, onClose, project, items, financials, grade }: RABPreviewModalProps) => {
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [config, setConfig] = useState<ExportConfig>(() => {
    try {
      const saved = localStorage.getItem(EXPORT_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = (JSON.parse(saved) || {}) as Partial<ExportConfig>;
        return {
          companyName: parsed.companyName || DEFAULT_EXPORT_CONFIG.companyName,
          estimatorName: parsed.estimatorName || '',
          documentNumber: generateDocNumber(),
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_EXPORT_CONFIG;
  });

  if (!isOpen) return null;

  const validItems = items?.filter(Boolean) || [];
  const summary = calculateTotalRAB(validItems, financials);

  // Hitung subtotal per kategori
  const categoryTotals = useMemo<Record<string, number>>(() => {
    return validItems.reduce((acc, item) => {
      const cat = item?.category || 'Lain-lain';
      acc[cat] = (acc[cat] || 0) + (item?.total || 0);
      return acc;
    }, {} as Record<string, number>);
  }, [validItems]);

  const tkdn = useMemo(() => calculateProjectTKDN(validItems), [validItems]);

  const saveConfigAndExport = (exportFn: () => void) => {
    setIsExporting(true);
    const configToSave: ExportConfig = {
      ...config,
      companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
    };
    localStorage.setItem(EXPORT_CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    
    // Jalankan langsung tanpa setTimeout untuk menghindari blokir download di mobile browser
    try {
      exportFn();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Gagal mengekspor file. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = () => {
    saveConfigAndExport(() => {
      exportToPDF(project, validItems, financials, grade, {
        companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
        preparedBy: config.estimatorName,
        projectNo: config.documentNumber,
      });
    });
  };

  const handleDownloadExcel = () => {
    saveConfigAndExport(() => {
      exportToExcel(project, validItems, financials, grade, {
        companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
        preparedBy: config.estimatorName,
        approvedBy: config.estimatorName,
        projectNo: config.documentNumber
      });
      showToast('RAB (Excel PU Format) berhasil diunduh', 'success');
    });
  };

  const handleDownloadBoQ = () => {
    saveConfigAndExport(() => {
      exportBoQBlank(project, validItems, {
        companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
        projectNo: config.documentNumber
      });
      showToast('BoQ Kosong berhasil diunduh', 'success');
    });
  };

  const handleSendWA = () => {
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, subtotal]) => ({
      category,
      subtotal,
    }));
    const text = generateWAText({
      projectName: project.name || 'Proyek',
      location: project.location || '-',
      grandTotal: summary.grandTotal,
      categoryBreakdown,
      companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
      preparedBy: config.estimatorName || undefined,
    });
    openWhatsApp(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto min-w-[320px]">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-white font-bold text-lg">Preview RAB</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ringkasan Proyek */}
          <div className="space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Ringkasan Proyek</p>
            <div className="glass-card p-4 space-y-2">
              <p className="text-white font-bold text-base">{project.name || 'Nama Proyek'}</p>
              <p className="text-text-secondary text-sm">{project.location || '-'}</p>
              <div className="pt-2 border-t border-border">
                <p className="text-text-secondary text-xs">Grand Total</p>
                <p className="text-primary font-black text-2xl">{formatCurrency(summary.grandTotal)}</p>
              </div>
            </div>
          </div>

          {/* Daftar Kategori */}
          <div className="space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Rincian per Kategori</p>
            <div className="space-y-2">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, total]) => (
                  <div key={category || 'Uncategorized'} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-text-secondary text-sm">{category || 'Lain-lain'}</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(total || 0)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Sertifikat TKDN */}
          <div className="space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Tingkat Komponen Dalam Negeri (TKDN)</p>
            <div className={`p-4 rounded-xl border ${tkdn.overallTKDN >= 80 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">Estimasi Nilai TKDN</span>
                <span className="text-2xl font-black">{tkdn.overallTKDN.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-xs mt-2 pt-2 border-t border-white/10">
                <span className="opacity-80">Nilai Komponen Lokal</span>
                <span className="font-bold">{formatCurrency(tkdn.totalDomesticValue)}</span>
              </div>
            </div>
          </div>

          {/* Pengaturan Finansial */}
          <div className="space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Pengaturan Finansial</p>
            <div className="glass-card p-4 space-y-2">
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
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                <span className="text-white">Grand Total</span>
                <span className="text-primary">{formatCurrency(summary.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Konfigurasi Dokumen */}
          <div className="space-y-3">
            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Konfigurasi Dokumen</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-bold">Nama Perusahaan</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                  <input
                    type="text"
                    value={config.companyName}
                    onChange={e => setConfig({ ...config, companyName: e.target.value })}
                    placeholder="SIVILIZE HUB PRO"
                    className="w-full h-10 bg-background border border-border rounded-xl pl-9 pr-4 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-bold">Nama Estimator</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                  <input
                    type="text"
                    value={config.estimatorName}
                    onChange={e => setConfig({ ...config, estimatorName: e.target.value })}
                    placeholder="Nama estimator"
                    className="w-full h-10 bg-background border border-border rounded-xl pl-9 pr-4 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-text-secondary font-bold">Nomor Dokumen</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                  <input
                    type="text"
                    value={config.documentNumber}
                    onChange={e => setConfig({ ...config, documentNumber: e.target.value })}
                    className="w-full h-10 bg-background border border-border rounded-xl pl-9 pr-4 text-white text-sm focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <FileDown size={16} />
              )}
              {isExporting ? 'Proses...' : 'Download PDF'}
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              {isExporting ? 'Proses...' : 'Export Excel (Dengan Harga)'}
            </button>
          </div>
          <button
            onClick={handleDownloadBoQ}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-sm font-bold hover:bg-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={16} />
            Export BoQ Excel (Tanpa Harga)
          </button>
          <button
            onClick={handleSendWA}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl text-sm font-bold hover:bg-[#25D366]/20 transition-all"
          >
            <MessageCircle size={16} />
            Kirim via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default RABPreviewModal;
