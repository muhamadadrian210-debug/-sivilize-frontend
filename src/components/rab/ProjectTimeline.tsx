import { Calendar, Clock, BarChart2 } from 'lucide-react';
import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';

interface ProjectTimelineProps {
  items: RABItem[];
}

// Jumlah tim pekerja per kategori (paralel)
const TEAM_SIZE: Record<string, number> = {
  'Persiapan':              2,
  'Tanah & Pondasi':        2,
  'Struktur':               3,  // 3 tim bisa kerja paralel (kolom, balok, bekisting)
  'Dinding & Plesteran':    2,
  'Kusen, Pintu & Jendela': 2,
  'Atap & Plafon':          2,
  'Lantai & Keramik':       2,
  'Instalasi Listrik':      1,
  'Instalasi Air & Sanitasi': 1,
  'Finishing & Pengecatan': 2,
  'Lain-lain':              1,
};

const ProjectTimeline = ({ items }: ProjectTimelineProps) => {
  // Hitung durasi per FASE (paralel dalam fase, serial antar fase)
  // Fase = kategori pekerjaan, durasi fase = max(durasi item) / jumlah tim
  const phaseMap = new Map<string, number>();

  items.forEach(item => {
    const template = AHSP_TEMPLATES.find(t => t.name === item.name);
    const productivity = template?.productivity || 1;
    // Durasi item jika dikerjakan 1 tim
    const itemDuration = Math.ceil(item.volume / productivity);
    const current = phaseMap.get(item.category) || 0;
    phaseMap.set(item.category, current + itemDuration);
  });

  // Bagi dengan jumlah tim paralel per fase
  const PHASE_ORDER = [
    'Persiapan', 'Tanah & Pondasi', 'Struktur',
    'Dinding & Plesteran', 'Kusen, Pintu & Jendela',
    'Atap & Plafon', 'Lantai & Keramik',
    'Instalasi Listrik', 'Instalasi Air & Sanitasi',
    'Finishing & Pengecatan', 'Lain-lain',
  ];

  const phases = PHASE_ORDER
    .filter(p => phaseMap.has(p))
    .map(p => {
      const totalSerial = phaseMap.get(p)!;
      const teams = TEAM_SIZE[p] || 1;
      // Durasi paralel = total serial / tim, minimum 1 hari
      const duration = Math.max(1, Math.ceil(totalSerial / teams));
      return { name: p, duration };
    });

  // Total = jumlah semua fase (serial antar fase)
  const totalDuration = phases.reduce((s, p) => s + p.duration, 0);

  // Durasi per kelompok besar
  const strukturDur = phases.filter(p =>
    ['Persiapan','Tanah & Pondasi','Struktur'].includes(p.name)
  ).reduce((s, p) => s + p.duration, 0);

  const arsitekturDur = phases.filter(p =>
    ['Dinding & Plesteran','Kusen, Pintu & Jendela','Atap & Plafon','Lantai & Keramik'].includes(p.name)
  ).reduce((s, p) => s + p.duration, 0);

  const finishingDur = phases.filter(p =>
    ['Instalasi Listrik','Instalasi Air & Sanitasi','Finishing & Pengecatan','Lain-lain'].includes(p.name)
  ).reduce((s, p) => s + p.duration, 0);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Calendar className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Timeline & Scheduling</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-text-secondary bg-background/50 border border-border px-4 py-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Estimasi Total: <span className="text-white font-bold">{totalDuration} Hari Kerja</span></span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-white uppercase tracking-widest">{phase.name}</span>
              <span className="text-text-secondary">{phase.duration} Hari</span>
            </div>
            <div className="relative h-5 bg-background rounded-full border border-border overflow-hidden">
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

      <div className="mt-8 pt-6 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Pek. Struktur</p>
            <p className="text-white font-bold">~ {strukturDur} Hari</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Pek. Arsitektur</p>
            <p className="text-white font-bold">~ {arsitekturDur} Hari</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="p-2 bg-success/20 text-success rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Pek. Finishing</p>
            <p className="text-white font-bold">~ {finishingDur} Hari</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
