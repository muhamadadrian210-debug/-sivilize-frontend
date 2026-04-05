import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { type RABItem } from '../../store/useStore';
import { formatCurrency } from '../../utils/calculations';

interface GroupedRABDisplayProps {
  items: RABItem[];
  onUpdateItem: (index: number, updates: Partial<RABItem>) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
  onSelectTeam: (itemId: string) => void;
}

interface GroupedData {
  kategori: string;
  items: RABItem[];
  subtotal: number;
  totalItems: number;
}

const GroupedRABDisplay = ({
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onSelectTeam
}: GroupedRABDisplayProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Group items by category
  const groupItems = (): GroupedData[] => {
    const categories: { [key: string]: RABItem[] } = {};

    items.forEach(item => {
      const cat = item.category || 'Lain-lain';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });

    return Object.entries(categories)
      .map(([kategori, groupItems]) => ({
        kategori,
        items: groupItems,
        subtotal: groupItems.reduce((sum, item) => sum + item.total, 0),
        totalItems: groupItems.length
      }))
      .sort((a, b) => b.subtotal - a.subtotal);
  };

  const grouped = groupItems();
  const totalAll = grouped.reduce((sum, g) => sum + g.subtotal, 0);

  const toggleCategory = (kategori: string) => {
    setExpandedCategories(prev =>
      prev.includes(kategori)
        ? prev.filter(k => k !== kategori)
        : [...prev, kategori]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-white font-bold uppercase tracking-widest text-xs">
            Detail Item Pekerjaan (Terkelompok)
          </h4>
          <p className="text-text-secondary text-xs">
            Total: {items.length} item | {grouped.length} kategori
          </p>
        </div>
        <button
          onClick={onAddItem}
          className="text-primary hover:text-primary-hover flex items-center gap-2 text-sm font-semibold"
        >
          <Plus size={16} />
          Tambah Pekerjaan
        </button>
      </div>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-text-secondary italic">
            Belum ada item RAB. Silakan hasilkan RAB terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group, groupIdx) => (
            <div key={group.kategori} className="glass-card overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.kategori)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-border/10 transition-colors bg-background/50"
              >
                <div className="flex items-center gap-4 flex-1">
                  {expandedCategories.includes(group.kategori) ? (
                    <ChevronUp className="text-primary" size={20} />
                  ) : (
                    <ChevronDown className="text-text-secondary" size={20} />
                  )}
                  <div className="text-left">
                    <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                      {group.kategori}
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {group.totalItems} item • Subtotal: {formatCurrency(group.subtotal)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">
                    {formatCurrency(group.subtotal)}
                  </p>
                </div>
              </button>

              {/* Category Items */}
              {expandedCategories.includes(group.kategori) && (
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full text-left min-w-[960px]">
                    <thead>
                      <tr className="bg-background text-text-secondary text-[10px] uppercase font-bold tracking-widest">
                        <th className="px-4 py-3">No</th>
                        <th className="px-4 py-3">Uraian Pekerjaan</th>
                        <th className="px-4 py-3">Volume</th>
                        <th className="px-4 py-3">Satuan</th>
                        <th className="px-4 py-3">Harga Satuan</th>
                        <th className="px-4 py-3">Jumlah</th>
                        <th className="px-4 py-3">Tim</th>
                        <th className="px-4 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {group.items.map((item, itemIdx) => {
                        const itemIndex = items.findIndex(i => i.id === item.id);
                        return (
                          <tr key={item.id} className="hover:bg-border/20 transition-colors">
                            <td className="px-4 py-3 text-text-secondary text-sm">{itemIdx + 1}</td>
                            <td className="px-4 py-3 text-white font-medium text-sm">{item.name}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={item.volume.toFixed(2)}
                                onChange={(e) => {
                                  const newVolume = parseFloat(e.target.value) || 0;
                                  onUpdateItem(itemIndex, {
                                    ...item,
                                    volume: newVolume,
                                    total: newVolume * item.unitPrice
                                  });
                                }}
                                className="w-20 bg-background border border-border rounded px-2 py-1 text-white text-xs focus:border-primary outline-none"
                              />
                            </td>
                            <td className="px-4 py-3 text-text-secondary text-sm">{item.unit}</td>
                            <td className="px-4 py-3 text-white text-sm font-mono">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-4 py-3 text-white font-bold text-sm">
                              {formatCurrency(item.total)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => onSelectTeam(item.id)}
                                className="text-primary hover:text-primary-hover text-xs font-bold"
                              >
                                {Object.values(item.assignedTeam || {}).reduce((a, b) => a + b, 0)} orang
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => onDeleteItem(itemIndex)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subtotal */}
              <div className="px-6 py-3 bg-background/30 border-t border-border flex items-center justify-between font-bold">
                <span className="text-text-secondary uppercase text-xs tracking-wide">
                  Subtotal {group.kategori}
                </span>
                <span className="text-white">{formatCurrency(group.subtotal)}</span>
              </div>
            </div>
          ))}

          {/* Grand Total */}
          <div className="glass-card px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-lg uppercase tracking-wide">
                Total Keseluruhan
              </span>
              <span className="text-primary text-2xl font-black">
                {formatCurrency(totalAll)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupedRABDisplay;
