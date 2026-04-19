import { useRef, useState } from 'react';
import { Download, Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { exportAllData, importData } from '../../utils/backupRestore';
import { useToast } from '../common/Toast';

const BackupRestorePanel = () => {
  const { projects, rabTemplates, user, addProject, saveRABTemplate } = useStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [lastResult, setLastResult] = useState<{ projectsImported: number; projectsSkipped: number; templatesImported: number } | null>(null);

  const handleExport = () => {
    exportAllData(projects, rabTemplates, user);
    showToast('Data berhasil diekspor', 'success');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showToast('File harus berformat .json', 'error');
      return;
    }

    setImporting(true);
    try {
      const result = await importData(file, projects, rabTemplates, {
        addProject,
        saveRABTemplate,
      });

      if (result.success) {
        setLastResult({
          projectsImported: result.projectsImported,
          projectsSkipped: result.projectsSkipped,
          templatesImported: result.templatesImported,
        });
        showToast(
          `${result.projectsImported} proyek diimport, ${result.projectsSkipped} dilewati, ${result.templatesImported} template diimport`,
          'success'
        );
      } else {
        showToast(result.errors[0] || 'Gagal mengimpor data', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat mengimpor data', 'error');
    } finally {
      setImporting(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database size={18} className="text-primary" />
        <h3 className="text-white font-bold">Backup &amp; Restore Data</h3>
      </div>

      <p className="text-text-secondary text-sm">
        Ekspor semua data proyek dan template RAB ke file JSON. Gunakan file ini untuk memindahkan data ke perangkat lain atau sebagai cadangan.
      </p>

      {/* Export */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Download size={16} className="text-primary" />
          <p className="text-white font-bold text-sm">Export Semua Data</p>
        </div>
        <p className="text-text-secondary text-xs">
          {projects.length} proyek, {rabTemplates.length} template akan diekspor.
        </p>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Download size={15} />
          Export Semua Data
        </button>
      </div>

      {/* Import */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Upload size={16} className="text-primary" />
          <p className="text-white font-bold text-sm">Import Data</p>
        </div>
        <p className="text-text-secondary text-xs">
          Pilih file backup (.json) untuk mengimpor data. Proyek dengan ID yang sama akan dilewati.
        </p>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {importing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload size={15} />
            )}
            {importing ? 'Mengimpor...' : 'Pilih File Backup'}
          </button>
        </div>

        {/* Hasil import */}
        {lastResult && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
            <div className="text-xs text-green-300">
              <p className="font-bold">Import berhasil!</p>
              <p>{lastResult.projectsImported} proyek diimport, {lastResult.projectsSkipped} dilewati</p>
              <p>{lastResult.templatesImported} template diimport</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <AlertCircle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-300">
            Data yang diimport akan ditambahkan ke data yang sudah ada. Proyek dengan ID yang sama tidak akan ditimpa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePanel;
