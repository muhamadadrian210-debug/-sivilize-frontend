import { useState, useEffect } from 'react';
import { X, FileDown, FileText, Building2, User, Hash, MessageCircle } from 'lucide-react';
import { type Project, type RABItem, type FinancialSettings } from '../../store/useStore';
import { calculateTotalRAB } from '../../utils/calculations';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { generateWAText, openWhatsApp } from '../../utils/whatsappShare';
import { formatCurrency } from '../../utils/calculations';
import { type MaterialGrade } from '../../data/prices';

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
  const [config, setConfig] = useState<ExportConfig>(DEFAULT_EXPORT_CONFIG);

  // Load config dari localStorage saat mount
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(EXPORT_CONFIG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ExportConfig>;
        setConfig({
          companyName: parsed.companyName || DEFAULT_EXPORT_CONFIG.companyName,
          estimatorName: parsed.estimatorName || '',
          documentNumber: generateDocNumber(), // selalu generate baru
        });
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const summary = calculateTotalRAB(items, financials);

  // Hitung subtotal per kategori
  const categoryTotals = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.total;
    return acc;
  }, {} as Record<string, number>);

  const saveConfigAndExport = (exportFn: () => void) => {
    const configToSave: ExportConfig = {
      ...config,
      companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
    };
    localStorage.setItem(EXPORT_CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    exportFn();
    onClose();
  };

  const handleDownloadPDF = () => {
    saveConfigAndExport(() => {
      exportToPDF(project, items, financials, grade, {
        companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
        preparedBy: config.estimatorName,
        projectNo: config.documentNumber,
      });
    });
  };

  const handleDownloadExcel = () => {
    saveConfigAndExport(() => {
      exportToExcel(project, items, financials, grade, {
        companyName: config.companyName.trim() || DEFAULT_EXPORT_CONFIG.companyName,
        preparedBy: config.estimatorName,
        projectNo: config.documentNumber,
      });
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
                  <div key={category} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-text-secondary text-sm">{category}</span>
                    <span className="text-white font-bold text-sm">{formatCurrency(total)}</span>
                  </div>
                ))}
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
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
            >
              <FileDown size={16} />
              Download PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-all"
            >
              <FileText size={16} />
              Download Excel
            </button>
          </div>
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
