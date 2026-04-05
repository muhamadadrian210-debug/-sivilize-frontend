import { Calendar, Clock, BarChart2 } from 'lucide-react';
import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';

interface ProjectTimelineProps {
  items: RABItem[];
}

function hashToPercent(input: string): number {
  // Deterministic "random-ish" number 0..99 (pure; safe during render)
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 100;
}

const ProjectTimeline = ({ items }: ProjectTimelineProps) => {
  const tasks = items.map(item => {
    const template = AHSP_TEMPLATES.find(t => t.name === item.name);
    // Use productivity from template, fallback to 1 to avoid division by zero
    const productivity = template?.productivity || 1;
    const duration = Math.ceil(item.volume / productivity);
    return {
      name: item.name,
      category: item.category,
      duration,
      progress: hashToPercent(`${item.id}-${item.name}-${item.category}`), // Stable mock progress
    };
  });

  const totalDuration = tasks.reduce((acc, t) => acc + t.duration, 0);

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
            <span>Estimasi Durasi: <span className="text-white font-bold">{totalDuration} Hari Kerja</span></span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-xs uppercase font-bold tracking-widest">
              <span className="text-white">{task.name}</span>
              <span className="text-text-secondary">{task.duration} Hari</span>
            </div>
            <div className="relative h-6 bg-background rounded-full border border-border overflow-hidden group">
              <div 
                className={`h-full transition-all duration-1000 shadow-glow flex items-center justify-end pr-4 ${
                  task.category === 'Struktur' ? 'bg-blue-500' :
                  task.category === 'Arsitektur' ? 'bg-purple-500' :
                  'bg-success'
                }`}
                style={{ width: `${Math.min(100, (task.duration / totalDuration) * 500)}%` }} // Visual representation
              />
              <div className="absolute inset-0 flex items-center px-4">
                 <p className="text-[10px] text-white font-black opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.category}
                </p>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
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
            <p className="text-white font-bold">~ {Math.ceil(totalDuration * 0.4)} Hari</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Pek. Arsitektur</p>
            <p className="text-white font-bold">~ {Math.ceil(totalDuration * 0.45)} Hari</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="p-2 bg-success/20 text-success rounded-lg">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Pek. Finishing</p>
            <p className="text-white font-bold">~ {Math.ceil(totalDuration * 0.15)} Hari</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
