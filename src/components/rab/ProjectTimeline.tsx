import { Calendar, Clock, BarChart2, Users, Info } from 'lucide-react';
import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';

interface ProjectTimelineProps {
  items: RABItem[];
  totalArea?: number; // luas total bangunan dalam m²
}

const PHASE_ORDER = [
  'Persiapan', 'Tanah & Pondasi', 'Struktur',
  'Dinding & Plesteran', 'Kusen, Pintu & Jendela',
  'Atap & Plafon', 'Lantai & Keramik',
  'Instalasi Listrik', 'Instalasi Air & Sanitasi',
  'Finishing & Pengecatan', 'Lain-lain',
];

/**
 * Hitung jumlah tim per fase berdasarkan luas bangunan
 * Referensi: SNI & pengalaman lapangan Indonesia
 * - Rumah kecil (<60m²): 1 tim per fase
 * - Rumah sedang (60–150m²): 2 tim
 * - Rumah besar (150–300m²): 3 tim
 * - Bangunan besar (300–600m²): 4–5 tim
 * - Gedung (>600m²): 6–8 tim
 */
function getTeamSize(category: string, totalArea: number): number {
  // Base team per kategori (untuk rumah 100m²)
  const BASE: Record<string, number> = {
    'Persiapan':                1,
    'Tanah & Pondasi':          2,
    'Struktur':                 3,
    'Dinding & Plesteran':      2,
    'Kusen, Pintu & Jendela':   1,
    'Atap & Plafon':            2,
    'Lantai & Keramik':         2,
    'Instalasi Listrik':        1,
    'Instalasi Air & Sanitasi': 1,
    'Finishing & Pengecatan':   2,
    'Lain-lain':                1,
  };

  const base = BASE[category] || 1;

  // Scale factor berdasarkan luas
  let scale: number;
  if      (totalArea <= 36)  scale = 0.6;
  else if (totalArea <= 60)  scale = 0.8;
  else if (totalArea <= 100) scale = 1.0;
  else if (totalArea <= 150) scale = 1.3;
  else if (totalArea <= 200) scale = 1.6;
  else if (totalArea <= 300) scale = 2.0;
  else if (totalArea <= 500) scale = 2.8;
  else if (totalArea <= 750) scale = 3.5;
  else if (totalArea <= 1000)scale = 4.5;
  else                       scale = 5.5;

  return Math.max(1, Math.round(base * scale));
}

const ProjectTimeline = ({ items, totalArea = 100 }: ProjectTimelineProps) => {
  // Akumulasi durasi serial per fase
  const phaseMap = new Map<string, number>();

  items.forEach(item => {
    const template = AHSP_TEMPLATES.find(t => t.name === item.name);
    const productivity = template?.productivity || 1;
    const itemDuration = Math.ceil(item.volume / productivity);
    phaseMap.set(item.category, (phaseMap.get(item.category) || 0) + itemDuration);
  });

  // Hitung durasi paralel per fase
  const phases = PHASE_ORDER
    .filter(p => phaseMap.has(p))
    .map(p => {
      const totalSerial = phaseMap.get(p)!;
      const teams = getTeamSize(p, totalArea);
      const duration = Math.max(1, Math.ceil(totalSerial / teams));
      return { name: p, duration, teams };
    });

  const totalDuration = phases.reduce((s, p) => s + p.duration, 0);
  const totalMonths = (totalDuration / 25).toFixed(1); // 25 hari kerja/bulan

  const strukturDur   = phases.filter(p => ['Persiapan','Tanah & Pondasi','Struktur'].includes(p.name)).reduce((s,p)=>s+p.duration,0);
  const arsitekturDur = phases.filter(p => ['Dinding & Plesteran','Kusen, Pintu & Jendela','Atap & Plafon','Lantai & Keramik'].includes(p.name)).reduce((s,p)=>s+p.duration,0);
  const finishingDur  = phases.filter(p => ['Instalasi Listrik','Instalasi Air & Sanitasi','Finishing & Pengecatan','Lain-lain'].includes(p.name)).reduce((s,p)=>s+p.duration,0);

  // Total tim di lapangan (puncak)
  const peakTeams = Math.max(...phases.map(p => p.teams));

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Timeline & Scheduling</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-background/50 border border-border px-3 py-1.5 rounded-lg">
            <Users size={14} />
            <span>Maks <span className="text-white font-bold">{peakTeams} tim</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary bg-background/50 border border-border px-3 py-1.5 rounded-lg">
            <Clock size={14} />
            <span><span className="text-white font-bold">{totalDuration} hari</span> (~{totalMonths} bln)</span>
          </div>
        </div>
      </div>

      {/* Info luas */}
      <div className="mb-4 flex items-center gap-2 text-xs text-text-secondary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
        <Info size={12} className="text-primary" />
        Estimasi untuk bangunan <span className="text-white font-bold mx-1">{totalArea} mÂ²</span>
        â€” tim disesuaikan otomatis dengan luas bangunan
      </div>

      <div className="space-y-3">
        {phases.map((phase, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-white">{phase.name}</span>
                <span className="text-text-secondary text-[10px]">({phase.teams} tim paralel)</span>
              </div>
              <span className="text-text-secondary">{phase.duration} hari</span>
            </div>
            <div className="relative h-4 bg-background rounded-full border border-border overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  ['Persiapan','Tanah & Pondasi','Struktur'].includes(phase.name) ? 'bg-blue-500' :
                  ['Dinding & Plesteran','Kusen, Pintu & Jendela','Atap & Plafon','Lantai & Keramik'].includes(phase.name) ? 'bg-purple-500' :
                  'bg-success'
                }`}
                style={{ width: `${Math.min(100, (phase.duration / totalDuration) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {phases.length === 0 && (
          <p className="text-text-secondary text-sm italic py-8 text-center bg-background/50 rounded-xl border border-dashed border-border">
            Belum ada data pekerjaan. Hasilkan RAB terlebih dahulu.
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pek. Struktur',   dur: strukturDur,   color: 'blue',   months: (strukturDur/25).toFixed(1) },
          { label: 'Pek. Arsitektur', dur: arsitekturDur, color: 'purple', months: (arsitekturDur/25).toFixed(1) },
          { label: 'Pek. Finishing',  dur: finishingDur,  color: 'green',  months: (finishingDur/25).toFixed(1) },
        ].map(({ label, dur, color, months }) => (
          <div key={label} className={`flex items-center gap-4 p-4 bg-${color}-500/10 border border-${color}-500/20 rounded-xl`}>
            <div className={`p-2 bg-${color}-500/20 text-${color}-500 rounded-lg`}>
              <BarChart2 size={20} />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{label}</p>
              <p className="text-white font-bold">{dur} hari</p>
              <p className="text-text-secondary text-[10px]">~{months} bulan</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;
