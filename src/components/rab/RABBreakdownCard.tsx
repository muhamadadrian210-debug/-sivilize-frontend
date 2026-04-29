/**
 * RABBreakdownCard "” Tampilkan breakdown Material vs Upah Jasa
 * Membantu kontraktor memahami komposisi biaya RAB
 */
import { Package, Users, Info } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

interface RABBreakdownCardProps {
  totalMaterial: number;
  totalLabor: number;
  materialPercent: number;
  laborPercent: number;
  grandTotal: number;
}

const RABBreakdownCard = ({
  totalMaterial,
  totalLabor,
  materialPercent,
  laborPercent,
  grandTotal,
}: RABBreakdownCardProps) => {
  if (grandTotal === 0) return null;

  return (
    <div className="glass-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Info size={16} className="text-primary" />
        <p className="text-white font-bold text-sm">Breakdown Biaya RAB</p>
        <span className="text-[10px] text-text-secondary bg-border px-2 py-0.5 rounded-full">
          Material + Jasa Tukang
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex h-4 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${materialPercent}%` }}
          >
            {materialPercent > 15 && (
              <span className="text-white text-[9px] font-bold">{materialPercent.toFixed(0)}%</span>
            )}
          </div>
          <div
            className="bg-orange-500 transition-all duration-500 flex items-center justify-center"
            style={{ width: `${laborPercent}%` }}
          >
            {laborPercent > 15 && (
              <span className="text-white text-[9px] font-bold">{laborPercent.toFixed(0)}%</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Material
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            Jasa Tukang
          </span>
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Material */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Package size={14} className="text-blue-400" />
            <span className="text-blue-400 text-xs font-bold">Biaya Material</span>
          </div>
          <p className="text-white font-black text-base">{formatCurrency(totalMaterial)}</p>
          <p className="text-blue-400/70 text-[10px] mt-0.5">{materialPercent.toFixed(1)}% dari subtotal</p>
          <p className="text-text-secondary text-[10px] mt-1 leading-relaxed">
            Semen, besi, bata, kayu, pipa, kabel, dll
          </p>
        </div>

        {/* Upah */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-orange-400" />
            <span className="text-orange-400 text-xs font-bold">Jasa Tukang</span>
          </div>
          <p className="text-white font-black text-base">{formatCurrency(totalLabor)}</p>
          <p className="text-orange-400/70 text-[10px] mt-0.5">{laborPercent.toFixed(1)}% dari subtotal</p>
          <p className="text-text-secondary text-[10px] mt-1 leading-relaxed">
            Upah pekerja, tukang, kepala tukang, mandor
          </p>
        </div>
      </div>

      {/* Catatan */}
      <p className="text-text-secondary text-[10px] leading-relaxed border-t border-border pt-3">
        * Breakdown ini adalah estimasi berdasarkan koefisien AHSP SE 47/SE/Dk/2026.
        Harga satuan sudah termasuk material + upah jasa tukang sesuai standar konstruksi Indonesia.
      </p>
    </div>
  );
};

export default RABBreakdownCard;
