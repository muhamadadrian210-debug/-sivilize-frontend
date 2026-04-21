/**
 * ProjectFeaturePage — Wrapper halaman untuk fitur yang butuh project context
 * Dipakai untuk: Financial Report, Kurva S, Labor Calculator
 */
import { useState } from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import FinancialReport from '../financial/FinancialReport';
import KurvaS from '../rab/KurvaS';
import LaborCalculator from '../rab/LaborCalculator';

type FeatureType = 'financial' | 'kurvas' | 'labor';

interface ProjectFeaturePageProps {
  feature: FeatureType;
}

const FEATURE_META: Record<FeatureType, { title: string; desc: string; icon: string }> = {
  financial: { title: 'Laporan Keuangan', desc: 'Anggaran vs realisasi biaya per kategori', icon: '📊' },
  kurvas:    { title: 'Kurva S',          desc: 'Rencana vs realisasi progress proyek',    icon: '📈' },
  labor:     { title: 'Upah Tukang',      desc: 'Kalkulasi upah tenaga kerja mingguan',    icon: '👷' },
};

const ProjectFeaturePage = ({ feature }: ProjectFeaturePageProps) => {
  const { projects } = useStore();
  const meta = FEATURE_META[feature];

  // Default ke proyek pertama yang punya versi RAB
  const projectsWithRAB = projects.filter(p => p.versions && p.versions.length > 0);
  const [selectedId, setSelectedId] = useState<string>(projectsWithRAB[0]?.id ?? '');

  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{meta.icon}</span>
            {meta.title}
          </h2>
          <p className="text-text-secondary text-sm mt-1">{meta.desc}</p>
        </div>

        {/* Project selector */}
        <div className="relative min-w-[260px]">
          <FolderOpen size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:border-primary outline-none appearance-none"
          >
            {projectsWithRAB.length === 0 && (
              <option value="">Belum ada proyek</option>
            )}
            {projectsWithRAB.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {!selectedProject ? (
        <div className="glass-card p-12 text-center space-y-3">
          <p className="text-4xl">📂</p>
          <p className="text-white font-bold">Belum ada proyek</p>
          <p className="text-text-secondary text-sm">Buat proyek RAB terlebih dahulu di menu Kalkulator RAB</p>
        </div>
      ) : (
        <>
          {feature === 'financial' && <FinancialReport projectId={selectedProject.id} />}
          {feature === 'kurvas'    && <KurvaS project={selectedProject} />}
          {feature === 'labor'     && <LaborCalculator projectId={selectedProject.id} />}
        </>
      )}
    </div>
  );
};

export default ProjectFeaturePage;
