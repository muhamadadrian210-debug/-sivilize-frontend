import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FileDown, ToggleLeft, ToggleRight, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { type Project } from '../../store/useStore';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';
import { buildChartData, aggregateToMonthly } from '../../utils/kurvaSUtils';
import { exportKurvaSPDF } from '../../utils/exportUtils';
import { useToast } from '../common/Toast';

interface KurvaSProps {
  project: Project;
}

const KurvaS = ({ project }: KurvaSProps) => {
  const { updateProject, updateProjectProgress, user } = useStore();
  const { showToast } = useToast();

  const latestVersion = project.versions?.[project.versions.length - 1];
  const items = latestVersion?.rabItems || [];
  const grandTotal = latestVersion?.summary?.grandTotal || 0;

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [endDate, setEndDate] = useState(project.endDate || '');
  const [dateError, setDateError] = useState('');

  const manualProgress = project.manualProgress || {};

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
      if (endDate && value >= endDate) {
        setDateError('Tanggal selesai harus setelah tanggal mulai');
      } else {
        setDateError('');
        updateProject(project.id, { startDate: value });
      }
    } else {
      setEndDate(value);
      if (startDate && value <= startDate) {
        setDateError('Tanggal selesai harus setelah tanggal mulai');
      } else {
        setDateError('');
        updateProject(project.id, { endDate: value });
      }
    }
  };

  const weeklyData = useMemo(() => {
    if (!startDate || !endDate || startDate >= endDate) return [];
    return buildChartData(items, startDate, endDate, project.dailyLogs || [], manualProgress);
  }, [items, startDate, endDate, project.dailyLogs, manualProgress]);

  const monthlyData = useMemo(() => aggregateToMonthly(weeklyData), [weeklyData]);

  const chartData = viewMode === 'weekly' ? weeklyData : monthlyData;

  // Hitung progress saat ini
  const lastLog = [...(project.dailyLogs || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const currentProgress = lastLog?.progressPercent || 0;

  const currentWeek = startDate
    ? Math.ceil((Date.now() - new Date(startDate).getTime()) / (7 * 24 * 60 * 60 * 1000))
    : null;

  const planAtCurrentWeek = currentWeek && weeklyData.length > 0
    ? weeklyData[Math.min(currentWeek, weeklyData.length - 1)]?.rencana || 0
    : 0;

  const deviation = currentProgress - planAtCurrentWeek;

  const handleEditStart = (periodIndex: number, currentValue: number | null) => {
    setEditingPeriod(periodIndex);
    setEditValue(currentValue !== null ? currentValue.toString() : '');
  };

  const handleEditSave = (periodIndex: number) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast('Nilai harus antara 0 dan 100', 'warning');
      return;
    }
    // Peringatan jika lebih kecil dari periode sebelumnya
    if (periodIndex > 0) {
      const prevData = chartData[periodIndex - 1];
      if (prevData?.realisasi !== null && prevData?.realisasi !== undefined && val < prevData.realisasi) {
        showToast('Peringatan: Nilai lebih kecil dari periode sebelumnya', 'warning');
      }
    }
    updateProjectProgress(project.id, periodIndex, val);
    setEditingPeriod(null);
    setEditValue('');
  };

  const handleExportPDF = () => {
    try {
      exportKurvaSPDF(project, chartData, {
        companyName: 'SIVILIZE HUB PRO',
        preparedBy: user?.name,
      });
    } catch {
      showToast('Gagal mengekspor PDF. Silakan coba lagi.', 'error');
    }
  };

  const hasValidDates = startDate && endDate && startDate < endDate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-white font-bold text-lg">Kurva S — Progress Proyek</h3>
          <p className="text-text-secondary text-xs mt-1">Rencana vs Realisasi pekerjaan</p>
        </div>
        <div className="flex items-center gap-3">
          {hasValidDates && (
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all"
            >
              <FileDown size={15} />
              Export PDF
            </button>
          )}
          {currentWeek && hasValidDates && (
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold ${
              deviation >= 0
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {deviation >= 0 ? '▲' : '▼'} {Math.abs(deviation).toFixed(1)}% {deviation >= 0 ? 'Lebih Cepat' : 'Terlambat'}
            </div>
          )}
        </div>
      </div>

      {/* Form Input Tanggal */}
      <div className="glass-card p-5 space-y-4">
        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Periode Proyek</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-text-secondary font-bold">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={e => handleDateChange('startDate', e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-xl px-4 text-white text-sm focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-secondary font-bold">Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={e => handleDateChange('endDate', e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-xl px-4 text-white text-sm focus:border-primary outline-none"
            />
          </div>
        </div>
        {dateError && (
          <div className="flex items-center gap-2 text-red-400 text-xs">
            <AlertTriangle size={13} />
            <span>{dateError}</span>
          </div>
        )}
        {!hasValidDates && !dateError && (
          <p className="text-text-secondary text-xs italic">
            Isi tanggal mulai dan selesai untuk menampilkan Kurva S.
          </p>
        )}
      </div>

      {!hasValidDates ? null : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total RAB', value: formatCurrency(grandTotal), color: 'text-primary' },
              { label: 'Durasi', value: `${weeklyData.length - 1} Minggu`, color: 'text-blue-400' },
              { label: 'Progress Rencana', value: `${planAtCurrentWeek.toFixed(1)}%`, color: 'text-yellow-400' },
              { label: 'Progress Realisasi', value: `${currentProgress.toFixed(1)}%`, color: deviation >= 0 ? 'text-green-400' : 'text-red-400' },
            ].map((s, i) => (
              <div key={i} className="glass-card p-4">
                <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">{s.label}</p>
                <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Toggle Per Minggu / Per Bulan */}
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-sm">Tampilan:</span>
            <button
              onClick={() => setViewMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'weekly' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-white'
              }`}
            >
              {viewMode === 'weekly' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              Per Minggu
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'monthly' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-white'
              }`}
            >
              {viewMode === 'monthly' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
              Per Bulan
            </button>
          </div>

          {/* Chart */}
          <div className="glass-card p-6">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121826', border: '1px solid #1E293B', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [
                      `${value?.toFixed(1)}%`,
                      name === 'rencana' ? 'Rencana' : 'Realisasi'
                    ]}
                  />
                  <Legend formatter={(value) => value === 'rencana' ? 'Rencana' : 'Realisasi'} />
                  {currentWeek && viewMode === 'weekly' && (
                    <ReferenceLine x={`M${currentWeek}`} stroke="#FF7A00" strokeDasharray="4 4" label={{ value: 'Hari Ini', fill: '#FF7A00', fontSize: 11 }} />
                  )}
                  <Line type="monotone" dataKey="rencana" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="rencana" />
                  <Line type="monotone" dataKey="realisasi" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} name="realisasi" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-text-secondary text-xs mt-3 text-center italic">
              * Klik sel Realisasi di tabel bawah untuk input manual. Data dari Buku Harian diutamakan.
            </p>
          </div>

          {/* Tabel Progress */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Tabel Progress per Periode</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-text-secondary text-xs font-bold">Periode</th>
                    <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Rencana (%)</th>
                    <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Realisasi (%)</th>
                    <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Deviasi (%)</th>
                    <th className="text-center py-2 px-4 text-text-secondary text-xs font-bold">Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((point, idx) => {
                    const deviasi = point.realisasi !== null ? point.realisasi - point.rencana : null;
                    const isEditing = editingPeriod === idx;
                    return (
                      <tr key={idx} className="border-b border-border/30 hover:bg-white/2">
                        <td className="py-2 px-4 text-white font-bold">{point.label}</td>
                        <td className="py-2 px-4 text-right text-blue-400">{point.rencana.toFixed(1)}%</td>
                        <td className="py-2 px-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleEditSave(idx);
                                  if (e.key === 'Escape') setEditingPeriod(null);
                                }}
                                min={0}
                                max={100}
                                step={0.1}
                                autoFocus
                                className="w-16 h-7 bg-background border border-primary rounded-lg px-2 text-white text-xs text-right focus:outline-none"
                              />
                              <button onClick={() => handleEditSave(idx)} className="text-green-400 hover:text-green-300">
                                <Check size={13} />
                              </button>
                              <button onClick={() => setEditingPeriod(null)} className="text-red-400 hover:text-red-300">
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditStart(idx, point.realisasi)}
                              className="flex items-center justify-end gap-1 w-full text-right hover:text-primary transition-colors group"
                            >
                              <span className={point.realisasi !== null ? 'text-green-400' : 'text-text-secondary'}>
                                {point.realisasi !== null ? `${point.realisasi.toFixed(1)}%` : '—'}
                              </span>
                              <Edit2 size={11} className="opacity-0 group-hover:opacity-100 text-text-secondary transition-opacity" />
                            </button>
                          )}
                        </td>
                        <td className={`py-2 px-4 text-right font-bold ${
                          deviasi === null ? 'text-text-secondary' :
                          deviasi >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {deviasi !== null ? `${deviasi >= 0 ? '+' : ''}${deviasi.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {point.realisasi !== null ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              point.isManual
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {point.isManual ? '✏ Manual' : '📋 Log'}
                            </span>
                          ) : (
                            <span className="text-text-secondary text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bobot per kategori */}
          {items.length > 0 && (
            <div className="glass-card p-5">
              <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-4">Bobot Pekerjaan per Kategori</p>
              <div className="space-y-2">
                {Object.entries(
                  items.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + item.total;
                    return acc;
                  }, {} as Record<string, number>)
                ).sort((a, b) => b[1] - a[1]).map(([cat, total]) => {
                  const subtotal = items.reduce((s, i) => s + i.total, 0);
                  const pct = subtotal > 0 ? (total / subtotal) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-text-secondary text-xs w-28 shrink-0">{cat}</span>
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-white text-xs font-bold w-12 text-right">{pct.toFixed(1)}%</span>
                      <span className="text-text-secondary text-xs w-28 text-right">{formatCurrency(total)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KurvaS;
