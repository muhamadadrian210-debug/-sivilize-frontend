import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { getMaterialTransparency, getMaterialPricesByGrade, type MaterialGrade } from '../../data/prices';
import { Package, Info, AlertTriangle } from 'lucide-react';
import { formatCurrency, calculateRABBreakdown } from '../../utils/calculations';
import RABBreakdownCard from './RABBreakdownCard';
import { WASTE_FACTORS } from '../../utils/wasteFactors';

interface MaterialSummaryProps {
  items: RABItem[];
  cityId: string;
  grade: MaterialGrade;
}

const MaterialSummary = ({ items, cityId, grade }: MaterialSummaryProps) => {
  const materialPrices = getMaterialPricesByGrade(cityId, grade);
  const breakdown = calculateRABBreakdown(items);
  const subtotal = items.reduce((s, i) => s + i.total, 0);

  // Hitung kebutuhan material dengan faktor waste
  const materialNeeds = items.reduce((acc, item) => {
    const template = AHSP_TEMPLATES.find(t => t.name === item.name);
    if (template) {
      template.materials.forEach(mat => {
        const volumeBersih = mat.coeff * item.volume;
        const waste = WASTE_FACTORS[mat.name] ?? 0.05;
        const volumeBeli = volumeBersih * (1 + waste);
        const unitPrice = materialPrices[mat.name] || 0;
        if (acc[mat.name]) {
          acc[mat.name].volumeBersih += volumeBersih;
          acc[mat.name].volumeBeli  += volumeBeli;
        } else {
          acc[mat.name] = { volumeBersih, volumeBeli, unit: mat.unit, unitPrice, waste };
        }
      });
    }
    return acc;
  }, {} as { [key: string]: { volumeBersih: number; volumeBeli: number; unit: string; unitPrice: number; waste: number } });

  return (
    <div className="space-y-6">
      {/* Breakdown Material vs Upah */}
      <RABBreakdownCard
        totalMaterial={breakdown.totalMaterial}
        totalLabor={breakdown.totalLabor}
        materialPercent={breakdown.materialPercent}
        laborPercent={breakdown.laborPercent}
        grandTotal={subtotal}
      />

      {/* Daftar Material */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Kebutuhan Material</h3>
        </div>
        <p className="text-text-secondary text-xs mb-6 flex items-center gap-1">
          <AlertTriangle size={11} className="text-yellow-400" />
          Volume beli sudah termasuk faktor waste/susut sesuai standar lapangan
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(materialNeeds).map(([name, data]) => {
            const transparency = getMaterialTransparency(name, cityId, grade);
            const estimatedCost = data.volumeBeli * data.unitPrice;
            const wastePercent = Math.round(data.waste * 100);
            return (
            <div key={name} className="bg-background border border-border p-4 rounded-xl group hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-text-secondary text-xs uppercase font-bold tracking-widest truncate">{name}</p>
                  <p className="text-white font-black text-lg mt-1">
                    {data.volumeBeli.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                    <span className="text-text-secondary text-sm font-medium ml-1">{data.unit}</span>
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Terpasang: {data.volumeBersih.toLocaleString('id-ID', { maximumFractionDigits: 2 })} {data.unit}
                    {wastePercent > 0 && <span className="text-yellow-400 ml-1">(+{wastePercent}% waste)</span>}
                  </p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Brand: <span className="text-white">{transparency.brand}</span>
                  </p>
                  <p className="text-[10px] text-primary font-bold mt-1">{formatCurrency(estimatedCost)}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right ml-2 shrink-0">
                  <Info size={14} className="text-text-secondary ml-auto" />
                  <p className="text-[10px] text-text-secondary mt-1 max-w-[100px] text-right">{transparency.spec}</p>
                </div>
              </div>
            </div>
          )})}
          {Object.keys(materialNeeds).length === 0 && (
            <p className="text-text-secondary text-sm italic col-span-full py-8 text-center bg-background/50 rounded-xl border border-dashed border-border">
              Belum ada data material. Hasilkan RAB terlebih dahulu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialSummary;
