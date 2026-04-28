/**
 * CustomAHSPEditor — UI untuk user edit koefisien AHSP sesuai daerah mereka
 * Anti-curang: batas ±30% dari SNI + sumpah kejujuran + log perubahan
 */

import { useState } from 'react';
import { Edit2, Save, X, RotateCcw, Info, CheckCircle2, MapPin, AlertTriangle, Shield } from 'lucide-react';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { useCustomAHSP } from '../../hooks/useCustomAHSP';
import { useStore } from '../../store/useStore';
import { useToast } from '../common/Toast';

const CATEGORIES = ['Semua', 'Persiapan', 'Tanah & Pondasi', 'Struktur', 'Dinding & Plesteran', 'Atap & Plafon', 'Lantai & Keramik', 'Instalasi Listrik', 'Instalasi Air & Sanitasi', 'Finishing & Pengecatan'];

// Batas maksimal perubahan dari SNI: ±30%
const MAX_DEVIATION = 0.30;

const getDeviation = (custom: number, original: number): number => {
  if (original === 0) return 0;
  return (custom - original) / original;
};

const isOutOfBounds = (custom: number, original: number): boolean => {
  const dev = getDeviation(custom, original);
  return Math.abs(dev) > MAX_DEVIATION;
};

const DeviationBadge = ({ custom, original }: { custom: number; original: number }) => {
  if (original === 0 || custom === original) return null;
  const dev = getDeviation(custom, original);
  const pct = (dev * 100).toFixed(1);
  const outOfBounds = Math.abs(dev) > MAX_DEVIATION;
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${outOfBounds ? 'bg-red-500/20 text-red-400' : dev > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
      {dev > 0 ? '+' : ''}{pct}%{outOfBounds ? ' ⚠️' : ''}
    </span>
  );
};

const CustomAHSPEditor = () => {
  const { user } = useStore();
  const { showToast } = useToast();
  const { setCustom, removeCustom, resetAll, hasCustom, getCustom, totalCustomized } = useCustomAHSP(user?.id);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    materialOverrides: Record<string, number>;
    laborOverrides: Record<string, number>;
    notes: string;
  }>({ materialOverrides: {}, laborOverrides: {}, notes: '' });
  const [integrityChecked, setIntegrityChecked] = useState(false);
  const [showIntegrityPopup, setShowIntegrityPopup] = useState(false);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const filtered = AHSP_TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'Semua' || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  const openIntegrityPopup = (id: string) => {
    setPendingEditId(id);
    setIntegrityChecked(false);
    setShowIntegrityPopup(true);
  };

  const confirmIntegrity = () => {
    if (!integrityChecked || !pendingEditId) return;
    setShowIntegrityPopup(false);
    startEdit(pendingEditId);
  };

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

  // Cek apakah ada nilai yang melebihi batas
  const hasOutOfBounds = (template: typeof AHSP_TEMPLATES[0]): boolean => {
    return (
      template.materials.some(m => isOutOfBounds(editValues.materialOverrides[m.name] ?? m.coeff, m.coeff)) ||
      template.laborCoefficients.some(l => isOutOfBounds(editValues.laborOverrides[l.name] ?? l.coeff, l.coeff))
    );
  };

  const saveEdit = () => {
    if (!editingId) return;
    const template = AHSP_TEMPLATES.find(t => t.id === editingId)!;

    // Cek batas ±30%
    if (hasOutOfBounds(template)) {
      showToast('Beberapa nilai melebihi batas ±30% dari SNI. Harap sesuaikan.', 'error');
      return;
    }

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
      showToast('Dikembalikan ke nilai default SNI', 'info');
    } else {
      setCustom(editingId, {
        materialOverrides: Object.keys(matChanged).length > 0 ? matChanged : undefined,
        laborOverrides: Object.keys(labChanged).length > 0 ? labChanged : undefined,
        notes: editValues.notes || undefined,
      });
      showToast(`AHSP "${template.name}" berhasil disesuaikan`, 'success');
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">

      {/* Popup Sumpah Integritas */}
      {showIntegrityPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
          <div className="relative glass-card w-full max-w-md p-6 space-y-4 border border-primary/30">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="text-white font-bold text-lg">Pernyataan Integritas</h3>
              <p className="text-text-secondary text-sm">Sebelum mengubah koefisien AHSP, harap baca dan setujui pernyataan berikut:</p>
            </div>

            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 space-y-3 text-sm text-text-secondary leading-relaxed">
              <p>✅ Perubahan yang saya lakukan <strong className="text-white">mencerminkan kondisi nyata</strong> di daerah saya — bukan untuk memperbesar keuntungan secara tidak wajar.</p>
              <p>✅ Saya memahami bahwa <strong className="text-white">batas perubahan maksimal ±30%</strong> dari standar SNI untuk menjaga kewajaran.</p>
              <p>✅ Saya bertanggung jawab penuh atas perubahan yang saya buat dan dampaknya terhadap hasil RAB.</p>
              <p>✅ Perubahan ini <strong className="text-white">akan tercatat dan terlihat</strong> di hasil RAB sebagai transparansi kepada pemilik proyek.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer bg-primary/5 border border-primary/20 rounded-xl p-3">
              <input
                type="checkbox"
                checked={integrityChecked}
                onChange={e => setIntegrityChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-white text-sm font-bold">
                Saya menyatakan bahwa perubahan ini jujur dan sesuai kondisi nyata di lapangan.
              </span>
            </label>

            <div className="flex gap-3">
              <button onClick={() => setShowIntegrityPopup(false)}
                className="flex-1 py-2.5 border border-border rounded-xl text-text-secondary hover:text-white transition-all text-sm font-bold">
                Batal
              </button>
              <button
                onClick={confirmIntegrity}
                disabled={!integrityChecked}
                className="flex-1 btn-primary py-2.5 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lanjut Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            AHSP Custom Daerah Saya
          </h3>
          <p className="text-text-secondary text-sm mt-1">
            Sesuaikan koefisien material & upah dengan kondisi di daerah Anda.
            Perubahan hanya berlaku untuk akun Anda.
          </p>
        </div>
        {totalCustomized > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {totalCustomized} item dikustomisasi
            </span>
            <button onClick={() => { resetAll(); showToast('Semua AHSP dikembalikan ke default SNI', 'info'); }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
              <RotateCcw size={12} /> Reset Semua
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed space-y-1">
          <p><strong className="text-white">Cara pakai:</strong> Cari item pekerjaan → klik Edit → ubah koefisien sesuai kondisi daerah Anda.</p>
          <p className="text-yellow-400 font-bold">⚠️ Batas perubahan: maksimal ±30% dari standar SNI. Lebih dari itu tidak akan disimpan.</p>
          <p className="text-green-400">✓ Setiap perubahan akan tercatat dan terlihat di hasil RAB sebagai bentuk transparansi.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input type="text" placeholder="Cari item pekerjaan..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:border-primary outline-none" />
        <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)}
          className="bg-background border border-border rounded-xl px-3 py-2.5 text-white text-sm focus:border-primary outline-none">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* List AHSP */}
      <div className="space-y-2">
        {filtered.map(template => {
          const isCustomized = hasCustom(template.id);
          const custom = getCustom(template.id);
          const isEditing = editingId === template.id;
          const outOfBounds = isEditing && hasOutOfBounds(template);

          return (
            <div key={template.id} className={`border rounded-xl transition-all ${isCustomized ? 'border-primary/40 bg-primary/5' : 'border-border bg-background/50'}`}>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isCustomized && <CheckCircle2 size={14} className="text-primary shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{template.name}</p>
                    <p className="text-text-secondary text-xs">{template.category} • {template.unit}</p>
                    {custom?.notes && <p className="text-primary/70 text-xs mt-0.5 italic">"{custom.notes}"</p>}
                    {/* Log perubahan — transparan ke user */}
                    {isCustomized && custom && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {custom.materialOverrides && Object.entries(custom.materialOverrides).map(([k, v]) => {
                          const orig = template.materials.find(m => m.name === k)?.coeff ?? v;
                          const dev = getDeviation(v, orig);
                          return (
                            <span key={k} className="text-[10px] bg-card border border-border px-1.5 py-0.5 rounded text-text-secondary">
                              {k}: {orig}→<strong className={dev > 0 ? 'text-yellow-400' : 'text-green-400'}>{v}</strong>
                            </span>
                          );
                        })}
                        {custom.laborOverrides && Object.entries(custom.laborOverrides).map(([k, v]) => {
                          const orig = template.laborCoefficients.find(l => l.name === k)?.coeff ?? v;
                          const dev = getDeviation(v, orig);
                          return (
                            <span key={k} className="text-[10px] bg-card border border-border px-1.5 py-0.5 rounded text-text-secondary">
                              {k}: {orig}→<strong className={dev > 0 ? 'text-yellow-400' : 'text-green-400'}>{v}</strong>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isCustomized && (
                    <button onClick={() => { removeCustom(template.id); showToast('Dikembalikan ke default SNI', 'info'); }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors p-1">
                      <RotateCcw size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => isEditing ? setEditingId(null) : openIntegrityPopup(template.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isEditing ? 'bg-border text-text-secondary' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                    {isEditing ? <><X size={12} /> Batal</> : <><Edit2 size={12} /> Edit</>}
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div className="border-t border-border p-4 space-y-4">
                  {outOfBounds && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex gap-2">
                      <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-400 text-xs font-bold">
                        Beberapa nilai melebihi batas ±30% dari SNI. Angka yang merah harus disesuaikan sebelum bisa disimpan.
                      </p>
                    </div>
                  )}

                  {/* Material */}
                  {template.materials.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Koefisien Material</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {template.materials.map(m => {
                          const val = editValues.materialOverrides[m.name] ?? m.coeff;
                          const oob = isOutOfBounds(val, m.coeff);
                          return (
                            <div key={m.name} className={`flex items-center gap-2 rounded-lg p-2 ${oob ? 'bg-red-500/10 border border-red-500/30' : 'bg-background'}`}>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-white text-xs font-bold truncate">{m.name}</p>
                                  <DeviationBadge custom={val} original={m.coeff} />
                                </div>
                                <p className="text-text-secondary text-[10px]">SNI: {m.coeff} {m.unit} | Maks: {(m.coeff * (1 + MAX_DEVIATION)).toFixed(3)}–{(m.coeff * (1 - MAX_DEVIATION)).toFixed(3)}</p>
                              </div>
                              <input type="number" step="0.001" min="0"
                                value={val}
                                onChange={e => setEditValues(prev => ({ ...prev, materialOverrides: { ...prev.materialOverrides, [m.name]: parseFloat(e.target.value) || 0 } }))}
                                className={`w-20 border rounded-lg px-2 py-1 text-white text-xs text-right outline-none focus:border-primary bg-card ${oob ? 'border-red-500' : val !== m.coeff ? 'border-primary' : 'border-border'}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Labor */}
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">Koefisien Upah (OH = Orang Hari)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {template.laborCoefficients.map(l => {
                        const val = editValues.laborOverrides[l.name] ?? l.coeff;
                        const oob = isOutOfBounds(val, l.coeff);
                        return (
                          <div key={l.name} className={`flex items-center gap-2 rounded-lg p-2 ${oob ? 'bg-red-500/10 border border-red-500/30' : 'bg-background'}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-white text-xs font-bold truncate">{l.name}</p>
                                <DeviationBadge custom={val} original={l.coeff} />
                              </div>
                              <p className="text-text-secondary text-[10px]">SNI: {l.coeff} OH | Maks: {(l.coeff * (1 + MAX_DEVIATION)).toFixed(3)}–{(l.coeff * (1 - MAX_DEVIATION)).toFixed(3)}</p>
                            </div>
                            <input type="number" step="0.001" min="0"
                              value={val}
                              onChange={e => setEditValues(prev => ({ ...prev, laborOverrides: { ...prev.laborOverrides, [l.name]: parseFloat(e.target.value) || 0 } }))}
                              className={`w-20 border rounded-lg px-2 py-1 text-white text-xs text-right outline-none focus:border-primary bg-card ${oob ? 'border-red-500' : val !== l.coeff ? 'border-primary' : 'border-border'}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">Alasan Perubahan (wajib diisi)</p>
                  <p className="text-[10px] text-yellow-400/70 mb-1">Tulis kenapa angkanya kamu ubah. Contoh: harga pasir di daerah saya lebih mahal dari biasanya.</p>
                    <input type="text" placeholder="Contoh: Upah tukang di daerah saya lebih tinggi dari rata-rata"
                      value={editValues.notes}
                      onChange={e => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white text-xs focus:border-primary outline-none" />
                  </div>

                  <button onClick={saveEdit}
                    disabled={outOfBounds || !editValues.notes.trim()}
                    className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                    <Save size={14} />
                    {outOfBounds ? 'Perbaiki nilai yang melebihi batas dulu' : !editValues.notes.trim() ? 'Isi alasan perubahan dulu' : 'Simpan Perubahan'}
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
