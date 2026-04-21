/**
 * ProjectFeaturePage — Wrapper untuk fitur yang butuh project dipilih dulu
 * Dipakai untuk: Financial Report, Kurva S, Upah Tukang
 */
import { useState } from 'react';
import { ChevronDown, FolderOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import FinancialReport from '../financial/FinancialReport';
import KurvaS from '../rab/KurvaS';
import LaborCalculator from '../rab/LaborCalculator';

type FeatureType = 'financial' | 'kurva-s' | 'upah';

interface ProjectFeaturePageProps {
  feature: FeatureType;
}

const FEATURE_LABELS: Record<FeatureType, string> = {
  'financial': 'Laporan Keuangan',
  'kurva-s': 'Kurva S & Progress',
  'upah': 'Kalkulator Upah Tukang',
};

const ProjectFeaturePage = ({ feature }: ProjectFeaturePageProps) => {
  const { projects, setActiveTab } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <FolderOpen size={36} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-white font-bold text-xl mb-2">Belum Ada Proyek</h2>
          <p className="text-text-secondary text-sm mb-6">
            Buat proyek RAB terlebih dahulu untuk menggunakan {FEATURE_LABELS[feature]}.
          </p>
          <button
            onClick={() => setActiveTab('kalkulator')}
            className="btn-primary px-6 py-2"
          >
            Buat Proyek RAB
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{FEATURE_LABELS[feature]}</h2>

        {/* Dropdown pilih proyek */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 min-w-[220px]">
            <FolderOpen size={16} className="text-primary shrink-0" />
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-white text-sm font-medium flex-1 outline-none appearance-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-card">
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="text-text-secondary shrink-0" />
          </div>
        </div>
      </div>

      {/* Feature Content */}
      {selectedProject ? (
        <>
          {feature === 'financial' && (
            <FinancialReport projectId={selectedProject.id} />
          )}
          {feature === 'kurva-s' && (
            <KurvaS project={selectedProject} />
          )}
          {feature === 'upah' && (
            <LaborCalculator projectId={selectedProject.id} />
          )}
        </>
      ) : (
        <div className="text-center py-12 text-text-secondary">
          Pilih proyek di atas untuk melihat data.
        </div>
      )}
    </div>
  );
};

export default ProjectFeaturePage;
