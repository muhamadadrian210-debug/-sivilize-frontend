import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';

export interface CategoryFinancial {
  category: string;
  anggaran: number;
  realisasi: number;
  sisa: number;
  persentase: number;
  status: 'aman' | 'warning' | 'over';
}

export interface FinancialSummary {
  totalAnggaran: number;
  totalRealisasi: number;
  totalSisa: number;
  persentaseTerpakai: number;
  byCategory: CategoryFinancial[];
}

export function computeFinancialReport(
  project: { versions?: Array<{ rabItems: Array<{ category: string; total: number }> }>; costRealizations?: Array<{ category: string; amount: number }>; }
): FinancialSummary {
  const latestVersion = project.versions?.[project.versions.length - 1];
  const items = latestVersion?.rabItems || [];
  const realizations = project.costRealizations || [];

  // Anggaran per kategori
  const anggaranByCategory: Record<string, number> = {};
  for (const item of items) {
    anggaranByCategory[item.category] = (anggaranByCategory[item.category] || 0) + item.total;
  }

  // Realisasi per kategori
  const realisasiByCategory: Record<string, number> = {};
  for (const r of realizations) {
    realisasiByCategory[r.category] = (realisasiByCategory[r.category] || 0) + r.amount;
  }

  const allCategories = new Set([
    ...Object.keys(anggaranByCategory),
    ...Object.keys(realisasiByCategory),
  ]);

  const byCategory: CategoryFinancial[] = Array.from(allCategories).map(category => {
    const anggaran = anggaranByCategory[category] || 0;
    const realisasi = realisasiByCategory[category] || 0;
    const sisa = anggaran - realisasi;
    const persentase = anggaran > 0 ? (realisasi / anggaran) * 100 : 0;
    const status: CategoryFinancial['status'] =
      persentase > 100 ? 'over' : persentase >= 80 ? 'warning' : 'aman';

    return { category, anggaran, realisasi, sisa, persentase, status };
  });

  const totalAnggaran = byCategory.reduce((s, c) => s + c.anggaran, 0);
  const totalRealisasi = byCategory.reduce((s, c) => s + c.realisasi, 0);
  const totalSisa = totalAnggaran - totalRealisasi;
  const persentaseTerpakai = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return { totalAnggaran, totalRealisasi, totalSisa, persentaseTerpakai, byCategory };
}

interface FinancialReportProps {
  projectId: string;
}

const STATUS_ICON = {
  aman: <CheckCircle2 size={14} className="text-green-400" />,
  warning: <AlertTriangle size={14} className="text-yellow-400" />,
  over: <XCircle size={14} className="text-red-400" />,
};

const STATUS_COLOR = {
  aman: 'text-green-400',
  warning: 'text-yellow-400',
  over: 'text-red-400',
};

const FinancialReport = ({ projectId }: FinancialReportProps) => {
  const { projects } = useStore();
  const project = projects.find(p => p.id === projectId);

  const report = useMemo(() => {
    if (!project) return null;
    return computeFinancialReport(project);
  }, [project]);

  if (!project || !report) {
    return (
      <div className="glass-card p-8 text-center text-text-secondary">
        <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Proyek tidak ditemukan</p>
      </div>
    );
  }

  const chartData = report.byCategory.map(c => ({
    name: c.category.length > 10 ? c.category.slice(0, 10) + '...' : c.category,
    Anggaran: c.anggaran,
    Realisasi: c.realisasi,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-primary" />
        <h3 className="text-white font-bold">Laporan Keuangan Proyek</h3>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">Total Anggaran</p>
          <p className="text-primary font-black text-lg mt-1">{formatCurrency(report.totalAnggaran)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">Total Realisasi</p>
          <p className="text-blue-400 font-black text-lg mt-1">{formatCurrency(report.totalRealisasi)}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">Sisa Anggaran</p>
          <p className={`font-black text-lg mt-1 ${report.totalSisa >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(report.totalSisa)}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">% Terpakai</p>
          <p className={`font-black text-lg mt-1 ${report.persentaseTerpakai > 100 ? 'text-red-400' : report.persentaseTerpakai >= 80 ? 'text-yellow-400' : 'text-green-400'}`}>
            {report.persentaseTerpakai.toFixed(1)}%
          </p>
          <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${report.persentaseTerpakai > 100 ? 'bg-red-400' : report.persentaseTerpakai >= 80 ? 'bg-yellow-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min(100, report.persentaseTerpakai)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <p className="text-text-secondary text-xs font-bold uppercase tracking-widest mb-4">Anggaran vs Realisasi per Kategori</p>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121826', border: '1px solid #1E293B', borderRadius: '8px' }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend />
                <Bar dataKey="Anggaran" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#FF7A00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabel Detail */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-text-secondary text-xs font-bold uppercase tracking-widest">Detail per Kategori</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4 text-text-secondary text-xs font-bold">Kategori</th>
                <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Anggaran</th>
                <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Realisasi</th>
                <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">Sisa</th>
                <th className="text-right py-2 px-4 text-text-secondary text-xs font-bold">%</th>
                <th className="text-center py-2 px-4 text-text-secondary text-xs font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.byCategory.map(c => (
                <tr key={c.category} className="border-b border-border/30 hover:bg-white/2">
                  <td className="py-2 px-4 text-white">{c.category}</td>
                  <td className="py-2 px-4 text-right text-text-secondary">{formatCurrency(c.anggaran)}</td>
                  <td className="py-2 px-4 text-right text-white">{formatCurrency(c.realisasi)}</td>
                  <td className={`py-2 px-4 text-right font-bold ${c.sisa >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(c.sisa)}
                  </td>
                  <td className={`py-2 px-4 text-right font-bold ${STATUS_COLOR[c.status]}`}>
                    {c.persentase.toFixed(1)}%
                  </td>
                  <td className="py-2 px-4 text-center">
                    <span className="flex items-center justify-center gap-1">
                      {STATUS_ICON[c.status]}
                      <span className={`text-xs font-bold ${STATUS_COLOR[c.status]}`}>
                        {c.status === 'aman' ? 'Aman' : c.status === 'warning' ? 'Perhatian' : 'Melebihi'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;
