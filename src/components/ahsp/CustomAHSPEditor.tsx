/**
 * CustomAHSPEditor — UI untuk user edit koefisien AHSP sesuai daerah mereka
 * Bahasa mudah dimengerti semua kalangan
 */

import { useState } from 'react';
import { Edit2, Save, X, RotateCcw, Info, CheckCircle2, MapPin } from 'lucide-react';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { useCustomAHSP } from '../../hooks/useCustomAHSP';
import { useStore } from '../../store/useStore';
import { useToast } from '../common/Toast';

const CATEGORIES = ['Semua', 'Persiapan', 'Tanah & Pondasi', 'Struktur', 'Dinding & Plesteran', 'Atap & Plafon', 'Lantai & Keramik', 'Instalasi Listrik', 'Instalasi Air & Sanitasi', 'Finishing & Pengecatan'];

const CustomAHSPEditor = () => {
  const { user } = useStore();
  const { showToast } = useToast();
  const { customizations, setCustom, removeCustom, resetAll, hasCustom, getCustom, totalCustomized } = useCustomAHSP(user?.id);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    materialOverrides: Record<string, number>;
    laborOverrides: Record<string, number>;
    notes: string;
  }>({ materialOverrides: {}, laborOverrides: {}, notes: '' });

  const filtered = AHSP_TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  const startEdit = (id: string) => {
    const template = AHSP_TEMPLATES.find(t => t.id === id)!;
    const existing = getCustom(id);
    const matOverrides: Record<string, number> = {};
    const labOverrides: Record<string, number> = {};
    template.materials.forEach(m => { matOverrides[m.name] = existing?.materialOverrides?.[m.name] ?? m.coeff; });
    template.laborCoefficients.forEach(l => { labOverrides[l.name] = existing?.laborOverrides?.[l.name] ?? l.coeff; });
    setEditValues({ materialOverrides: matOverrides, laborOverrides: labOverrides, notes: existing?.notes || '' });
    setEditingId(id);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const template = AHSP_TEMPLATES.find(t => t.id === editingId)!;
    // Cek apakah ada perubahan dari default
    const matChanged: Record<string, number> = {};
    const labChanged: Record<string, number> = {};
    template.materials.forEach(m => {
      if (editValues.materialOverrides[m.name] !== m.coeff) matChanged[m.name] = editValues.materialOverrides[m.name];
    });
    template.laborCoefficients.forEach(l => {
      if (editValues.laborOverrides[l.name] !== l.coeff) labChanged[l.name] = editValues.laborOverrides[l.name];
    });

    if (Object.keys(matChanged).length === 0 && Object.keys(labChanged).length === 0 && !editValues.notes) {
      removeCustom(editingId);
      showToast('Dikembalikan ke nilai default', 'info');
    } else {
      setCustom(editingId, {
        materialOverrides: Object.keys(matChanged).length > 0 ? matChanged : undefined,
        laborOverrides: Object.keys(labChanged).length > 0 ? labChanged : undefined,
        notes: editValues.notes || undefined,
      });
      showToast(`AHSP "${template.name}" berhasil disesuaikan untuk daerah Anda`, 'success');
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            AHSP Custom Daerah Saya
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            Sesuaikan koefisien material & upah dengan harga di daerah Anda.
            Perubahan ini hanya berlaku untuk akun Anda.
          </p>
        </div>
        {totalCustomized > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {totalCustomized} item dikustomisasi
            </span>
            <button
              onClick={() => { resetAll(); showToast('Semua AHSP dikembalikan ke default', 'info'); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} />
              Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-white">Cara pakai:</strong> Cari item pekerjaan yang ingin disesuaikan, klik Edit, lalu ubah angka koefisiennya sesuai kondisi di daerah Anda.
          Misalnya: upah tukang di Papua lebih tinggi dari Jawa — ubah koefisien "Pekerja" sesuai upah setempat.
          <br /><span className="text-yellow-400 font-bold">Angka yang berubah akan otomatis dipakai saat Anda generate RAB.</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Cari item pekerjaan..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary outline-none"
        />
        <select
          value={activeCategory}
          onChange={e => setActiveCategory(e.target.value)}
          className="bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary outline-none"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List AHSP */}
      <div className="space-y-2">
        {filtered.map(template => {
          const isCustomized = hasCustom(template.id);
          const custom = getCustom(template.id);
          const isEditing = editingId === template.id;

          return (
            <div key={template.id} className={`border rounded-xl transition-all ${isCustomized ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/50'}`}>
              {/* Header item */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isCustomized && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{template.name}</p>
                    <p className="text-text-secondary text-xs">{template.category} • {template.unit}</p>
                    {custom?.notes && <p className="text-primary/70 text-xs mt-0.5 italic">"{custom.notes}"</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCustomized && (
                    <button onClick={() => { removeCustom(template.id); showToast('Dikembalikan ke default', 'info'); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors p-1">
                      <RotateCcw size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => isEditing ? setEditingId(null) : startEdit(template.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isEditing ? 'bg-border text-text-secondary' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  >
                    {isEditing ? <><X size={12} /> Batal</> : <><Edit2 size={12} /> Edit</>}
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Material coefficients */}
                  {template.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Koefisien Material</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {template.materials.map(m => (
                          <div key={m.name} className="flex items-center gap-2 bg-background rounded-lg p-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs font-bold truncate">{m.name}</p>
                              <p className="text-text-secondary text-[10px]">Default: {m.coeff} {m.unit}</p>
                            </div>
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={editValues.materialOverrides[m.name] ?? m.coeff}
                              onChange={e => setEditValues(prev => ({
                                ...prev,
                                materialOverrides: { ...prev.materialOverrides, [m.name]: parseFloat(e.target.value) || 0 }
                              }))}
                              className={`w-20 bg-card border rounded-lg px-2 py-1 text-white text-xs text-right outline-none focus:border-primary ${
                                (editValues.materialOverrides[m.name] ?? m.coeff) !== m.coeff ? 'border-primary' : 'border-border'
                              }`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Labor coefficients */}
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Koefisien Upah (OH = Orang Hari)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {template.laborCoefficients.map(l => (
                        <div key={l.name} className="flex items-center gap-2 bg-background rounded-lg p-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{l.name}</p>
                            <p className="text-text-secondary text-[10px]">Default: {l.coeff} OH</p>
                          </div>
                          <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={editValues.laborOverrides[l.name] ?? l.coeff}
                            onChange={e => setEditValues(prev => ({
                              ...prev,
                              laborOverrides: { ...prev.laborOverrides, [l.name]: parseFloat(e.target.value) || 0 }
                            }))}
                            className={`w-20 bg-card border rounded-lg px-2 py-1 text-white text-xs text-right outline-none focus:border-primary ${
                              (editValues.laborOverrides[l.name] ?? l.coeff) !== l.coeff ? 'border-primary' : 'border-border'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Catatan (opsional)</p>
                    <input
                      type="text"
                      placeholder="Contoh: Upah tukang di daerah saya lebih tinggi"
                      value={editValues.notes}
                      onChange={e => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-xs focus:border-primary outline-none"
                    />
                  </div>

                  <button onClick={saveEdit} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold">
                    <Save size={14} />
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <p>Tidak ada item yang cocok dengan pencarian.</p>
        </div>
      )}
    </div>
  );
};

export default CustomAHSPEditor;
