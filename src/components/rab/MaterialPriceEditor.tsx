/**
 * MaterialPriceEditor — Update harga material manual oleh user
 * Harga pasar berubah tiap bulan, user bisa override sesuai kondisi lokal
 */
import { useState, useMemo } from 'react';
import { Search, RefreshCw, Save, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { getMaterialPricesByGrade, DEFAULT_LABOR_PRICES, type MaterialGrade } from '../../data/prices';
import { formatCurrency } from '../../utils/calculations';

interface MaterialPriceEditorProps {
  cityId: string;
  grade: MaterialGrade;
  customPrices: Record<string, number>;
  onUpdate: (prices: Record<string, number>) => void;
}

// Kelompok material untuk tampilan terorganisir
const MATERIAL_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: 'Struktur Utama',
    keys: ['Semen PC', 'Pasir Beton', 'Pasir Pasang', 'Krikil (Split)', 'Besi Beton', 'Kawat Beton', 'Bata Merah'],
  },
  {
    label: 'Kayu & Bekisting',
    keys: ['Kayu Bekisting', 'Kayu Kaso 5/7', 'Papan Kayu 2/20', 'Kayu Kusen', 'Paku', 'Minyak Bekisting'],
  },
  {
    label: 'Atap',
    keys: ['Baja Ringan C75', 'Reng Baja Ringan', 'Genteng Beton', 'Spandek/Galvalum', 'Sekrup Roofing'],
  },
  {
    label: 'Lantai & Keramik',
    keys: ['Keramik 40x40', 'Keramik 60x60', 'Granit 60x60', 'Keramik Dinding 25x40', 'Semen Warna'],
  },
  {
    label: 'Finishing & Cat',
    keys: ['Plamir', 'Cat Dasar', 'Cat Penutup', 'Cat Eksterior', 'Cat Kayu', 'Waterproofing Coating', 'Acian'],
  },
  {
    label: 'Plumbing & Sanitasi',
    keys: ['Pipa PVC 1/2"', 'Pipa PVC 3"', 'Pipa PVC 4"', 'Fitting PVC', 'Kloset Duduk', 'Kloset Jongkok', 'Wastafel'],
  },
  {
    label: 'Elektrikal',
    keys: ['Kabel NYM 2x1.5mm', 'Kabel NYM 3x2.5mm', 'Stop Kontak', 'Saklar', 'MCB 1 Phase', 'Box Panel MCB'],
  },
];

const LABOR_KEYS = Object.keys(DEFAULT_LABOR_PRICES);

const MaterialPriceEditor = ({ cityId, grade, customPrices, onUpdate }: MaterialPriceEditorProps) => {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<'material' | 'labor'>('material');
  const [localPrices, setLocalPrices] = useState<Record<string, number>>({ ...customPrices });
  const [localLabor, setLocalLabor] = useState<Record<string, number>>({ ...DEFAULT_LABOR_PRICES });
  const [saved, setSaved] = useState(false);

  const defaultMaterialPrices = useMemo(() => getMaterialPricesByGrade(cityId, grade), [cityId, grade]);

  const getEffectivePrice = (key: string) =>
    localPrices[key] ?? defaultMaterialPrices[key] ?? 0;

  const getDiff = (key: string) => {
    const def = defaultMaterialPrices[key] ?? 0;
    const cur = localPrices[key] ?? def;
    if (def === 0) return 0;
    return ((cur - def) / def) * 100;
  };

  const handleMaterialChange = (key: string, val: string) => {
    const num = parseFloat(val.replace(/\D/g, '')) || 0;
    setLocalPrices(prev => ({ ...prev, [key]: num }));
    setSaved(false);
  };

  const handleLaborChange = (key: string, val: string) => {
    const num = parseFloat(val.replace(/\D/g, '')) || 0;
    setLocalLabor(prev => ({ ...prev, [key]: num }));
    setSaved(false);
  };

  const handleReset = (key: string) => {
    setLocalPrices(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    onUpdate({ ...localPrices, ...Object.fromEntries(Object.entries(localLabor).map(([k, v]) => [`__labor__${k}`, v])) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filteredGroups = MATERIAL_GROUPS.map(g => ({
    ...g,
    keys: g.keys.filter(k => !search || k.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.keys.length > 0);

  const filteredLabor = LABOR_KEYS.filter(k => !search || k.toLowerCase().includes(search.toLowerCase()));

  const customCount = Object.keys(localPrices).length;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-yellow-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-yellow-400" />
            <div>
              <h3 className="text-white font-bold">Update Harga Material & Upah</h3>
              <p className="text-text-secondary text-xs mt-0.5">
                Sesuaikan dengan harga pasar lokal saat ini. {customCount > 0 && (
                  <span className="text-yellow-400 font-bold">{customCount} harga diubah</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              saved ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/80'
            }`}
          >
            <Save size={14} />
            {saved ? 'Tersimpan!' : 'Simpan Harga'}
          </button>
        </div>
      </div>

      {/* Search & Tab */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari material atau upah..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:border-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-lg">
          <button
            onClick={() => setActiveGroup('material')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeGroup === 'material' ? 'bg-primary text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Material
          </button>
          <button
            onClick={() => setActiveGroup('labor')}
            className={`px-3 py-1 rounded text-xs font-bold transition-all ${activeGroup === 'labor' ? 'bg-orange-500 text-white' : 'text-text-secondary hover:text-white'}`}
          >
            Upah Tukang
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[500px]">
        {activeGroup === 'material' && (
          <div>
            {filteredGroups.map(group => (
              <div key={group.label}>
                <div className="px-6 py-2 bg-border/20 border-b border-border">
                  <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{group.label}</span>
                </div>
                <div className="divide-y divide-border/30">
                  {group.keys.map(key => {
                    const def = defaultMaterialPrices[key] ?? 0;
                    const cur = getEffectivePrice(key);
                    const diff = getDiff(key);
                    const isCustom = key in localPrices;
                    return (
                      <div key={key} className={`px-6 py-3 flex items-center gap-4 hover:bg-border/10 transition-colors ${isCustom ? 'bg-yellow-500/3' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{key}</p>
                          <p className="text-text-secondary text-xs">
                            Default: {formatCurrency(def)}
                            {isCustom && diff !== 0 && (
                              <span className={`ml-2 font-bold flex items-center gap-0.5 inline-flex ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">Rp</span>
                            <input
                              type="number"
                              min="0"
                              value={cur || ''}
                              onChange={e => handleMaterialChange(key, e.target.value)}
                              className={`w-36 bg-background border rounded-lg pl-8 pr-3 py-1.5 text-white text-sm focus:border-primary outline-none ${isCustom ? 'border-yellow-500/50' : 'border-border'}`}
                              placeholder={String(def)}
                            />
                          </div>
                          {isCustom && (
                            <button
                              onClick={() => handleReset(key)}
                              title="Reset ke default"
                              className="text-text-secondary hover:text-white transition-colors"
                            >
                              <RefreshCw size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <p className="text-text-secondary text-sm text-center py-8">Tidak ada material yang cocok</p>
            )}
          </div>
        )}

        {activeGroup === 'labor' && (
          <div>
            <div className="px-6 py-2 bg-orange-500/5 border-b border-border">
              <p className="text-xs text-orange-400 font-bold">Upah per OH (Orang Hari) — standar 2026</p>
            </div>
            <div className="divide-y divide-border/30">
              {filteredLabor.map(key => {
                const def = DEFAULT_LABOR_PRICES[key] ?? 0;
                const cur = localLabor[key] ?? def;
                const diff = def > 0 ? ((cur - def) / def) * 100 : 0;
                const isCustom = cur !== def;
                return (
                  <div key={key} className={`px-6 py-3 flex items-center gap-4 hover:bg-border/10 transition-colors ${isCustom ? 'bg-orange-500/3' : ''}`}>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{key}</p>
                      <p className="text-text-secondary text-xs">
                        Default: {formatCurrency(def)}/OH
                        {isCustom && diff !== 0 && (
                          <span className={`ml-2 font-bold ${diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={cur || ''}
                        onChange={e => handleLaborChange(key, e.target.value)}
                        className={`w-36 bg-background border rounded-lg pl-8 pr-3 py-1.5 text-white text-sm focus:border-primary outline-none ${isCustom ? 'border-orange-500/50' : 'border-border'}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border bg-background/50">
        <p className="text-text-secondary text-[10px]">
          * Harga default berdasarkan HSPK 2026 + faktor provinsi. Update sesuai survei harga toko material lokal Anda.
          Perubahan hanya berlaku untuk proyek ini.
        </p>
      </div>
    </div>
  );
};

export default MaterialPriceEditor;
