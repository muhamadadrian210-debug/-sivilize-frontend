import { useState, useMemo } from 'react';
import { 
  Plus, 
  Calendar, 
  Image as ImageIcon, 
  MessageSquare, 
  Search,
  MoreVertical,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const DailyLog = () => {
  const { projects } = useStore();
  
  const allLogs = useMemo(() => {
    return projects.flatMap(p => 
      (p.dailyLogs || []).map(log => ({
        ...log,
        projectName: p.name,
        projectId: p.id
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [projects]);

  const [filterText, setFilterText] = useState('');
  
  const filteredLogs = allLogs.filter(log => 
    log.text.toLowerCase().includes(filterText.toLowerCase()) ||
    log.projectName.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white italic tracking-tight">Buku Harian Proyek</h2>
          <p className="text-text-secondary mt-1">Catat aktivitas, progress, dan kendala harian</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span>Buat Catatan Harian</span>
        </button>
      </div>

      {allLogs.length === 0 ? (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-glow animate-pulse">
            <BookOpen size={48} />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-bold text-white">Buku Harian Kosong</h3>
            <p className="text-text-secondary">Belum ada catatan harian untuk proyek apapun. Catatan harian membantu Anda memantau progress lapangan secara real-time.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Cari Catatan</label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Cari aktivitas..."
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Filter Tanggal</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                  <input 
                    type="date" 
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-primary outline-none appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Filter Status</label>
                <select className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none appearance-none">
                  <option>Semua Status</option>
                  <option>Normal</option>
                  <option>Warning</option>
                  <option>Kendala</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs Timeline */}
          <div className="lg:col-span-3 space-y-8 relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border z-0" />

            {filteredLogs.map((log) => (
              <div key={log.id} className="relative z-10 flex gap-8 pl-4">
                {/* Timeline Bullet */}
                <div className="w-4 h-4 rounded-full mt-2 ring-4 ring-background bg-primary shadow-glow" />

                <div className="flex-1 glass-card p-6 hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-background border border-border px-3 py-1 rounded-lg">
                        <p className="text-white font-bold text-sm">{log.date}</p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest">{log.projectName}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                        Normal
                      </span>
                    </div>
                    <button className="text-text-secondary hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white text-sm leading-relaxed">{log.text}</p>
                    
                    {log.photos && log.photos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {log.photos.map((photo, i) => (
                          <div key={i} className="aspect-video rounded-xl overflow-hidden border border-border group relative">
                            <img src={photo} alt="Progress" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon size={24} className="text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center gap-6">
                    <button className="text-text-secondary hover:text-primary flex items-center gap-2 text-xs font-bold transition-colors">
                      <MessageSquare size={14} />
                      Tambah Catatan Admin
                    </button>
                    <button className="text-text-secondary hover:text-white flex items-center gap-2 text-xs font-bold transition-colors">
                      <CheckCircle2 size={14} />
                      Verifikasi Progress
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLog;
