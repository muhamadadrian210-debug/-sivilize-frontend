/**
 * AHSPDetailPanel â€” Panel detail komposisi AHSP per item pekerjaan
 * Menampilkan: material apa saja, berapa banyak, berapa harganya, dan upah tukang
 * Referensi: SE 47/SE/Dk/2026
 */
import { Package, Users, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { getMaterialPricesByGrade, DEFAULT_LABOR_PRICES, type MaterialGrade } from '../../data/prices';
import { formatCurrency } from '../../utils/calculations';

interface AHSPDetailPanelProps {
  item: RABItem;
  cityId: string;
  grade: MaterialGrade;
}

const AHSPDetailPanel = ({ item, cityId, grade }: AHSPDetailPanelProps) => {
  const [open, setOpen] = useState(false);

  const template = AHSP_TEMPLATES.find(t => t.name === item.name);
  if (!template) return null;

  const matPrices = getMaterialPricesByGrade(cityId, grade);

  // Hitung per komponen
  const materialRows = template.materials.map(m => {
    const hargaSatuan = matPrices[m.name] || 0;
    const total = m.coeff * hargaSatuan;
    return { nama: m.name, koef: m.coeff, satuan: m.unit, hargaSatuan, total };
  });

  const laborRows = template.laborCoefficients.map(l => {
    const upah = DEFAULT_LABOR_PRICES[l.name] || 0;
    const total = l.coeff * upah;
    return { nama: l.name, koef: l.coeff, satuan: l.unit, upah, total };
  });

  const totalMaterial = materialRows.reduce((s, r) => s + r.total, 0);
  const totalLabor = laborRows.reduce((s, r) => s + r.total, 0);
  const totalPerSatuan = totalMaterial + totalLabor;
  const totalPekerjaan = totalPerSatuan * item.volume;

  const matPercent = totalPerSatuan > 0 ? (totalMaterial / totalPerSatuan) * 100 : 0;
  const labPercent = totalPerSatuan > 0 ? (totalLabor / totalPerSatuan) * 100 : 0;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[11px] text-primary hover:text-primary-hover font-bold transition-colors"
      >
        <BookOpen size={12} />
        {open ? 'Sembunyikan' : 'Lihat Komposisi AHSP'}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {open && (
        <div className="mt-3 bg-background border border-border rounded-xl overflow-hidden text-xs">
          {/* Header */}
          <div className="px-4 py-3 bg-primary/10 border-b border-border">
            <p className="text-primary font-bold text-[11px] uppercase tracking-widest">
              Analisa Harga Satuan â€” {item.name}
            </p>
            <p className="text-text-secondary text-[10px] mt-0.5">
              Ref: SE 47/SE/Dk/2026 | Volume: {item.volume.toFixed(3)} {item.unit}
            </p>
          </div>

          {/* Progress bar material vs upah */}
          <div className="px-4 py-2 border-b border-border">
            <div className="flex h-2 rounded-full overflow-hidden mb-1">
              <div className="bg-blue-500" style={{ width: `${matPercent}%` }} />
              <div className="bg-orange-500" style={{ width: `${labPercent}%` }} />
            </div>
            <div className="flex gap-4 text-[10px] text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Material {matPercent.toFixed(0)}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                Upah {labPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Tabel Material */}
          {materialRows.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-2 bg-blue-500/5 flex items-center gap-2">
                <Package size={12} className="text-blue-400" />
                <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest">
                  Bahan Material
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-text-secondary border-b border-border">
                    <th className="px-4 py-1.5 text-left font-bold">Nama Bahan</th>
                    <th className="px-3 py-1.5 text-right font-bold">Koef</th>
                    <th className="px-3 py-1.5 text-center font-bold">Sat</th>
                    <th className="px-3 py-1.5 text-right font-bold">Harga/Sat</th>
                    <th className="px-4 py-1.5 text-right font-bold">Jumlah/Sat</th>
                  </tr>
                </thead>
                <tbody>
                  {materialRows.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-border/10">
                      <td className="px-4 py-1.5 text-white">{r.nama}</td>
                      <td className="px-3 py-1.5 text-right text-text-secondary font-mono">{r.koef}</td>
                      <td className="px-3 py-1.5 text-center text-text-secondary">{r.satuan}</td>
                      <td className="px-3 py-1.5 text-right text-text-secondary font-mono">{formatCurrency(r.hargaSatuan)}</td>
                      <td className="px-4 py-1.5 text-right text-blue-400 font-bold font-mono">{formatCurrency(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-500/5">
                    <td colSpan={4} className="px-4 py-1.5 text-blue-400 font-bold text-[10px] uppercase">Total Material/Satuan</td>
                    <td className="px-4 py-1.5 text-right text-blue-400 font-black">{formatCurrency(totalMaterial)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tabel Upah */}
          {laborRows.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-2 bg-orange-500/5 flex items-center gap-2">
                <Users size={12} className="text-orange-400" />
                <span className="text-orange-400 font-bold text-[10px] uppercase tracking-widest">
                  Upah Tenaga Kerja
                </span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-text-secondary border-b border-border">
                    <th className="px-4 py-1.5 text-left font-bold">Tenaga Kerja</th>
                    <th className="px-3 py-1.5 text-right font-bold">Koef</th>
                    <th className="px-3 py-1.5 text-center font-bold">Sat</th>
                    <th className="px-3 py-1.5 text-right font-bold">Upah/OH</th>
                    <th className="px-4 py-1.5 text-right font-bold">Jumlah/Sat</th>
                  </tr>
                </thead>
                <tbody>
                  {laborRows.map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-border/10">
                      <td className="px-4 py-1.5 text-white">{r.nama}</td>
                      <td className="px-3 py-1.5 text-right text-text-secondary font-mono">{r.koef}</td>
                      <td className="px-3 py-1.5 text-center text-text-secondary">{r.satuan}</td>
                      <td className="px-3 py-1.5 text-right text-text-secondary font-mono">{formatCurrency(r.upah)}</td>
                      <td className="px-4 py-1.5 text-right text-orange-400 font-bold font-mono">{formatCurrency(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-orange-500/5">
                    <td colSpan={4} className="px-4 py-1.5 text-orange-400 font-bold text-[10px] uppercase">Total Upah/Satuan</td>
                    <td className="px-4 py-1.5 text-right text-orange-400 font-black">{formatCurrency(totalLabor)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          <div className="px-4 py-3 bg-primary/5 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Harga Satuan (Material + Upah)</span>
              <span className="text-white font-bold">{formatCurrency(totalPerSatuan)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-secondary">Volume</span>
              <span className="text-white font-bold">{item.volume.toFixed(3)} {item.unit}</span>
            </div>
            <div className="flex justify-between text-[12px] border-t border-border pt-1.5 mt-1">
              <span className="text-primary font-bold uppercase tracking-wide">Total Pekerjaan Ini</span>
              <span className="text-primary font-black">{formatCurrency(totalPekerjaan)}</span>
            </div>
          </div>

          {/* Catatan */}
          <div className="px-4 py-2 bg-background/50">
            <p className="text-text-secondary text-[10px] italic">
              * Koefisien berdasarkan AHSP SE 47/SE/Dk/2026. Upah menggunakan standar 2026.
              Harga material sesuai lokasi proyek ({grade === 'A' ? 'Grade A - Premium' : grade === 'B' ? 'Grade B - Standar' : 'Grade C - Ekonomis'}).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AHSPDetailPanel;
