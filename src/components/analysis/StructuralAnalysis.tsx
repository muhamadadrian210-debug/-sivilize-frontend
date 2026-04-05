import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Wind, Weight, Users, Building, HelpCircle, Calculator, Info } from 'lucide-react';

const StructuralAnalysis = () => {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
  const [params, setParams] = useState({
    buildingFunction: 'rumah',
    totalArea: 100,
    roofType: 'genteng',
    wallType: 'bata-merah',
    windSpeed: 25,
    seismicZone: '1'
  });

  const calculation = useMemo(() => {
    // Dead Load (Beban Mati) - kg/m2
    const wallLoad = params.wallType === 'bata-merah' ? 250 : 120;
    const roofLoadMap: Record<string, number> = {
      '1-air': 35,
      '2-air': 45,
      '3-air': 50,
      '4-air': 55,
      dak: 60,
      genteng: 50,
      spandek: 20,
    };
    const roofLoad = roofLoadMap[params.roofType] || 45;
    const concreteLoad = 2400 * 0.12; // 12cm slab estimate
    const deadLoad = wallLoad + roofLoad + concreteLoad;

    // Live Load (Beban Hidup) - kg/m2
    const liveLoad = 200;

    // Wind Load (Beban Angin) - kg/m2
    const windLoad = (params.windSpeed * params.windSpeed) / 16;

    // Seismic Load (Beban Gempa) - Rough Coefficient
    const seismicCoeff = parseInt(params.seismicZone) * 0.05;
    const seismicLoad = (deadLoad + liveLoad) * seismicCoeff;

    return {
      dead: deadLoad,
      live: liveLoad,
      wind: windLoad,
      seismic: seismicLoad,
      total: deadLoad + liveLoad + windLoad + seismicLoad
    };
  }, [params]);

  const loadData = [
    { name: 'Beban Mati', value: Math.round(calculation.dead), color: '#8884d8' },
    { name: 'Beban Hidup', value: Math.round(calculation.live), color: '#82ca9d' },
    { name: 'Beban Angin', value: Math.round(calculation.wind), color: '#ffc658' },
    { name: 'Beban Gempa', value: Math.round(calculation.seismic), color: '#ff8042' },
  ];

  const loadTypes = [
    {
      name: 'Beban Mati (Dead Load)',
      description: `Berat sendiri struktur (beton, dinding ${params.wallType}, atap ${params.roofType}).`,
      icon: Weight,
      value: `${Math.round(calculation.dead)} kg/m²`,
      tooltip: `Beban Mati adalah berat permanen dari semua elemen struktur bangunan.\n\nKomponen:\n• Berat dinding (${params.wallType === 'bata-merah' ? 'Bata Merah: 250 kg/m²' : 'Bata Ringan: 120 kg/m²'})\n• Berat atap ${params.roofType}\n• Berat plat beton: 288 kg/m²\n\nReferensi: SNI 1727:2020 Pasal 3.1`
    },
    {
      name: 'Beban Hidup (Live Load)',
      description: `Beban dinamis penghuni dan furnitur untuk fungsi ${params.buildingFunction}.`,
      icon: Users,
      value: `${Math.round(calculation.live)} kg/m²`,
      tooltip: `Beban Hidup adalah beban yang dapat berubah posisi dan besarnya.\n\nKomponen:\n• Berat penghuni dan aktivitas\n• Berat furnitur dan peralatan\n• Nilai standar rumah tinggal: 200 kg/m²\n\nReferensi: SNI 1727:2020 Tabel 4.3-1`
    },
    {
      name: 'Beban Angin (Wind Load)',
      description: `Tekanan angin berdasarkan kecepatan ${params.windSpeed} m/s.`,
      icon: Wind,
      value: `${Math.round(calculation.wind)} kg/m²`,
      tooltip: `Beban Angin dihitung berdasarkan kecepatan angin dasar di lokasi.\n\nRumus: q = V² / 16\nDimana V = kecepatan angin (${params.windSpeed} m/s)\n\nHasil: ${params.windSpeed}² / 16 = ${Math.round(calculation.wind)} kg/m²\n\nReferensi: SNI 1727:2020 Pasal 26`
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white italic tracking-tight">Analisis Beban Struktur (Rumah Tinggal)</h2>
          <p className="text-text-secondary mt-1 italic text-sm">Kalkulasi beban teknis berdasarkan standar SNI 1727:2020</p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
          <Calculator className="text-primary" size={24} />
          <div>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">Total Beban Desain</p>
            <p className="text-xl font-black text-white">{Math.round(calculation.total)} kg/m²</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-6 border-primary/20">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border pb-4">
              <Building size={18} className="text-primary" />
              Parameter Bangunan
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Fungsi Bangunan</label>
                <input
                  value="Rumah Tinggal"
                  disabled
                  className="w-full h-11 bg-background/60 border border-border rounded-xl px-4 text-white outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Jenis Dinding</label>
                <select 
                  value={params.wallType}
                  onChange={(e) => setParams({...params, wallType: e.target.value})}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-white focus:border-primary outline-none appearance-none transition-all"
                >
                  <option value="bata-merah">Bata Merah (250 kg/m²)</option>
                  <option value="hebel">Bata Ringan/Hebel (120 kg/m²)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Jenis Penutup Atap</label>
                <select 
                  value={params.roofType}
                  onChange={(e) => setParams({...params, roofType: e.target.value})}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-white focus:border-primary outline-none appearance-none transition-all"
                >
                  <option value="1-air">Atap 1 Air</option>
                  <option value="2-air">Atap 2 Air</option>
                  <option value="3-air">Atap 3 Air</option>
                  <option value="4-air">Atap 4 Air</option>
                  <option value="dak">Atap Dak Beton</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Kecepatan Angin (m/s)</label>
                <input 
                  type="number" 
                  value={params.windSpeed}
                  onChange={(e) => setParams({...params, windSpeed: parseInt(e.target.value) || 0})}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-white focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Zona Gempa (SNI)</label>
                <select 
                  value={params.seismicZone}
                  onChange={(e) => setParams({...params, seismicZone: e.target.value})}
                  className="w-full h-11 bg-background border border-border rounded-xl px-4 text-white focus:border-primary outline-none appearance-none transition-all"
                >
                  <option value="1">Zona 1 (Sangat Rendah)</option>
                  <option value="2">Zona 2</option>
                  <option value="3">Zona 3 (Sedang)</option>
                  <option value="4">Zona 4</option>
                  <option value="5">Zona 5</option>
                  <option value="6">Zona 6 (Sangat Tinggi)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-8 italic">Distribusi Beban (kg/m²)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loadData} margin={{ left: 40, right: 40 }}>
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: '#1E293B', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#121826', border: '1px solid #1E293B', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                    {loadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loadTypes.map((load, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-6 flex flex-col group hover:border-primary/40 transition-all border-border/50 relative"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                    <load.icon size={20} />
                  </div>
                  <button
                    onClick={() => setActiveTooltip(activeTooltip === index ? null : index)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <HelpCircle size={14} className="text-text-secondary hover:text-primary transition-colors" />
                  </button>
                </div>

                {/* Tooltip Popup */}
                {activeTooltip === index && (
                  <div className="absolute top-14 right-4 z-50 w-72 bg-[#121826] border border-primary/30 rounded-xl p-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary text-xs font-bold uppercase tracking-widest">Penjelasan</span>
                      <button onClick={() => setActiveTooltip(null)} className="text-text-secondary hover:text-white text-xs">✕</button>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed whitespace-pre-line">{load.tooltip}</p>
                  </div>
                )}

                <h4 className="font-bold text-white text-sm mb-2">{load.name}</h4>
                <p className="text-text-secondary text-[10px] leading-relaxed flex-1 mb-4 italic">{load.description}</p>
                <div className="mt-auto pt-4 border-t border-border/50">
                  <p className="text-xl font-black text-white tracking-tight">{load.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
        <Info className="text-primary shrink-0 mt-1" size={20} />
        <div>
          <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-widest">Catatan Teknis</h4>
          <p className="text-text-secondary text-xs leading-relaxed italic">
            Analisis di atas merupakan estimasi beban awal untuk tahap perencanaan. Untuk konstruksi riil, perhitungan harus divalidasi oleh Structural Engineer menggunakan software analisa struktur profesional (SAP2000/ETABS) dan mempertimbangkan data tanah (Sondir/SPT) di lokasi proyek.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StructuralAnalysis;
