import { formatCurrency } from '../../utils/calculations';
import { TrendingUp, ChevronUp } from 'lucide-react';

interface StickyTotalBarProps {
  subtotal: number;
  grandTotal: number;
  itemCount: number;
  onScrollToTop?: () => void;
}

/**
 * Sticky Total Bar "” tampil di bawah layar saat scroll
 * Mobile-friendly, jempol-friendly
 */
const StickyTotalBar = ({ subtotal, grandTotal, itemCount, onScrollToTop }: StickyTotalBarProps) => {
  if (grandTotal === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:left-64">
      <div className="bg-card/95 backdrop-blur-md border-t border-primary/50 shadow-2xl px-3 py-2 sm:px-4 sm:py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: item count */}
          <div className="flex items-center gap-1.5 xs:gap-2 shrink-0">
            <div className="w-7 h-7 xs:w-8 xs:h-8 bg-primary/20 rounded-lg flex items-center justify-center hidden xs:flex">
              <TrendingUp size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-[7px] xs:text-[9px] sm:text-[10px] text-text-secondary uppercase font-bold tracking-widest leading-none">Item</p>
              <p className="text-white font-black text-[10px] xs:text-xs sm:text-sm">{itemCount}</p>
            </div>
          </div>

          {/* Center: subtotal */}
          <div className="text-center hidden sm:block">
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest leading-none">Subtotal</p>
            <p className="text-white font-bold text-sm">{formatCurrency(subtotal)}</p>
          </div>

          {/* Right: grand total */}
          <div className="text-right flex-1 sm:flex-none">
            <p className="text-[7px] xs:text-[9px] sm:text-[10px] text-text-secondary uppercase font-bold tracking-widest leading-none">Grand Total</p>
            <p className="text-primary font-black text-xs xs:text-sm sm:text-lg leading-tight">{formatCurrency(grandTotal)}</p>
          </div>

          {/* Scroll to top button */}
          {onScrollToTop && (
            <button
              onClick={onScrollToTop}
              className="shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
            >
              <ChevronUp size={16} className="sm:hidden" />
              <ChevronUp size={20} className="hidden sm:block" />
            </button>
          )}
        </div>
        {/* Disclaimer - Hidden on very small screens to save space */}
        <p className="text-center text-[7px] xs:text-[9px] sm:text-[10px] text-text-secondary mt-1 pb-0.5 hidden xs:block">
          * Estimasi berdasarkan AHSP SE 47/SE/Dk/2026 & harga pasar 2026.
        </p>
      </div>
    </div>
  );
};

export default StickyTotalBar;
