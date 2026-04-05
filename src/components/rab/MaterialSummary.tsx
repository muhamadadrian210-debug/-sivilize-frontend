import { type RABItem } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { getMaterialTransparency, getMaterialPricesByGrade, type MaterialGrade } from '../../data/prices';
import { Package, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface MaterialSummaryProps {
  items: RABItem[];
  cityId: string;
  grade: MaterialGrade;
}

const MaterialSummary = ({ items, cityId, grade }: MaterialSummaryProps) => {
  const materialPrices = getMaterialPricesByGrade(cityId, grade);
  const materialNeeds = items.reduce((acc, item) => {
    const template = AHSP_TEMPLATES.find(t => t.name === item.name);
    if (template) {
      template.materials.forEach(mat => {
        const totalAmount = mat.coeff * item.volume;
        const unitPrice = materialPrices[mat.name] || 0;
        if (acc[mat.name]) {
          acc[mat.name].amount += totalAmount;
        } else {
          acc[mat.name] = { amount: totalAmount, unit: mat.unit, unitPrice };
        }
      });
    }
    return acc;
  }, {} as { [key: string]: { amount: number, unit: string, unitPrice: number } });

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-primary" size={24} />
        <h3 className="text-xl font-bold text-white">Kebutuhan Material</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(materialNeeds).map(([name, data]) => {
          const transparency = getMaterialTransparency(name, cityId, grade);
          const estimatedCost = data.amount * data.unitPrice;
          return (
          <div key={name} className="bg-background border border-border p-4 rounded-xl flex items-center justify-between group hover:border-primary/30 transition-colors">
            <div>
              <p className="text-text-secondary text-xs uppercase font-bold tracking-widest">{name}</p>
              <p className="text-white font-black text-lg mt-1">
                {data.amount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                <span className="text-text-secondary text-sm font-medium ml-1">{data.unit}</span>
              </p>
              <p className="text-[10px] text-text-secondary mt-1">
                Brand: <span className="text-white">{transparency.brand}</span>
              </p>
              <p className="text-[10px] text-text-secondary">
                Estimasi: <span className="text-white">{formatCurrency(estimatedCost)}</span>
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-right">
              <Info size={16} className="text-text-secondary ml-auto" />
              <p className="text-[10px] text-text-secondary mt-1">{transparency.spec}</p>
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
  );
};

export default MaterialSummary;
