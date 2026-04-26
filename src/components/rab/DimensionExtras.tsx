/* eslint-disable react-refresh/only-export-components */
/**
 * DimensionExtras — Fitur tambahan di step 2:
 * - Validasi dimensi
 * - Input sisi dinding
 * - Konfigurasi tulangan
 * - Kemiringan atap & ukuran bukaan
 * Semua dalam 1 komponen terpisah biar RABCalculator ga jebol lagi
 */
import { AlertTriangle, Layers, Info, AlertCircle } from 'lucide-react';
import { type Project } from '../../store/useStore';

// ── Types ──────────────────────────────────────────────────
export interface RebarConfig {
  kolomDiameter: number;
  kolomSengkang: number;
  balokDiameter: number;
  balokSengkang: number;
  platDiameter: number;
  platJarak: number;
}

export const DEFAULT_REBAR_CONFIG: RebarConfig = {
  kolomDiameter: 13,
  kolomSengkang: 150,
  balokDiameter: 13,
  balokSengkang: 200,
  platDiameter: 10,
  platJarak: 150,
};

interface DimensionExtrasProps {
  projectData: Partial<Project>;
  setProjectData: (d: Partial<Project>) => void;
  totalArea: number;
  totalVolume: number;
  rebarConfig: RebarConfig;
  setRebarConfig: (r: RebarConfig) => void;
}

// ── Validasi dimensi ───────────────────────────────────────
export function getDimensionErrors(projectData: Partial<Project>): string[] {
  const errors: string[] = [];
  const dims = projectData.dimensions ?? [];
  dims.forEach((d, i) => {
    if (d.length <= 0) errors.push(`Lantai ${i + 1}: Panjang harus > 0`);
    if (d.width  <= 0) errors.push(`Lantai ${i + 1}: Lebar harus > 0`);
    if (d.height <= 0) errors.push(`Lantai ${i + 1}: Tinggi harus > 0`);
    if (d.length > 200) errors.push(`Lantai ${i + 1}: Panjang tidak wajar (> 200m)`);
    if (d.width  > 200) errors.push(`Lantai ${i + 1}: Lebar tidak wajar (> 200m)`);
    if (d.height > 10)  errors.push(`Lantai ${i + 1}: Tinggi tidak wajar (> 10m)`);
  });
  if ((projectData.floors ?? 1) > 10) errors.push('Jumlah lantai tidak wajar (> 10)');
  return errors;
}

// ── Hitung preview luas dinding ────────────────────────────
export function getWallPreview(projectData: Partial<Project>) {
  const dW = projectData.doorWidth   ?? 0.9;
  const dH = projectData.doorHeight  ?? 2.1;
  const wW = projectData.windowWidth ?? 1.2;
  const wH = projectData.windowHeight ?? 1.0;
  const dC = projectData.doorCount   ?? 4;
  const wC = projectData.windowCount ?? 6;
  const opening = (dC * dW * dH) + (wC * wW * wH);
  const wallH = projectData.dimensions?.[0]?.height ?? 3;
  const wl = projectData.wallLengths;
  const perim = (wl && wl.length > 0)
    ? wl.reduce((s, w) => s + w.panjang, 0)
    : ((projectData.dimensions?.[0]?.length ?? 0) + (projectData.dimensions?.[0]?.width ?? 0)) * 2;
  const gross = perim * wallH * (projectData.floors ?? 1);
  const net = Math.max(0, gross - opening);
  return { gross, opening, net };
}

// ── Hitung berat besi per meter ────────────────────────────
export function getRebarPreview(cfg: RebarConfig) {
  return {
    bk: cfg.kolomDiameter ** 2 / 162,
    bb: cfg.balokDiameter  ** 2 / 162,
    bp: cfg.platDiameter   ** 2 / 162,
  };
}

// ── Komponen utama ─────────────────────────────────────────
const DimensionExtras = ({ projectData, setProjectData, totalArea, totalVolume, rebarConfig, setRebarConfig }: DimensionExtrasProps) => {
  const errors = getDimensionErrors(projectData);
  const wallPreview = getWallPreview(projectData);
  const rebarPreview = getRebarPreview(rebarConfig);

  return (
    <div className="space-y-6">
      {/* Validasi error */}
      {errors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-400" />
            <p className="text-red-400 font-bold text-sm">Periksa Input Dimensi</p>
          </div>
          {errors.map((err, i) => (
            <p key={i} className="text-red-300 text-xs pl-6">• {err}</p>
          ))}
        </div>
      )}

      {/* Hasil kalkulasi */}
      <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm">Hasil Kalkulasi Dimensi</p>
          <div className="flex items-center gap-8 mt-2">
            <div>
              <span className="text-white font-bold text-2xl">{totalArea.toFixed(2)}</span>
              <span className="text-text-secondary ml-1">m² Luas Total</span>
            </div>
            <div>
              <span className="text-white font-bold text-2xl">{totalVolume.toFixed(2)}</span>
              <span className="text-text-secondary ml-1">m³ Volume Total</span>
            </div>
          </div>
        </div>
        <Info className="text-primary opacity-50" size={32} />
      </div>

      {/* Input sisi dinding */}
      <div className="border-t border-border pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={14} className="text-primary" />
              Panjang Sisi Dinding
              <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">+Akurasi</span>
            </h4>
            <p className="text-text-secondary text-xs mt-0.5">Opsional. Kosongkan = pakai estimasi dari dimensi lantai.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const cur = projectData.wallLengths ?? [];
              setProjectData({ ...projectData, wallLengths: [...cur, { sisi: 'Sisi ' + (cur.length + 1), panjang: 0 }] });
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
          >
            + Tambah Sisi
          </button>
        </div>

        {(projectData.wallLengths ?? []).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(projectData.wallLengths ?? []).map((w, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={w.sisi}
                    onChange={(e) => {
                      const wl = [...(projectData.wallLengths ?? [])];
                      wl[i] = { ...wl[i], sisi: e.target.value };
                      setProjectData({ ...projectData, wallLengths: wl });
                    }}
                    className="text-xs text-text-secondary bg-transparent border-none outline-none w-full"
                    placeholder="Nama sisi"
                  />
                  <button type="button" onClick={() => {
                    const wl = (projectData.wallLengths ?? []).filter((_, idx) => idx !== i);
                    setProjectData({ ...projectData, wallLengths: wl });
                  }} className="text-red-400 hover:text-red-300 text-xs ml-1">✕</button>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="0" step="0.1"
                    value={w.panjang}
                    onChange={(e) => {
                      const wl = [...(projectData.wallLengths ?? [])];
                      wl[i] = { ...wl[i], panjang: parseFloat(e.target.value) || 0 };
                      setProjectData({ ...projectData, wallLengths: wl });
                    }}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
                  />
                  <span className="text-text-secondary text-xs shrink-0">m</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {(projectData.wallLengths ?? []).length > 0 && (
          <div className="flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <Info size={12} />
            Keliling input: <span className="font-bold ml-1">{(projectData.wallLengths ?? []).reduce((s, w) => s + w.panjang, 0).toFixed(1)} m</span>
            <span className="text-text-secondary ml-2">vs estimasi: {((projectData.dimensions?.[0]?.length ?? 0) + (projectData.dimensions?.[0]?.width ?? 0)) * 2} m</span>
          </div>
        )}
      </div>

      {/* Ukuran bukaan & kemiringan atap */}
      <div className="border-t border-border pt-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Info size={14} className="text-primary" />
          Detail Bukaan & Atap
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">Pengurang Luas Dinding</span>
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Lebar Pintu (m)', key: 'doorWidth',    min: 0.6, max: 2,  step: 0.05, def: 0.9 },
            { label: 'Tinggi Pintu (m)', key: 'doorHeight',  min: 1.8, max: 3,  step: 0.05, def: 2.1 },
            { label: 'Lebar Jendela (m)', key: 'windowWidth', min: 0.4, max: 3, step: 0.05, def: 1.2 },
            { label: 'Tinggi Jendela (m)', key: 'windowHeight', min: 0.4, max: 2, step: 0.05, def: 1.0 },
          ].map(({ label, key, min, max, step, def }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-text-secondary font-bold">{label}</label>
              <input
                type="number" min={min} max={max} step={step}
                value={(projectData as Record<string, number>)[key] ?? def}
                onChange={(e) => setProjectData({ ...projectData, [key]: parseFloat(e.target.value) || def })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
              />
            </div>
          ))}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-text-secondary font-bold">Kemiringan Atap (derajat)</label>
            <div className="flex items-center gap-3">
              <input
                type="range" min="0" max="45" step="5"
                value={projectData.roofPitch ?? 30}
                onChange={(e) => setProjectData({ ...projectData, roofPitch: parseInt(e.target.value) })}
                className="flex-1 accent-primary"
              />
              <span className="text-white font-bold text-sm w-12 text-center">{projectData.roofPitch ?? 30}°</span>
            </div>
            <p className="text-text-secondary text-[10px]">30° = genteng, 15° = spandek, 0° = dak beton</p>
          </div>
        </div>

        {/* Preview luas dinding */}
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-xs space-y-1">
          <p className="text-green-400 font-bold">Preview Luas Dinding</p>
          <div className="flex gap-6 text-text-secondary">
            <span>Kotor: <span className="text-white font-bold">{wallPreview.gross.toFixed(1)} m²</span></span>
            <span>Bukaan: <span className="text-red-400 font-bold">-{wallPreview.opening.toFixed(1)} m²</span></span>
            <span>Bersih: <span className="text-green-400 font-bold">{wallPreview.net.toFixed(1)} m²</span></span>
          </div>
        </div>
      </div>

      {/* Konfigurasi tulangan */}
      <div className="border-t border-border pt-5 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertCircle size={14} className="text-primary" />
          Konfigurasi Tulangan Besi
          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Akurasi Besi</span>
        </h4>
        <p className="text-text-secondary text-xs">Sesuaikan dengan gambar struktur. Default = SNI rumah tinggal 1–2 lantai.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Kolom', color: 'blue',   dKey: 'kolomDiameter', sKey: 'kolomSengkang', diameters: [10,12,13,16,19,22], spacings: [100,125,150,200] },
            { label: 'Balok', color: 'orange', dKey: 'balokDiameter', sKey: 'balokSengkang', diameters: [10,12,13,16,19,22], spacings: [100,125,150,200] },
            { label: 'Plat',  color: 'green',  dKey: 'platDiameter',  sKey: 'platJarak',     diameters: [8,10,12,13],         spacings: [100,125,150,200] },
          ].map(({ label, color, dKey, sKey, diameters, spacings }) => (
            <div key={label} className="space-y-2 bg-background/50 border border-border rounded-xl p-3">
              <p className={`text-xs font-bold text-${color}-400 uppercase tracking-widest`}>{label}</p>
              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary">Diameter (mm)</label>
                <select
                  value={(rebarConfig as Record<string, number>)[dKey]}
                  onChange={(e) => setRebarConfig({ ...rebarConfig, [dKey]: +e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                >
                  {diameters.map(d => <option key={d} value={d}>D{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-text-secondary">Jarak (mm)</label>
                <select
                  value={(rebarConfig as Record<string, number>)[sKey]}
                  onChange={(e) => setRebarConfig({ ...rebarConfig, [sKey]: +e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                >
                  {spacings.map(s => <option key={s} value={s}>{s} mm</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs text-text-secondary bg-background/50 border border-border rounded-xl p-3">
          <span>Kolom: <span className="text-blue-400 font-bold">{rebarPreview.bk.toFixed(2)} kg/m</span></span>
          <span>Balok: <span className="text-orange-400 font-bold">{rebarPreview.bb.toFixed(2)} kg/m</span></span>
          <span>Plat: <span className="text-green-400 font-bold">{rebarPreview.bp.toFixed(2)} kg/m²</span></span>
        </div>
      </div>
    </div>
  );
};

export default DimensionExtras;
