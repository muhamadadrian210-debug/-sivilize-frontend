import { useState } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Copy,
  Info,
  Layers,
  HardHat,
  ShieldCheck,
  Upload,
  MapPin
} from 'lucide-react';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import { formatCurrency } from '../../utils/calculations';
import {
  CITIES,
  PROVINCES,
  DEFAULT_CITY_ID,
  DEFAULT_PROVINCE_ID,
  DEFAULT_MATERIAL_GRADE,
  MATERIAL_GRADE_OPTIONS,
  getCitiesByProvince,
  getMaterialTransparency,
  type MaterialGrade,
} from '../../data/prices';
import { calculateAHSPItem } from '../../utils/calculations';
import { importRegionalPriceCsv, importRegionalPriceFromApi } from '../../services/regionalPriceDataset';
import HSPKManager from './HSPKManager';

const AHSPDatabase = () => {
  const [mainTab, setMainTab] = useState<'ahsp' | 'hspk'>('ahsp');
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(DEFAULT_PROVINCE_ID);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY_ID);
  const [selectedGrade, setSelectedGrade] = useState<MaterialGrade>(DEFAULT_MATERIAL_GRADE);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [apiUrl, setApiUrl] = useState('');
  const [importMessage, setImportMessage] = useState('');

  const categories = ['Semua', 'Struktur', 'Arsitektur', 'Finishing', 'MEP'];

  const filteredItems = AHSP_TEMPLATES.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const cityOptions = getCitiesByProvince(selectedProvince);

  return (
    <div className="space-y-8">
      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-xl w-fit">
        <button onClick={() => setMainTab('ahsp')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mainTab === 'ahsp' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}>
          <Layers size={16} /> Database AHSP
        </button>
        <button onClick={() => setMainTab('hspk')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mainTab === 'hspk' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}>
          <MapPin size={16} /> HSPK Regional
        </button>
      </div>

      {/* HSPK Manager */}
      {mainTab === 'hspk' && <HSPKManager />}

      {/* AHSP Content */}
      {mainTab === 'ahsp' && <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">AHSP Database</h2>
          <p className="text-text-secondary mt-1">Analisa Harga Satuan Pekerjaan (SNI 2024)</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-card border border-border p-1 rounded-xl flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  activeCategory === cat ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Filters & Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Cari Item</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama pekerjaan..."
                  className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Provinsi</label>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  const provinceId = e.target.value;
                  const firstCity = getCitiesByProvince(provinceId)[0];
                  setSelectedProvince(provinceId);
                  setSelectedCity(firstCity?.id || '');
                }}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {PROVINCES.map((province) => (
                  <option key={province.id} value={province.id}>{province.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Kota/Kabupaten</label>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {cityOptions.map(city => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Grade Material</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value as MaterialGrade)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none appearance-none"
              >
                {MATERIAL_GRADE_OPTIONS.map((grade) => (
                  <option key={grade.id} value={grade.id}>{grade.label}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Info size={18} className="text-primary flex-shrink-0" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Harga satuan dihitung berdasarkan AHSP, lokasi {CITIES.find(c => c.id === selectedCity)?.name} dan grade {selectedGrade}.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <label className="text-xs text-text-secondary uppercase font-bold tracking-widest">Integrasi Dataset Harga Resmi</label>
              <label className="w-full flex items-center justify-center gap-2 bg-background border border-border rounded-lg px-4 py-2 text-white text-sm cursor-pointer hover:border-primary transition-colors">
                <Upload size={14} />
                Import CSV Resmi Daerah
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const result = await importRegionalPriceCsv(file);
                      setImportMessage(`CSV berhasil diimport (${result.rows} baris, ${result.updatedCities} kota diperbarui).`);
                    } catch (error) {
                      setImportMessage(`Gagal import CSV: ${(error as Error).message}`);
                    }
                  }}
                />
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="URL API JSON dataset harga resmi"
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white text-sm focus:border-primary outline-none"
              />
              <button
                onClick={async () => {
                  try {
                    const result = await importRegionalPriceFromApi(apiUrl);
                    setImportMessage(`Sinkron API berhasil (${result.updatedCities} kota diperbarui).`);
                  } catch (error) {
                    setImportMessage(`Gagal sinkron API: ${(error as Error).message}`);
                  }
                }}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm font-semibold text-text-secondary hover:text-white hover:border-primary transition-colors"
              >
                Sinkron Harga dari API
              </button>
              {importMessage && <p className="text-[10px] text-text-secondary">{importMessage}</p>}
              <p className="text-[10px] text-text-secondary">
                Template CSV: <a href="/regional-prices-template.csv" className="text-primary hover:underline">download contoh</a>
              </p>
            </div>
          </div>
        </div>

        {/* Right: AHSP List */}
        <div className="lg:col-span-3 space-y-4">
          {filteredItems.map((item) => {
            const totalPrice = calculateAHSPItem(item, selectedCity, selectedGrade);
            return (
              <div key={item.id} className="glass-card group hover:border-primary/50 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'Struktur' ? 'bg-blue-500/10 text-blue-500' :
                          item.category === 'Arsitektur' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-success/10 text-success'
                        }`}>
                          {item.category}
                        </span>
                        <h4 className="text-lg font-bold text-white">{item.name}</h4>
                      </div>
                      <p className="text-text-secondary text-sm mt-1">Satuan: <span className="text-white font-medium">{item.unit}</span> {item.productivity && <>• Produktivitas: <span className="text-white font-medium">{item.productivity} {item.unit}/OH</span></>}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Harga Satuan</p>
                      <p className="text-2xl font-black text-primary mt-1">{formatCurrency(totalPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-background rounded-xl border border-border border-dashed">
                    {/* Materials */}
                    <div>
                      <h5 className="text-xs text-white font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Layers size={14} className="text-primary" />
                        Komposisi Material
                      </h5>
                      <div className="space-y-2">
                        {item.materials.length > 0 ? item.materials.map((mat, i) => {
                          const transparency = getMaterialTransparency(mat.name, selectedCity, selectedGrade);
                          return (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">{mat.name} • {transparency.brand}</span>
                            <span className="text-white font-medium">{mat.coeff} {mat.unit}</span>
                          </div>
                          );
                        }) : <p className="text-text-secondary text-xs italic">Tanpa material</p>}
                      </div>
                    </div>

                    {/* Labor */}
                    <div>
                      <h5 className="text-xs text-white font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                        <HardHat size={14} className="text-primary" />
                        Komposisi Tenaga
                      </h5>
                      <div className="space-y-2">
                        {item.laborCoefficients.map((lab, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">{lab.name}</span>
                            <span className="text-white font-medium">{lab.coeff} {lab.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-success flex items-center gap-2 text-xs font-semibold">
                        <ShieldCheck size={14} />
                        Referensi AHSP/SNI + Grade {selectedGrade}
                      </div>
                      <button className="text-text-secondary hover:text-white flex items-center gap-2 text-sm transition-colors">
                        <Edit2 size={14} />
                        Edit Analisa
                      </button>
                      <button className="text-text-secondary hover:text-white flex items-center gap-2 text-sm transition-colors">
                        <Copy size={14} />
                        Duplikat
                      </button>
                    </div>
                    <button className="text-red-500 hover:text-red-400 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>}
    </div>
  );
};

export default AHSPDatabase;
