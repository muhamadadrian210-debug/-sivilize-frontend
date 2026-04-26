/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useMemo } from 'react';
import { X, GitCompare, TrendingUp, TrendingDown, Plus, Minus } from 'lucide-react';
import { useStore, type ProjectVersion } from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';

interface RABVersionComparisonProps {
  projectId: string;
  onClose: () => void;
}

interface ComparisonItem {
  id: string;
  category: string;
  name: string;
  volumeA?: number;
  unitPriceA?: number;
  totalA?: number;
  volumeB?: number;
  unitPriceB?: number;
  totalB?: number;
  totalDiff: number;
  diffPercent: number;
  status: 'added' | 'removed' | 'increased' | 'decreased' | 'unchanged';
}

function computeVersionDiff(
  versionA: ProjectVersion,
  versionB: ProjectVersion
): ComparisonItem[] {
  const allItemNames = new Set([
    ...versionA.rabItems.map(i => i.name),
    ...versionB.rabItems.map(i => i.name),
  ]);

  return Array.from(allItemNames).map(name => {
    const itemA = versionA.rabItems.find(i => i.name === name);
    const itemB = versionB.rabItems.find(i => i.name === name);

    const totalA = itemA?.total ?? 0;
    const totalB = itemB?.total ?? 0;
    const totalDiff = totalB - totalA;
    const diffPercent = totalA > 0 ? (totalDiff / totalA) * 100 : 0;

    let status: ComparisonItem['status'];
    if (!itemA) status = 'added';
    else if (!itemB) status = 'removed';
    else if (Math.abs(totalDiff) < 1) status = 'unchanged';
    else if (totalDiff > 0) status = 'increased';
    else status = 'decreased';

    return {
      id: itemA?.id || itemB?.id || name,
      category: itemA?.category || itemB?.category || 'Lain-lain',
      name,
      volumeA: itemA?.volume,
      unitPriceA: itemA?.unitPrice,
      totalA: itemA?.total,
      volumeB: itemB?.volume,
      unitPriceB: itemB?.unitPrice,
      totalB: itemB?.total,
      totalDiff,
      diffPercent,
      status,
    };
  });
}

type FilterType = 'all' | 'increased' | 'decreased' | 'added' | 'removed';

const STATUS_STYLE: Record<ComparisonItem['status'], string> = {
  increased: 'bg-red-500/10 text-red-400',
  decreased: 'bg-green-500/10 text-green-400',
  added: 'bg-blue-500/10 text-blue-400',
  removed: 'bg-gray-500/10 text-gray-400',
  unchanged: '',
};

const RABVersionComparison = ({ projectId, onClose }: RABVersionComparisonProps) => {
  const { projects } = useStore();
  const project = projects.find(p => p.id === projectId);
  const versions = project?.versions || [];

  const [versionAId, setVersionAId] = useState(versions[0]?.id || '');
  const [versionBId, setVersionBId] = useState(versions[versions.length - 1]?.id || '');
  const [filter, setFilter] = useState<FilterType>('all');

  const versionA = versions.find(v => v.id === versionAId);
  const versionB = versions.find(v => v.id === versionBId);

  const diffItems = useMemo(() => {
    if (!versionA || !versionB) return [];
    return computeVersionDiff(versionA, versionB);
  }, [versionA, versionB]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return diffItems;
    return diffItems.filter(item => item.status === filter);
  }, [diffItems, filter]);

  const grandTotalA = versionA?.summary?.grandTotal || versionA?.rabItems.reduce((s, i) => s + i.total, 0) || 0;
  const grandTotalB = versionB?.summary?.grandTotal || versionB?.rabItems.reduce((s, i) => s + i.total, 0) || 0;
  const totalDiff = grandTotalB - grandTotalA;

  const filterCounts = useMemo(() => ({
    all: diffItems.length,
    increased: diffItems.filter(i => i.status === 'increased').length,
    decreased: diffItems.filter(i => i.status === 'decreased').length,
    added: diffItems.filter(i => i.status === 'added').length,
    removed: diffItems.filter(i => i.status === 'removed').length,
  }), [diffItems]);

  if (versions.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative glass-card w-full max-w-md p-8 text-center space-y-4">
          <GitCompare size={40} className="mx-auto text-text-secondary opacity-30" />
          <p className="text-white font-bold">Minimal 2 versi diperlukan</p>
          <p className="text-text-secondary text-sm">Simpan RAB sebagai versi baru untuk membandingkan.</p>
          <button onClick={onClose} className="btn-primary">Tutup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <GitCompare size={20} className="text-primary" />
            <h3 className="text-white font-bold text-lg">Perbandingan Versi RAB</h3>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Version Selector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-widest">Versi A (Lama)</label>
              <select
                value={versionAId}
                onChange={e => setVersionAId(e.target.value)}
                className="w-full h-10 bg-background border border-border rounded-xl px-3 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNum} — {v.label || new Date(v.timestamp).toLocaleDateString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-secondary font-bold uppercase tracking-widest">Versi B (Baru)</label>
              <select
                value={versionBId}
                onChange={e => setVersionBId(e.target.value)}
                className="w-full h-10 bg-background border border-border rounded-xl px-3 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {versions.map(v => (
                  <option key={v.id} value={v.id}>
                    v{v.versionNum} — {v.label || new Date(v.timestamp).toLocaleDateString('id-ID')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-text-secondary text-xs uppercase font-bold tracking-widest mb-1">Grand Total A</p>
              <p className="text-white font-black text-lg">{formatCurrency(grandTotalA)}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-text-secondary text-xs uppercase font-bold tracking-widest mb-1">Grand Total B</p>
              <p className="text-white font-black text-lg">{formatCurrency(grandTotalB)}</p>
            </div>
            <div className={`glass-card p-4 text-center ${totalDiff > 0 ? 'border-red-500/20' : totalDiff < 0 ? 'border-green-500/20' : ''}`}>
              <p className="text-text-secondary text-xs uppercase font-bold tracking-widest mb-1">Selisih</p>
              <p className={`font-black text-lg ${totalDiff > 0 ? 'text-red-400' : totalDiff < 0 ? 'text-green-400' : 'text-white'}`}>
                {totalDiff > 0 ? '+' : ''}{formatCurrency(totalDiff)}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {([
              { key: 'all', label: 'Semua' },
              { key: 'increased', label: 'Naik', icon: <TrendingUp size={12} /> },
              { key: 'decreased', label: 'Turun', icon: <TrendingDown size={12} /> },
              { key: 'added', label: 'Baru', icon: <Plus size={12} /> },
              { key: 'removed', label: 'Dihapus', icon: <Minus size={12} /> },
            ] as { key: FilterType; label: string; icon?: React.ReactNode }[]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-text-secondary hover:text-white'
                }`}
              >
                {f.icon}
                {f.label}
                <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-[10px]">
                  {filterCounts[f.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Tabel Perbandingan */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">Kategori</th>
                  <th className="text-left py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">Nama Item</th>
                  <th className="text-right py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">Total A</th>
                  <th className="text-right py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">Total B</th>
                  <th className="text-right py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">Selisih</th>
                  <th className="text-right py-2 px-3 text-text-secondary text-xs font-bold uppercase tracking-widest">%</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr
                    key={item.id}
                    className={`border-b border-border/30 ${STATUS_STYLE[item.status]} ${item.status === 'removed' ? 'line-through opacity-60' : ''}`}
                  >
                    <td className="py-2 px-3 text-xs text-text-secondary">{item.category}</td>
                    <td className="py-2 px-3 text-white text-xs">{item.name}</td>
                    <td className="py-2 px-3 text-right text-xs">{item.totalA !== undefined ? formatCurrency(item.totalA) : '—'}</td>
                    <td className="py-2 px-3 text-right text-xs">{item.totalB !== undefined ? formatCurrency(item.totalB) : '—'}</td>
                    <td className={`py-2 px-3 text-right text-xs font-bold ${item.totalDiff > 0 ? 'text-red-400' : item.totalDiff < 0 ? 'text-green-400' : 'text-text-secondary'}`}>
                      {item.totalDiff !== 0 ? `${item.totalDiff > 0 ? '+' : ''}${formatCurrency(item.totalDiff)}` : '—'}
                    </td>
                    <td className={`py-2 px-3 text-right text-xs font-bold ${item.totalDiff > 0 ? 'text-red-400' : item.totalDiff < 0 ? 'text-green-400' : 'text-text-secondary'}`}>
                      {item.diffPercent !== 0 ? `${item.diffPercent > 0 ? '+' : ''}${item.diffPercent.toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-text-secondary text-sm">
                      Tidak ada item dengan filter ini
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RABVersionComparison;
