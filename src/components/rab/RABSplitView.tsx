/**
 * RABSplitView — Tampilkan RAB Material dan RAB Pekerja secara terpisah
 * Sesuai kebutuhan lapangan: kontraktor butuh dua dokumen berbeda
 */
import { useState } from 'react';
import { Package, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { getMaterialPricesByGrade, DEFAULT_LABOR_PRICES, type MaterialGrade } from '../../data/prices';
import { formatCurrency } from '../../utils/calculations';

interface RABSplitViewProps {
  items: RABItem[];
  cityId: string;
  grade: MaterialGrade;
}

interface MaterialRow {
  no: number;
  pekerjaan: string;
  kategori: string;
  volume: number;
  unit: string;
  materials: { nama: string; koef: number; satuan: string; hargaSatuan: number; jumlahTotal: number }[];
  totalMaterial: number;
}

interface LaborRow {
  no: number;
  pekerjaan: string;
  kategori: string;
  volume: number;
  unit: string;
  tenaga: { nama: string; koef: number; upah: number; jumlahTotal: number }[];
  totalUpah: number;
}

const CATEGORY_ORDER: Record<string, number> = {
  'Persiapan': 1, 'Tanah & Pondasi': 2, 'Struktur': 3,
  'Dinding & Plesteran': 4, 'Kusen, Pintu & Jendela': 5,
  'Atap & Plafon': 6, 'Lantai & Keramik': 7,
  'Instalasi Listrik': 8, 'Instalasi Air & Sanitasi': 9,
  'Finishing & Pengecatan': 10, 'Lain-lain': 11,
};

const RABSplitView = ({ items, cityId, grade }: RABSplitViewProps) => {
  const [activeTab, setActiveTab] = useState<'material' | 'pekerja'>('material');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const matPrices = getMaterialPricesByGrade(cityId, grade);

  // Build material rows
  const materialRows: MaterialRow[] = items
    .map((item, idx) => {
      const template = AHSP_TEMPLATES.find(t => t.name === item.name);
      if (!template || template.materials.length === 0) return null;
      const mats = template.materials.map(m => ({
        nama: m.name,
        koef: m.coeff,
        satuan: m.unit,
        hargaSatuan: matPrices[m.name] || 0,
        jumlahTotal: m.coeff * (matPrices[m.name] || 0) * item.volume,
      }));
      return {
        no: idx + 1,
        pekerjaan: item.name,
        kategori: item.category,
        volume: item.volume,
        unit: item.unit,
        materials: mats,
        totalMaterial: mats.reduce((s, m) => s + m.jumlahTotal, 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (CATEGORY_ORDER[a!.kategori] ?? 99) - (CATEGORY_ORDER[b!.kategori] ?? 99)) as MaterialRow[];

  // Build labor rows
  const laborRows: LaborRow[] = items
    .map((item, idx) => {
      const template = AHSP_TEMPLATES.find(t => t.name === item.name);
      if (!template || template.laborCoefficients.length === 0) return null;
      const tenaga = template.laborCoefficients.map(l => ({
        nama: l.name,
        koef: l.coeff,
        upah: DEFAULT_LABOR_PRICES[l.name] || 0,
        jumlahTotal: l.coeff * (DEFAULT_LABOR_PRICES[l.name] || 0) * item.volume,
      }));
      return {
        no: idx + 1,
        pekerjaan: item.name,
        kategori: item.category,
        volume: item.volume,
        unit: item.unit,
        tenaga,
        totalUpah: tenaga.reduce((s, t) => s + t.jumlahTotal, 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => (CATEGORY_ORDER[a!.kategori] ?? 99) - (CATEGORY_ORDER[b!.kategori] ?? 99)) as LaborRow[];

  const totalMaterialAll = materialRows.reduce((s, r) => s + r.totalMaterial, 0);
  const totalUpahAll = laborRows.reduce((s, r) => s + r.totalUpah, 0);

  const toggleRow = (no: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(no)) {
        next.delete(no);
      } else {
        next.add(no);
      }
      return next;
    });
  };

  // Group by category
  const groupByCategory = <T extends { kategori: string }>(rows: T[]) => {
    const map = new Map<string, T[]>();
    rows.forEach(r => {
      if (!map.has(r.kategori)) map.set(r.kategori, []);
      map.get(r.kategori)!.push(r);
    });
    return Array.from(map.entries()).sort(
      ([a], [b]) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99)
    );
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-background border border-border p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('material')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'material' ? 'bg-blue-500 text-white shadow' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Package size={14} />
          RAB Material
        </button>
        <button
          onClick={() => setActiveTab('pekerja')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'pekerja' ? 'bg-orange-500 text-white shadow' : 'text-text-secondary hover:text-white'
          }`}
        >
          <Users size={14} />
          RAB Pekerja
        </button>
      </div>

      {/* ── RAB MATERIAL ── */}
      {activeTab === 'material' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-blue-500/10 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package size={18} className="text-blue-400" />
              <div>
                <h3 className="text-white font-bold">Rencana Anggaran Biaya — Material</h3>
                <p className="text-text-secondary text-xs">Kebutuhan bahan bangunan per pekerjaan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-black text-lg">{formatCurrency(totalMaterialAll)}</p>
              <p className="text-text-secondary text-xs">Total Biaya Material</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {groupByCategory(materialRows).map(([kategori, rows]) => {
              const subtotal = rows.reduce((s, r) => s + r.totalMaterial, 0);
              return (
                <div key={kategori}>
                  {/* Category header */}
                  <div className="px-6 py-2 bg-border/20 border-y border-border flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{kategori}</span>
                    <span className="text-xs font-bold text-blue-400">{formatCurrency(subtotal)}</span>
                  </div>

                  {rows.map((row) => (
                    <div key={row.no} className="border-b border-border/50">
                      {/* Row header */}
                      <button
                        onClick={() => toggleRow(row.no)}
                        className="w-full px-6 py-3 flex items-center justify-between hover:bg-border/10 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {expandedRows.has(row.no)
                            ? <ChevronUp size={14} className="text-blue-400 shrink-0" />
                            : <ChevronDown size={14} className="text-text-secondary shrink-0" />
                          }
                          <span className="text-white text-sm font-medium truncate">{row.pekerjaan}</span>
                          <span className="text-text-secondary text-xs shrink-0">
                            {row.volume.toFixed(3)} {row.unit}
                          </span>
                        </div>
                        <span className="text-blue-400 font-bold text-sm ml-4 shrink-0">
                          {formatCurrency(row.totalMaterial)}
                        </span>
                      </button>

                      {/* Expanded detail */}
                      {expandedRows.has(row.no) && (
                        <div className="px-6 pb-3 bg-blue-500/3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-text-secondary border-b border-border/50">
                                <th className="py-1.5 text-left font-bold">Nama Bahan</th>
                                <th className="py-1.5 text-right font-bold">Koef/Sat</th>
                                <th className="py-1.5 text-center font-bold">Sat</th>
                                <th className="py-1.5 text-right font-bold">Vol Total</th>
                                <th className="py-1.5 text-right font-bold">Harga/Sat</th>
                                <th className="py-1.5 text-right font-bold">Jumlah</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.materials.map((m, i) => (
                                <tr key={i} className="border-b border-border/30 hover:bg-border/10">
                                  <td className="py-1.5 text-white">{m.nama}</td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">{m.koef}</td>
                                  <td className="py-1.5 text-center text-text-secondary">{m.satuan}</td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">
                                    {(m.koef * row.volume).toFixed(3)} {m.satuan}
                                  </td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">{formatCurrency(m.hargaSatuan)}</td>
                                  <td className="py-1.5 text-right text-blue-400 font-bold font-mono">{formatCurrency(m.jumlahTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Grand total */}
          <div className="px-6 py-4 bg-blue-500/10 border-t border-border flex justify-between items-center">
            <span className="text-blue-400 font-bold uppercase tracking-wide text-sm">Total Biaya Material</span>
            <span className="text-blue-400 font-black text-xl">{formatCurrency(totalMaterialAll)}</span>
          </div>
        </div>
      )}

      {/* ── RAB PEKERJA ── */}
      {activeTab === 'pekerja' && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 bg-orange-500/10 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-orange-400" />
              <div>
                <h3 className="text-white font-bold">Rencana Anggaran Biaya — Jasa Tukang</h3>
                <p className="text-text-secondary text-xs">Upah tenaga kerja per pekerjaan (OH = Orang Hari)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-orange-400 font-black text-lg">{formatCurrency(totalUpahAll)}</p>
              <p className="text-text-secondary text-xs">Total Biaya Upah</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {groupByCategory(laborRows).map(([kategori, rows]) => {
              const subtotal = rows.reduce((s, r) => s + r.totalUpah, 0);
              return (
                <div key={kategori}>
                  <div className="px-6 py-2 bg-border/20 border-y border-border flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">{kategori}</span>
                    <span className="text-xs font-bold text-orange-400">{formatCurrency(subtotal)}</span>
                  </div>

                  {rows.map((row) => (
                    <div key={row.no} className="border-b border-border/50">
                      <button
                        onClick={() => toggleRow(row.no + 10000)}
                        className="w-full px-6 py-3 flex items-center justify-between hover:bg-border/10 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {expandedRows.has(row.no + 10000)
                            ? <ChevronUp size={14} className="text-orange-400 shrink-0" />
                            : <ChevronDown size={14} className="text-text-secondary shrink-0" />
                          }
                          <span className="text-white text-sm font-medium truncate">{row.pekerjaan}</span>
                          <span className="text-text-secondary text-xs shrink-0">
                            {row.volume.toFixed(3)} {row.unit}
                          </span>
                        </div>
                        <span className="text-orange-400 font-bold text-sm ml-4 shrink-0">
                          {formatCurrency(row.totalUpah)}
                        </span>
                      </button>

                      {expandedRows.has(row.no + 10000) && (
                        <div className="px-6 pb-3 bg-orange-500/3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-text-secondary border-b border-border/50">
                                <th className="py-1.5 text-left font-bold">Tenaga Kerja</th>
                                <th className="py-1.5 text-right font-bold">Koef/Sat</th>
                                <th className="py-1.5 text-right font-bold">Total OH</th>
                                <th className="py-1.5 text-right font-bold">Upah/OH</th>
                                <th className="py-1.5 text-right font-bold">Jumlah</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.tenaga.map((t, i) => (
                                <tr key={i} className="border-b border-border/30 hover:bg-border/10">
                                  <td className="py-1.5 text-white">{t.nama}</td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">{t.koef} OH</td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">
                                    {(t.koef * row.volume).toFixed(3)} OH
                                  </td>
                                  <td className="py-1.5 text-right text-text-secondary font-mono">{formatCurrency(t.upah)}</td>
                                  <td className="py-1.5 text-right text-orange-400 font-bold font-mono">{formatCurrency(t.jumlahTotal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-orange-500/10 border-t border-border flex justify-between items-center">
            <span className="text-orange-400 font-bold uppercase tracking-wide text-sm">Total Biaya Upah Tukang</span>
            <span className="text-orange-400 font-black text-xl">{formatCurrency(totalUpahAll)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RABSplitView;
