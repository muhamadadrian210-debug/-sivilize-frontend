import { Fragment, useState, useMemo, useEffect } from 'react';
import { 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Calculator as CalcIcon,
  Building2,
  MapPin,
  Layers,
  CheckCircle2,
  Info,
  AlertTriangle,
  FileText,
  FileDown,
  Sparkles,
  Upload,
  AlertCircle,
  Users,
  Clock,
  Lightbulb,
  Printer,
  GitCompare,
  Share2,
  Copy
} from 'lucide-react';
import { useStore, type RABItem, type Project } from '../../store/useStore';
import { AHSP_TEMPLATES } from '../../data/ahsp';
import {
  PROVINCES,
  DEFAULT_CITY_ID,
  DEFAULT_PROVINCE_ID,
  DEFAULT_MATERIAL_GRADE,
  MATERIAL_GRADE_OPTIONS,
  getCitiesByProvince,
  LOCATION_TYPE_OPTIONS,
  getLocationMultiplier,
  getMaterialPricesByGrade,
  DEFAULT_LABOR_PRICES,
  type MaterialGrade,
  type LocationType,
} from '../../data/prices';
import { projectService } from '../../services/api';
import { 
  calculateVolumeFromDimensions, 
  calculateAHSPItem, 
  calculateTotalRAB, 
  formatCurrency, 
  getCostCategory 
} from '../../utils/calculations';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { validateRABItems } from '../../utils/ahspValidator';
import { useAutoSave } from '../../hooks/useAutoSave';
import MaterialSummary from './MaterialSummary';
import ProjectTimeline from './ProjectTimeline';
import GroupedRABDisplay from './GroupedRABDisplay';
import RABSplitView from './RABSplitView';
import MaterialPriceEditor from './MaterialPriceEditor';
import { motion, AnimatePresence } from 'framer-motion';
import StickyTotalBar from '../common/StickyTotalBar';
import RABPreviewModal from '../export/RABPreviewModal';
import RABVersionComparison from './RABVersionComparison';
import RABTemplateManager from './RABTemplateManager';
import { useToast } from '../common/Toast';

// Wrapper untuk RABTemplateManager agar bisa dipakai di RABCalculator
const RABTemplateManagerWrapper = ({
  rabItems,
  financials,
  onLoadTemplate,
}: {
  rabItems: import('../../store/useStore').RABItem[];
  financials: import('../../store/useStore').FinancialSettings;
  onLoadTemplate: (items: import('../../store/useStore').RABItem[], fin: import('../../store/useStore').FinancialSettings) => void;
}) => {
  const { showToast } = useToast();
  return (
    <RABTemplateManager
      currentItems={rabItems}
      currentFinancials={financials}
      onLoadTemplate={(items, fin) => {
        onLoadTemplate(items, fin);
        showToast('Template berhasil dimuat ke RAB Calculator', 'success');
      }}
    />
  );
};

// ── Data Jenis Tanah & Rekomendasi Pondasi ──────────────────
const SOIL_TYPES = [
  { id: 'keras',   label: 'Tanah Keras',   desc: 'Daya dukung tinggi (>2 kg/cm²), stabil' },
  { id: 'sedang',  label: 'Tanah Sedang',  desc: 'Daya dukung menengah (1–2 kg/cm²)' },
  { id: 'lunak',   label: 'Tanah Lunak',   desc: 'Daya dukung rendah (<1 kg/cm²), lempung' },
  { id: 'gambut',  label: 'Tanah Gambut',  desc: 'Organik, sangat lunak, mudah ambles' },
  { id: 'pasir',   label: 'Tanah Pasir',   desc: 'Lepas, perlu pemadatan, daya dukung bervariasi' },
  { id: 'berbatu', label: 'Tanah Berbatu', desc: 'Daya dukung sangat tinggi, ideal untuk pondasi' },
] as const;

const FOUNDATION_TYPES = [
  { id: 'batu-kali',     label: 'Pondasi Batu Kali',    desc: 'Untuk bangunan 1–2 lantai di tanah keras/sedang' },
  { id: 'footplate',     label: 'Pondasi Footplate',     desc: 'Beton bertulang, cocok untuk tanah sedang–keras' },
  { id: 'strauss-pile',  label: 'Pondasi Strauss Pile',  desc: 'Bor manual, untuk tanah lunak hingga 6m' },
  { id: 'tiang-pancang', label: 'Pondasi Tiang Pancang', desc: 'Untuk tanah sangat lunak/gambut, beban berat' },
  { id: 'raft',          label: 'Pondasi Rakit (Raft)',  desc: 'Plat beton lebar, untuk tanah lunak merata' },
  { id: 'sumuran',       label: 'Pondasi Sumuran',       desc: 'Untuk tanah keras di kedalaman tertentu' },
] as const;

// Matriks rekomendasi: soilType → [foundationId, alasan, level]
const FOUNDATION_RECOMMENDATIONS: Record<string, { id: string; reason: string; level: 'recommended' | 'possible' | 'avoid' }[]> = {
  keras: [
    { id: 'batu-kali',    reason: 'Paling ekonomis dan efisien untuk tanah keras, cocok 1–2 lantai', level: 'recommended' },
    { id: 'footplate',    reason: 'Alternatif baik jika beban kolom besar', level: 'possible' },
    { id: 'sumuran',      reason: 'Jika lapisan keras ada di kedalaman tertentu', level: 'possible' },
    { id: 'tiang-pancang',reason: 'Berlebihan untuk tanah keras, tidak efisien biaya', level: 'avoid' },
  ],
  sedang: [
    { id: 'footplate',    reason: 'Distribusi beban merata, cocok untuk tanah sedang', level: 'recommended' },
    { id: 'batu-kali',    reason: 'Bisa dipakai untuk 1 lantai dengan pengawasan ketat', level: 'possible' },
    { id: 'strauss-pile', reason: 'Jika ada lapisan lunak di bawah', level: 'possible' },
    { id: 'raft',         reason: 'Jika tanah sedang tidak merata', level: 'possible' },
  ],
  lunak: [
    { id: 'strauss-pile', reason: 'Paling praktis untuk tanah lunak hingga kedalaman 6m', level: 'recommended' },
    { id: 'tiang-pancang',reason: 'Untuk beban berat atau kedalaman >6m', level: 'recommended' },
    { id: 'raft',         reason: 'Jika tanah lunak merata dan beban ringan', level: 'possible' },
    { id: 'batu-kali',    reason: 'Tidak disarankan, risiko penurunan tidak merata', level: 'avoid' },
  ],
  gambut: [
    { id: 'tiang-pancang',reason: 'Wajib menembus lapisan gambut ke tanah keras di bawahnya', level: 'recommended' },
    { id: 'strauss-pile', reason: 'Jika gambut tidak terlalu dalam (<4m)', level: 'possible' },
    { id: 'batu-kali',    reason: 'Sangat berbahaya, tanah gambut tidak stabil', level: 'avoid' },
    { id: 'footplate',    reason: 'Tidak efektif tanpa perkuatan tanah terlebih dahulu', level: 'avoid' },
  ],
  pasir: [
    { id: 'footplate',    reason: 'Setelah pemadatan, footplate cocok untuk tanah pasir', level: 'recommended' },
    { id: 'batu-kali',    reason: 'Bisa dipakai jika pasir padat dan tidak berair', level: 'possible' },
    { id: 'strauss-pile', reason: 'Jika pasir lepas dan dalam', level: 'possible' },
    { id: 'raft',         reason: 'Untuk distribusi beban merata di pasir lepas', level: 'possible' },
  ],
  berbatu: [
    { id: 'batu-kali',    reason: 'Ideal, tanah berbatu sangat mendukung pondasi batu kali', level: 'recommended' },
    { id: 'footplate',    reason: 'Alternatif baik untuk beban kolom besar', level: 'possible' },
    { id: 'sumuran',      reason: 'Jika batu ada di kedalaman tertentu', level: 'possible' },
    { id: 'tiang-pancang',reason: 'Tidak perlu, tanah sudah sangat kuat', level: 'avoid' },
  ],
};

const LEVEL_STYLE = {
  recommended: 'bg-green-500/10 border-green-500/30 text-green-400',
  possible:    'bg-blue-500/10 border-blue-500/30 text-blue-400',
  avoid:       'bg-red-500/10 border-red-500/30 text-red-400',
};
const LEVEL_LABEL = {
  recommended: '✓ Direkomendasikan',
  possible:    '~ Bisa Dipakai',
  avoid:       '✗ Hindari',
};

const RABCalculator = () => {
  const { addProject, setActiveTab, addActivityLog, user } = useStore();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('');
  const [ahspWarnings, setAhspWarnings] = useState<{ id: string; warning: { level: string; message: string } | null }[]>([]);
  const [tempProjectId] = useState(() => `temp_${Date.now()}`);
  const [aiMode, setAiMode] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [activeSubTab, setActiveSubTab] = useState<'rab' | 'split' | 'materials' | 'prices' | 'timeline' | 'template'>('rab');
  const [selectedProvince, setSelectedProvince] = useState(DEFAULT_PROVINCE_ID);
  const [materialGrade, setMaterialGrade] = useState<MaterialGrade>(DEFAULT_MATERIAL_GRADE);
  const [locationType, setLocationType] = useState<LocationType>('kota');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  // Konfigurasi tulangan — user bisa pilih diameter & jarak
  const [rebarConfig, setRebarConfig] = useState({
    kolomDiameter: 13,   // mm, D13
    kolomSengkang: 150,  // mm jarak sengkang
    balokDiameter: 13,   // mm
    balokSengkang: 200,  // mm
    platDiameter: 10,    // mm
    platJarak: 150,      // mm
  });

  // Form State
  const [projectData, setProjectData] = useState<Partial<Project>>({
    name: '',
    location: DEFAULT_CITY_ID,
    materialGrade: DEFAULT_MATERIAL_GRADE,
    type: 'rumah',
    roofModel: '2-air',
    roofPitch: 30,
    floors: 1,
    dimensions: [{ length: 0, width: 0, height: 3 }],
    wallLengths: [],
    status: 'draft',
    bedroomCount: 3,
    bathroomCount: 2,
    doorCount: 4,
    windowCount: 6,
    doorWidth: 0.9,
    doorHeight: 2.1,
    windowWidth: 1.2,
    windowHeight: 1.0,
    waterPointCount: 4,
    drainPointCount: 3,
    drinkingPointCount: 2,
    lightPointCount: 10,
    socketPointCount: 8,
    toiletType: 'duduk' as 'duduk' | 'jongkok',
    soilType: undefined as Project['soilType'],
    foundationType: undefined as Project['foundationType'],
  });

  const [rabItems, setRabItems] = useState<RABItem[]>([]);
  const [selectedItemForTeam, setSelectedItemForTeam] = useState<string | null>(null);
  const [financials, setFinancials] = useState({
    overhead: 5,
    profit: 10,
    tax: 11,
    contingency: 0,
  });

  const cityOptions = useMemo(() => getCitiesByProvince(selectedProvince), [selectedProvince]);

  // Auto-save draft setiap 30 detik
  useAutoSave({
    projectId: tempProjectId,
    data: { rabItems, financialSettings: financials },
    intervalMs: 30000,
    enabled: rabItems.length > 0,
  });

  // Update auto-save status indicator
  useEffect(() => {
    if (rabItems.length === 0) return;
    const interval = setInterval(() => {
      setAutoSaveStatus(`Tersimpan otomatis ${new Date().toLocaleTimeString('id-ID')}`);
    }, 30000);
    return () => clearInterval(interval);
  }, [rabItems.length]);

  // Validasi AHSP setiap kali rabItems berubah
  useEffect(() => {
    if (rabItems.length === 0) return;
    const warnings = validateRABItems(rabItems);
    setAhspWarnings(warnings);
  }, [rabItems]);

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const versionId = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
      const timestamp = Date.now();
      const localProject = {
        ...projectData,
        id: versionId,
        materialGrade,
        createdAt: timestamp,
        updatedAt: timestamp,
        versions: [{
          id: versionId,
          versionNum: 1,
          timestamp,
          rabItems,
          financialSettings: financials,
          summary: summary
        }]
      } as Project;

      try {
        const response = await projectService.createProject(localProject);
        if (response.success) {
          addProject(response.data);
          addActivityLog({
            userId: user?.id || 'unknown',
            userName: user?.name || 'Unknown',
            action: 'create',
            entity: 'project',
            entityId: response.data.id,
            entityName: projectData.name || 'Proyek Baru',
            newValue: { grandTotal: summary.grandTotal, items: rabItems.length },
            description: `RAB dibuat: ${projectData.name} — ${rabItems.length} item, total ${formatCurrency(summary.grandTotal)}`,
          });
          showToast('Proyek berhasil disimpan', 'success');
          setActiveTab('dashboard');
          return;
        }
      } catch {
        // Backend tidak tersedia — simpan lokal saja
        console.warn('Backend tidak tersedia, menyimpan lokal');
      }

      // Fallback: simpan ke local store
      addProject(localProject);
      addActivityLog({
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown',
        action: 'create',
        entity: 'project',
        entityId: versionId,
        entityName: projectData.name || 'Proyek Baru',
        newValue: { grandTotal: summary.grandTotal, items: rabItems.length },
        description: `RAB dibuat (lokal): ${projectData.name} — ${rabItems.length} item, total ${formatCurrency(summary.grandTotal)}`,
      });
      showToast('Proyek disimpan secara lokal (backend tidak tersedia)', 'warning');
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Failed to save project', error);
      showToast('Gagal menyimpan proyek', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculations
  const { totalArea, totalVolume } = useMemo(() => 
    calculateVolumeFromDimensions(projectData.type!, projectData.floors!, projectData.dimensions!),
    [projectData]
  );

  const summary = useMemo(() => 
    calculateTotalRAB(rabItems, financials),
    [rabItems, financials]
  );

  const costPerM2 = totalArea > 0 ? summary.grandTotal / totalArea : 0;
  const category = getCostCategory(costPerM2);

  // ── AUTO-RECALCULATE harga saat customPrices berubah ──────────
  // Tidak perlu regenerate ulang — cukup update unitPrice & total per item
  useEffect(() => {
    if (rabItems.length === 0 || Object.keys(customPrices).length === 0) return;

    const matOverride = { ...getMaterialPricesByGrade(projectData.location!, materialGrade), ...customPrices };
    const laborOverride = Object.fromEntries(
      Object.entries(DEFAULT_LABOR_PRICES).map(([k, v]) => [k, customPrices[`__labor__${k}`] ?? v])
    );
    const locationMult = getLocationMultiplier(locationType);

    const recalculated = rabItems.map(item => {
      const template = AHSP_TEMPLATES.find(t => t.name === item.name);
      if (!template) return item;
      const basePrice = calculateAHSPItem(template, projectData.location!, materialGrade, {
        materials: matOverride,
        labor: laborOverride,
      });
      const unitPrice = Math.round(basePrice * locationMult);
      return { ...item, unitPrice, total: item.volume * unitPrice };
    });

    setRabItems(recalculated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customPrices]);

  // ── VALIDASI INPUT DIMENSI ────────────────────────────────────
  const dimensionErrors = useMemo(() => {
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
  }, [projectData.dimensions, projectData.floors]);
    setLoading(true);
    setTimeout(() => {
      const generated: RABItem[] = [];
      const floors = projectData.floors ?? 1;
      const dims = projectData.dimensions ?? [{ length: 10, width: 8, height: 3 }];

      // ── PERIMETER: pakai input sisi dinding jika ada, fallback ke dimensi ──
      const wallLengths = projectData.wallLengths;
      const perimeter = (wallLengths && wallLengths.length > 0)
        ? wallLengths.reduce((s, w) => s + w.panjang, 0)
        : (dims[0].length + dims[0].width) * 2;

      // ── TINGGI DINDING per lantai ──
      const wallHeight = dims[0].height ?? 3;

      // ── LUAS DINDING KOTOR (sebelum dikurangi bukaan) ──
      const grossWallArea = perimeter * wallHeight * floors;

      // ── PENGURANGAN BUKAAN (pintu & jendela) ──
      const doorCount  = projectData.doorCount  ?? 4;
      const windowCount = projectData.windowCount ?? 6;
      const doorW   = projectData.doorWidth   ?? 0.9;
      const doorH   = projectData.doorHeight  ?? 2.1;
      const winW    = projectData.windowWidth  ?? 1.2;
      const winH    = projectData.windowHeight ?? 1.0;
      const openingArea = (doorCount * doorW * doorH) + (windowCount * winW * winH);

      // ── LUAS DINDING BERSIH (untuk pasangan bata & plesteran) ──
      const wallArea = Math.max(0, grossWallArea - openingArea);

      // Plesteran = 2 sisi (dalam + luar), acian = sama dengan plesteran
      const plasterArea = wallArea * 2;
      const paintArea   = plasterArea;

      // ── LUAS ATAP dengan kemiringan nyata ──
      // Faktor kemiringan: luas atap miring = luas lantai / cos(sudut)
      const pitchDeg = projectData.roofPitch ?? 30; // default 30°
      const pitchRad = (pitchDeg * Math.PI) / 180;
      const slopeFactor = 1 / Math.cos(pitchRad); // misal 30° → 1.155
      const roofModelOverhangMap: Record<NonNullable<Project['roofModel']>, number> = {
        '1-air': 1.05, '2-air': 1.10, '3-air': 1.15, '4-air': 1.20, dak: 1.00,
      };
      const overhangFactor = roofModelOverhangMap[projectData.roofModel || '2-air'];
      const roofArea = totalArea * slopeFactor * overhangFactor;

      const templates = AHSP_TEMPLATES;
      const locationMult = getLocationMultiplier(locationType);
      const addItem = (templateId: string, volume: number, team: Record<string, number>) => {
        const template = templates.find((t) => t.id === templateId);
        if (!template) return;
        // Harga satuan × location multiplier, dengan custom prices jika ada
        const matOverride = Object.keys(customPrices).length > 0
          ? { ...getMaterialPricesByGrade(projectData.location!, materialGrade), ...customPrices }
          : undefined;
        const laborOverride = Object.keys(customPrices).some(k => k.startsWith('__labor__'))
          ? Object.fromEntries(
              Object.entries(DEFAULT_LABOR_PRICES).map(([k, v]) => [k, customPrices[`__labor__${k}`] ?? v])
            )
          : undefined;
        const basePrice = calculateAHSPItem(
          template,
          projectData.location!,
          materialGrade,
          matOverride || laborOverride ? { materials: matOverride ?? {}, labor: laborOverride ?? {} } : undefined
        );
        const unitPrice = Math.round(basePrice * locationMult);
        generated.push({
          id: `${generated.length + 1}`,
          category: template.category,
          name: template.name,
          unit: template.unit,
          volume,
          unitPrice,
          total: volume * unitPrice,
          assignedTeam: team,
        });
      };
      
      // ── PEKERJAAN PERSIAPAN ──────────────────────────────────
      addItem('per-001', totalArea, { 'Pekerja': 3, 'Mandor': 1 });           // Pembersihan lokasi
      addItem('per-002', perimeter * 1.2, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 }); // Bowplank
      addItem('per-003', 12, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 }); // Gudang bahan 12m²
      addItem('per-004', 9, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 });  // Direksi keet 9m²
      addItem('per-005', 1, { 'Pekerja': 2, 'Tukang Kayu': 1, 'Mandor': 1 });  // Pengukuran & patok
      addItem('per-006', 1, { 'Pekerja': 4, 'Mandor': 1 });                    // Mobilisasi
      addItem('per-007', 1, { 'Pekerja': 1, 'Tukang Kayu': 1, 'Mandor': 1 }); // Papan nama proyek
      addItem('per-008', 1, { 'Pekerja': 1, 'Tukang Pipa': 1, 'Mandor': 1 }); // Air kerja
      addItem('per-009', 1, { 'Pekerja': 1, 'Tukang Listrik': 1, 'Mandor': 1 }); // Listrik kerja
      // K3
      const totalWorkers = 8; // estimasi jumlah pekerja
      addItem('k3-001', totalWorkers, {});                                       // APD per orang
      addItem('k3-002', perimeter, { 'Pekerja': 2, 'Tukang Kayu': 1, 'Mandor': 1 }); // Pagar pengaman
      addItem('k3-003', 1, {});                                                  // P3K & APAR

      // ── PONDASI — berdasarkan pilihan jenis tanah & pondasi ──
      const foundationDepth = (() => {
        switch (projectData.soilType) {
          case 'keras':    return 0.6;
          case 'sedang':   return 0.8;
          case 'lunak':    return 1.0;
          case 'gambut':   return 1.2;
          case 'pasir':    return 0.8;
          case 'berbatu':  return 0.5;
          default:         return 0.7;
        }
      })();

      // Galian tanah pondasi — selalu ada
      const excavationVol = perimeter * 0.6 * foundationDepth;
      addItem('str-001', excavationVol, { 'Pekerja': 3, 'Mandor': 1 });

      // Urugan pasir bawah pondasi
      addItem('str-005', perimeter * 0.6, { 'Pekerja': 2, 'Mandor': 1 });

      // Item pondasi sesuai pilihan
      switch (projectData.foundationType) {
        case 'batu-kali': {
          // Pondasi batu kali: volume = keliling × lebar (0.6m) × tinggi (0.7m)
          const batukaliVol = perimeter * 0.6 * 0.7;
          addItem('str-000', batukaliVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });
          // Sloof beton di atas pondasi batu kali
          const sloofVol = perimeter * 0.15 * 0.2;
          addItem('str-002', sloofVol, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });
          addItem('str-003', sloofVol * 120, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
          addItem('str-004', perimeter * 2, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 });
          break;
        }
        case 'footplate': {
          // Footplate: jumlah titik kolom ≈ luas/16 (grid 4x4m)
          const nFootplate = Math.ceil(totalArea / 16);
          const footplateVol = nFootplate * 0.8 * 0.8 * 0.3; // 80x80x30cm per titik
          addItem('str-002', footplateVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });
          addItem('str-003', footplateVol * 150, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
          addItem('str-004', nFootplate * 4, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 });
          // Sloof
          const sloofVol = perimeter * 0.15 * 0.25;
          addItem('str-002', sloofVol, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });
          break;
        }
        case 'strauss-pile': {
          // Strauss pile: jumlah titik ≈ luas/9 (grid 3x3m), kedalaman 4–6m
          const nPile = Math.ceil(totalArea / 9);
          const pileDepth = projectData.soilType === 'lunak' ? 5 : 4;
          const pileVol = nPile * Math.PI * 0.15 * 0.15 * pileDepth; // diameter 30cm
          addItem('str-002', pileVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });
          addItem('str-003', pileVol * 180, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
          // Pile cap + sloof
          const capVol = nPile * 0.6 * 0.6 * 0.3;
          addItem('str-002', capVol, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });
          break;
        }
        case 'raft': {
          // Raft foundation: plat beton seluruh luas bangunan, tebal 25cm
          const raftVol = totalArea * 0.25;
          addItem('str-002', raftVol, { 'Pekerja': 6, 'Tukang Batu': 3, 'Kepala Tukang': 1, 'Mandor': 1 });
          addItem('str-003', raftVol * 100, { 'Pekerja': 3, 'Tukang Besi': 3, 'Mandor': 1 });
          addItem('str-004', totalArea * 1.2, { 'Pekerja': 3, 'Tukang Kayu': 3, 'Mandor': 1 });
          break;
        }
        case 'tiang-pancang': {
          // Tiang pancang: estimasi jumlah tiang
          const nTiang = Math.ceil(totalArea / 12);
          const tiangVol = nTiang * Math.PI * 0.15 * 0.15 * 8; // kedalaman 8m
          addItem('str-002', tiangVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });
          addItem('str-003', tiangVol * 200, { 'Pekerja': 2, 'Tukang Besi': 3, 'Mandor': 1 });
          const capVol = nTiang * 0.8 * 0.8 * 0.4;
          addItem('str-002', capVol, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });
          break;
        }
        case 'sumuran': {
          const nSumuran = Math.ceil(totalArea / 20);
          const sumuranVol = nSumuran * Math.PI * 0.6 * 0.6 * 2; // diameter 1.2m, dalam 2m
          addItem('str-002', sumuranVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });
          addItem('str-003', sumuranVol * 80, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
          break;
        }
        default: {
          // Default: batu kali jika tidak dipilih
          const defaultVol = perimeter * 0.6 * 0.7;
          addItem('str-000', defaultVol, { 'Pekerja': 4, 'Tukang Batu': 2, 'Mandor': 1 });
        }
      }

      // ── URUGAN TANAH KEMBALI (sering terlupakan) ──────────────
      // Volume urugan = volume galian - volume pondasi
      const foundationDepthVal = (() => {
        switch (projectData.soilType) {
          case 'keras': return 0.6; case 'sedang': return 0.8;
          case 'lunak': return 1.0; case 'gambut': return 1.2;
          case 'pasir': return 0.8; case 'berbatu': return 0.5;
          default: return 0.7;
        }
      })();
      const galianVol = perimeter * 0.6 * foundationDepthVal;
      const pondasiVol = perimeter * 0.6 * 0.5; // estimasi volume pondasi
      const uruganKembali = Math.max(0, galianVol - pondasiVol);
      if (uruganKembali > 0) {
        // Gunakan item galian tanah sebagai proxy untuk urugan kembali
        // (tidak ada template khusus, pakai pekerja manual)
        generated.push({
          id: `${generated.length + 1}`,
          category: 'Tanah & Pondasi',
          name: 'Urugan Tanah Kembali & Pemadatan',
          unit: 'm3',
          volume: uruganKembali,
          unitPrice: Math.round(165000 * 0.5 * getLocationMultiplier(locationType)), // ~0.5 OH pekerja/m³
          total: uruganKembali * Math.round(165000 * 0.5 * getLocationMultiplier(locationType)),
          assignedTeam: { 'Pekerja': 3, 'Mandor': 1 },
        });
      }

      // ── STRUKTUR ATAS — Kolom, Balok, Ring Balk, Plat Lantai ──
      // Dimensi standar SNI rumah tinggal:
      // Kolom: 15x15cm (1 lantai) atau 20x20cm (2 lantai)
      // Balok induk: 15x25cm, balok anak: 12x20cm
      // Ring balk: 12x15cm
      const floors = projectData.floors ?? 1;
      const kolomDim = floors >= 2 ? 0.20 : 0.15; // sisi kolom (m)
      const kolomH = (projectData.dimensions?.[0]?.height ?? 3); // tinggi per lantai

      // Estimasi jumlah kolom: grid 3x3m → 1 kolom per 9m²
      const nKolom = Math.ceil(totalArea / 9);

      // Volume kolom per lantai = n × dim² × tinggi
      const volKolomPerLantai = nKolom * kolomDim * kolomDim * kolomH;
      const volKolomTotal = volKolomPerLantai * floors;

      // Balok induk: keliling + tengah (estimasi panjang = perimeter + √area × 2)
      const panjangBalokInduk = perimeter + Math.sqrt(totalArea) * 2;
      const volBalokInduk = panjangBalokInduk * 0.15 * 0.25 * floors;

      // Balok anak: grid 3m → panjang ≈ √area × (√area/3)
      const panjangBalokAnak = Math.sqrt(totalArea) * Math.ceil(Math.sqrt(totalArea) / 3);
      const volBalokAnak = panjangBalokAnak * 0.12 * 0.20 * floors;

      // Ring balk: keliling per lantai
      const volRingBalk = perimeter * 0.12 * 0.15 * floors;

      // Plat lantai (hanya jika 2+ lantai): tebal 12cm
      const volPlatLantai = floors >= 2 ? totalArea * (floors - 1) * 0.12 : 0;

      // Total beton struktur atas
      const concreteVolStruktur = volKolomTotal + volBalokInduk + volBalokAnak + volRingBalk + volPlatLantai;

      // Besi tulangan: kolom 200kg/m³, balok 150kg/m³, plat 100kg/m³
      const steelKolom = volKolomTotal * 200;
      const steelBalok = (volBalokInduk + volBalokAnak + volRingBalk) * 150;
      const steelPlat = volPlatLantai * 100;
      const steelWeight = steelKolom + steelBalok + steelPlat;

      // Bekisting: kolom (4 sisi), balok (3 sisi), plat (bawah)
      const bekistingKolom = nKolom * 4 * kolomDim * kolomH * floors;
      const bekistingBalok = (panjangBalokInduk + panjangBalokAnak) * 0.7 * floors; // 3 sisi rata-rata
      const bekistingPlat = volPlatLantai > 0 ? totalArea * (floors - 1) : 0;
      const totalBekisting = bekistingKolom + bekistingBalok + bekistingPlat;

      addItem('str-002', concreteVolStruktur, { 'Pekerja': 4, 'Tukang Batu': 2, 'Kepala Tukang': 1, 'Mandor': 1 });

      // ── TULANGAN DETAIL per elemen (lebih akurat dari estimasi kg/m³) ──
      // Berat besi per meter = (diameter²/162) kg/m (rumus standar)
      const beratPerMeterKolom = (rebarConfig.kolomDiameter ** 2 / 162);
      const beratPerMeterBalok = (rebarConfig.balokDiameter ** 2 / 162);
      const beratPerMeterPlat  = (rebarConfig.platDiameter ** 2 / 162);

      // Kolom: 4 tulangan utama + sengkang
      const nTulanganKolom = 4;
      const panjangSengkangPerM = (1000 / rebarConfig.kolomSengkang) * (kolomDim * 4 + 0.1); // keliling + overlap
      const beratKolomPerM = (nTulanganKolom * beratPerMeterKolom) + (panjangSengkangPerM * (rebarConfig.kolomDiameter * 0.6 / 162));
      const totalPanjangKolom = nKolom * kolomH * floors;
      // Gunakan str-003 (pembesian kg) dengan berat yang dihitung
      addItem('str-003', totalPanjangKolom * beratKolomPerM * 1.05, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });

      // Balok: 3 tulangan atas + 3 bawah + sengkang
      const nTulanganBalok = 6;
      const panjangSengkangBalokPerM = (1000 / rebarConfig.balokSengkang) * (0.15 * 2 + 0.25 * 2 + 0.1);
      const beratBalokPerM = (nTulanganBalok * beratPerMeterBalok) + (panjangSengkangBalokPerM * (rebarConfig.balokDiameter * 0.6 / 162));
      const totalPanjangBalok = (panjangBalokInduk + panjangBalokAnak) * floors;
      addItem('str-003', totalPanjangBalok * beratBalokPerM * 1.05, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });

      // Plat lantai: tulangan 2 arah
      if (volPlatLantai > 0) {
        const platArea = totalArea * (floors - 1);
        const nBatangPerM2 = (1000 / rebarConfig.platJarak) * 2; // 2 arah
        const beratPlatPerM2 = nBatangPerM2 * beratPerMeterPlat;
        addItem('str-003', platArea * beratPlatPerM2 * 1.05, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
      }

      // Bekisting
      addItem('str-004', totalBekisting, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 });

      // ── RANGKA ATAP ──────────────────────────────────────────
      // Baja ringan: luas atap × faktor kemiringan
      // Genteng/penutup: luas atap
      addItem('ars-003', roofArea, { 'Pekerja': 2, 'Tukang Besi': 2, 'Mandor': 1 });
      addItem(projectData.roofModel === 'dak' ? 'str-002' : 'ars-004', roofArea, { 'Pekerja': 2, 'Tukang Batu': 2, 'Mandor': 1 });
      if (projectData.roofModel !== 'dak') {
        // Nok/bubungan: estimasi panjang = √area
        addItem('ars-005', roofArea * 0.6, { 'Pekerja': 2, 'Tukang Besi': 1, 'Mandor': 1 });
      }

      // ── ARSITEKTUR — Dinding, Plesteran ──────────────────────
      addItem('ars-001', wallArea, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });
      addItem('ars-002', plasterArea, { 'Pekerja': 3, 'Tukang Batu': 2, 'Mandor': 1 });

      // Finishing
      addItem('fin-001', paintArea, { 'Pekerja': 2, 'Tukang Cat': 2, 'Mandor': 1 });
      // Acian dinding (setelah plesteran)
      addItem('fin-002', plasterArea, { 'Pekerja': 2, 'Tukang Batu': 2, 'Mandor': 1 });
      // Plafon gypsum (luas lantai × 1.1 untuk overhang)
      const ceilingArea = totalArea * 1.1;
      addItem('fin-004', ceilingArea, { 'Pekerja': 2, 'Tukang Kayu': 2, 'Mandor': 1 });

      // Lantai — screed + keramik
      addItem('lan-004', totalArea, { 'Pekerja': 2, 'Tukang Batu': 1, 'Mandor': 1 });
      const mainFloorArea = totalArea * 0.75;
      addItem('lan-001', mainFloorArea, { 'Pekerja': 2, 'Tukang Batu': 2, 'Mandor': 1 });

      // Bukaan - Pintu & Jendela (deklarasi di sini, sudah ada di atas untuk openingArea)
      const bathroomCount = projectData.bathroomCount ?? 2;

      // Keramik dinding KM/WC
      const bathroomWallArea = bathroomCount * 12;
      if (bathroomCount > 0) {
        addItem('lan-005', bathroomWallArea, { 'Pekerja': 1, 'Tukang Batu': 2, 'Mandor': 1 });
      }

      // Pintu utama + kamar tidur (kurangi pintu kamar mandi)
      const mainDoors = Math.max(0, doorCount - bathroomCount);
      if (mainDoors > 0) {
        addItem('buk-001', mainDoors, { 'Pekerja': 1, 'Tukang Kayu': 2, 'Mandor': 1 });
      }
      if (bathroomCount > 0) {
        addItem('buk-003', bathroomCount, { 'Pekerja': 1, 'Tukang Kayu': 1, 'Mandor': 1 });
      }
      if (windowCount > 0) {
        addItem('buk-002', windowCount, { 'Pekerja': 1, 'Tukang Kayu': 2, 'Mandor': 1 });
      }

      // Mekanikal - Plumbing
      const waterPts = projectData.waterPointCount ?? 4;
      const drainPts = projectData.drainPointCount ?? 3;
      const drinkPts = projectData.drinkingPointCount ?? 2;
      if (waterPts > 0) addItem('mek-001', waterPts, { 'Pekerja': 1, 'Tukang Pipa': 2, 'Mandor': 1 });
      if (drainPts > 0) addItem('mek-002', drainPts, { 'Pekerja': 1, 'Tukang Pipa': 2, 'Mandor': 1 });
      if (drinkPts > 0) addItem('mek-003', drinkPts, { 'Pekerja': 1, 'Tukang Pipa': 1, 'Mandor': 1 });

      // Sanitasi - Kloset
      if (bathroomCount > 0) {
        const toiletId = projectData.toiletType === 'jongkok' ? 'san-002' : 'san-001';
        addItem(toiletId, bathroomCount, { 'Pekerja': 1, 'Tukang Pipa': 1, 'Mandor': 1 });
        // Wastafel per KM
        addItem('san-003', bathroomCount, { 'Pekerja': 1, 'Tukang Pipa': 1, 'Mandor': 1 });
        // Floor drain per KM
        addItem('san-005', bathroomCount, { 'Pekerja': 1, 'Tukang Pipa': 1, 'Mandor': 1 });
      }
      // Septic tank (1 unit per rumah)
      addItem('san-006', 1, { 'Pekerja': 4, 'Tukang Batu': 2, 'Mandor': 1 });

      // Elektrikal
      const lightPts = projectData.lightPointCount ?? 10;
      const socketPts = projectData.socketPointCount ?? 8;
      if (lightPts > 0) addItem('elk-001', lightPts, { 'Pekerja': 1, 'Tukang Listrik': 2, 'Mandor': 1 });
      if (socketPts > 0) addItem('elk-002', socketPts, { 'Pekerja': 1, 'Tukang Listrik': 2, 'Mandor': 1 });
      addItem('elk-003', 1, { 'Pekerja': 1, 'Tukang Listrik': 2, 'Mandor': 1 });

      // ── PEKERJAAN YANG SERING TERLUPAKAN ─────────────────────

      // Urugan pasir bawah lantai (sebelum screed)
      addItem('tan-002', totalArea, { 'Pekerja': 2, 'Mandor': 1 });

      // Urugan peninggian lantai (default 20cm = 2× item per 10cm)
      addItem('tan-004', totalArea, { 'Pekerja': 3, 'Mandor': 1 });
      addItem('tan-004', totalArea, { 'Pekerja': 3, 'Mandor': 1 });

      // Drainase keliling bangunan
      addItem('tan-003', perimeter, { 'Pekerja': 2, 'Tukang Batu': 1, 'Mandor': 1 });

      // Waterproofing KM/WC (lantai + dinding bawah 1.5m)
      if (bathroomCount > 0) {
        const kmFloorArea = bathroomCount * 4;   // estimasi 2×2m per KM
        const kmWallWpArea = bathroomCount * 6;  // 1.5m tinggi × 4 sisi
        addItem('fin-003', kmFloorArea + kmWallWpArea, { 'Pekerja': 1, 'Tukang Batu': 1, 'Mandor': 1 });
      }
      // Waterproofing atap dak (jika model dak)
      if (projectData.roofModel === 'dak') {
        addItem('fin-003', totalArea, { 'Pekerja': 2, 'Tukang Batu': 1, 'Mandor': 1 });
      }

      // Cat eksterior (dinding luar saja = ~50% dari total luas dinding)
      const exteriorWallArea = wallArea * 0.5;
      addItem('fin-007', exteriorWallArea, { 'Pekerja': 2, 'Tukang Cat': 2, 'Mandor': 1 });

      // Waterproofing dinding eksterior bawah (1m dari tanah, keliling bangunan)
      addItem('fin-008', perimeter * 1.0, { 'Pekerja': 1, 'Tukang Batu': 1, 'Mandor': 1 });

      setRabItems(generated);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // ── Computed values untuk step 2 preview (di luar JSX agar tidak bingungkan parser) ──
  const wallPreview = (() => {
    const dW = projectData.doorWidth ?? 0.9;
    const dH = projectData.doorHeight ?? 2.1;
    const wW = projectData.windowWidth ?? 1.2;
    const wH = projectData.windowHeight ?? 1.0;
    const dC = projectData.doorCount ?? 4;
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
  })();

  const rebarPreview = {
    bk: (rebarConfig.kolomDiameter ** 2 / 162),
    bb: (rebarConfig.balokDiameter ** 2 / 162),
    bp: (rebarConfig.platDiameter ** 2 / 162),
  };

  // Foundation cost breakdown untuk step 3
  const foundationCostBreakdown = (() => {
    if (!projectData.foundationType) return null;
    const foundationItems = rabItems.filter(item =>
      (item.category === 'Struktur' || item.category === 'Tanah & Pondasi') && (
        item.name.toLowerCase().includes('pondasi') ||
        item.name.toLowerCase().includes('galian') ||
        item.name.toLowerCase().includes('urugan') ||
        item.name.toLowerCase().includes('strauss') ||
        item.name.toLowerCase().includes('tiang') ||
        item.name.toLowerCase().includes('rakit') ||
        item.name.toLowerCase().includes('sumuran')
      )
    );
    const cost = foundationItems.reduce((s, i) => s + i.total, 0);
    const label = FOUNDATION_TYPES.find(f => f.id === projectData.foundationType)?.label;
    if (cost === 0) return null;
    return { cost, label };
  })();

  const handleShare = async () => {
    setShareLoading(true);
    try {
      showToast('Fitur share memerlukan proyek yang sudah disimpan', 'info');
    } finally {
      setShareLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white">Data Dasar Proyek</h3>
              <button 
                onClick={() => setAiMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all group"
              >
                <Sparkles size={16} className="group-hover:animate-pulse" />
                <span>AI Mode (Upload Denah)</span>
              </button>
            </div>
            
            {/* AI Vision Modal — Gemini Vision */}
            {aiMode && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !aiProgress && setAiMode(false)} />
                <div className="relative glass-card w-full max-w-lg p-8 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Sparkles className="text-primary" />
                    AI Vision — Analisis Denah
                  </h3>
                  <p className="text-text-secondary text-xs">Upload foto/scan denah, tampak depan, samping, atau gambar teknik. Gemini AI akan membaca dimensi otomatis.</p>

                  {/* Upload area */}
                  <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${aiProgress > 0 ? 'opacity-50 pointer-events-none' : 'hover:border-primary/50 border-border'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleDennahUpload}
                    />
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Upload size={28} />
                    </div>
                    <p className="text-text-secondary text-sm text-center">Klik untuk pilih gambar denah</p>
                    <p className="text-text-secondary text-xs text-center opacity-60">JPG, PNG, PDF screenshot — denah, tampak depan/samping</p>
                  </label>

                  {/* Progress */}
                  {aiProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-secondary">
                        <span>{aiProgress < 30 ? 'Memuat gambar...' : aiProgress < 90 ? 'Gemini AI menganalisis...' : 'Selesai!'}</span>
                        <span>{aiProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary shadow-glow transition-all duration-500" style={{ width: `${aiProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button onClick={() => { setAiMode(false); setAiProgress(0); }} className="w-full text-center text-xs text-text-secondary hover:text-white transition-colors">
                    Batal — isi manual
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Nama Proyek</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input 
                    type="text" 
                    value={projectData.name}
                    onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                    placeholder="Contoh: Rumah Tinggal Modern"
                    className="w-full h-12 bg-background border border-border rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Provinsi</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <select 
                    value={selectedProvince}
                    onChange={(e) => {
                      const provinceId = e.target.value;
                      const firstCity = getCitiesByProvince(provinceId)[0];
                      setSelectedProvince(provinceId);
                      setProjectData({ ...projectData, location: firstCity?.id || '' });
                    }}
                    className="w-full h-12 bg-background border border-border rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
                  >
                    {PROVINCES.map((province) => (
                      <option key={province.id} value={province.id}>{province.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Kota/Kabupaten</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <select
                    value={projectData.location}
                    onChange={(e) => setProjectData({ ...projectData, location: e.target.value })}
                    className="w-full h-12 bg-background border border-border rounded-xl pl-12 pr-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
                  >
                    {cityOptions.map((city) => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Tipe Bangunan</label>
                <input
                  value="Rumah Minimalis"
                  disabled
                  className="w-full h-12 bg-background/60 border border-border rounded-xl px-4 text-white outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Jumlah Lantai</label>
                <input 
                  type="number" 
                  min="1"
                  value={projectData.floors}
                  onChange={(e) => {
                    const floors = parseInt(e.target.value) || 1;
                    const dims = Array(floors).fill(0).map((_, i) => projectData.dimensions![i] || { length: 0, width: 0, height: 3 });
                    setProjectData({...projectData, floors, dimensions: dims});
                  }}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Grade Material</label>
                <select
                  value={materialGrade}
                  onChange={(e) => {
                    const grade = e.target.value as MaterialGrade;
                    setMaterialGrade(grade);
                    setProjectData({ ...projectData, materialGrade: grade });
                  }}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
                >
                  {MATERIAL_GRADE_OPTIONS.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-text-secondary">
                  Transparansi merek material tampil di tab Kebutuhan Material.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-text-secondary text-sm font-medium">Model Atap</label>
                <select
                  value={projectData.roofModel}
                  onChange={(e) => setProjectData({ ...projectData, roofModel: e.target.value as Project['roofModel'] })}
                  className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
                >
                  <option value="1-air">Atap 1 Air</option>
                  <option value="2-air">Atap 2 Air</option>
                  <option value="3-air">Atap 3 Air</option>
                  <option value="4-air">Atap 4 Air</option>
                  <option value="dak">Atap Dak Beton</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-text-secondary text-sm font-medium flex items-center gap-2">
                  Tipe Lokasi Proyek
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Ongkos Angkut</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {LOCATION_TYPE_OPTIONS.map(loc => (
                    <button key={loc.id} type="button"
                      onClick={() => { setLocationType(loc.id); setProjectData({ ...projectData, locationType: loc.id }); }}
                      className={`p-3 rounded-xl border text-left transition-all ${locationType === loc.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                    >
                      <p className={`font-bold text-sm ${locationType === loc.id ? 'text-primary' : 'text-white'}`}>{loc.label}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{loc.desc}</p>
                      <p className={`text-xs font-black mt-1 ${loc.multiplier > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {loc.multiplier === 1 ? 'Harga Normal' : `+${Math.round((loc.multiplier - 1) * 100)}% ongkir`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Jenis Tanah & Rekomendasi Pondasi */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lightbulb size={14} className="text-primary" />
                Jenis Tanah &amp; Rekomendasi Pondasi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pilih Jenis Tanah */}
                <div className="space-y-3">
                  <label className="text-text-secondary text-sm font-medium">Jenis Tanah di Lokasi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOIL_TYPES.map(soil => (
                      <button
                        key={soil.id}
                        type="button"
                        onClick={() => setProjectData({ ...projectData, soilType: soil.id, foundationType: undefined })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          projectData.soilType === soil.id
                            ? 'border-primary bg-primary/10 text-white'
                            : 'border-border bg-background text-text-secondary hover:border-primary/50'
                        }`}
                      >
                        <p className="font-bold text-sm">{soil.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-70">{soil.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rekomendasi & Pilih Pondasi */}
                <div className="space-y-3">
                  <label className="text-text-secondary text-sm font-medium">
                    {projectData.soilType ? 'Rekomendasi Pondasi' : 'Pilih jenis tanah untuk rekomendasi'}
                  </label>
                  {!projectData.soilType ? (
                    <div className="h-full flex items-center justify-center p-8 border border-dashed border-border rounded-xl">
                      <p className="text-text-secondary text-sm text-center">← Pilih jenis tanah terlebih dahulu</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {FOUNDATION_RECOMMENDATIONS[projectData.soilType]?.map(rec => {
                        const found = FOUNDATION_TYPES.find(f => f.id === rec.id);
                        if (!found) return null;
                        return (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => rec.level !== 'avoid' && setProjectData({ ...projectData, foundationType: rec.id as Project['foundationType'] })}
                            disabled={rec.level === 'avoid'}
                            className={`w-full p-3 rounded-xl border text-left transition-all ${
                              projectData.foundationType === rec.id
                                ? 'border-primary bg-primary/10'
                                : `${LEVEL_STYLE[rec.level]} ${rec.level === 'avoid' ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'}`
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-bold text-sm text-white">{found.label}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${LEVEL_STYLE[rec.level]}`}>
                                {LEVEL_LABEL[rec.level]}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary">{rec.reason}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary pilihan */}
              {projectData.soilType && projectData.foundationType && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-bold text-sm">Konfigurasi Pondasi Dipilih</p>
                    <p className="text-text-secondary text-xs mt-1">
                      <span className="text-white">{SOIL_TYPES.find(s => s.id === projectData.soilType)?.label}</span>
                      {' → '}
                      <span className="text-primary font-bold">{FOUNDATION_TYPES.find(f => f.id === projectData.foundationType)?.label}</span>
                    </p>
                    <p className="text-text-secondary text-xs mt-0.5">{FOUNDATION_TYPES.find(f => f.id === projectData.foundationType)?.desc}</p>
                    {FOUNDATION_RECOMMENDATIONS[projectData.soilType!]?.find(r => r.id === projectData.foundationType) && (
                      <p className="text-green-300 text-xs mt-1 italic">
                        "{FOUNDATION_RECOMMENDATIONS[projectData.soilType!]?.find(r => r.id === projectData.foundationType)?.reason}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Detail Ruangan & Bukaan */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Detail Ruangan &amp; Bukaan</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Kamar Tidur</label>
                  <input type="number" min="0" value={projectData.bedroomCount}
                    onChange={(e) => setProjectData({...projectData, bedroomCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Kamar Mandi</label>
                  <input type="number" min="0" value={projectData.bathroomCount}
                    onChange={(e) => setProjectData({...projectData, bathroomCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Jumlah Pintu</label>
                  <input type="number" min="0" value={projectData.doorCount}
                    onChange={(e) => setProjectData({...projectData, doorCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Jumlah Jendela</label>
                  <input type="number" min="0" value={projectData.windowCount}
                    onChange={(e) => setProjectData({...projectData, windowCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mekanikal & Elektrikal */}
            <div className="border-t border-border pt-6">
              <h4 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Mekanikal &amp; Elektrikal</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Titik Air Bersih</label>
                  <input type="number" min="0" value={projectData.waterPointCount}
                    onChange={(e) => setProjectData({...projectData, waterPointCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Titik Air Kotor</label>
                  <input type="number" min="0" value={projectData.drainPointCount}
                    onChange={(e) => setProjectData({...projectData, drainPointCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Titik Air Konsumsi</label>
                  <input type="number" min="0" value={projectData.drinkingPointCount}
                    onChange={(e) => setProjectData({...projectData, drinkingPointCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Titik Lampu</label>
                  <input type="number" min="0" value={projectData.lightPointCount}
                    onChange={(e) => setProjectData({...projectData, lightPointCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Titik Stop Kontak</label>
                  <input type="number" min="0" value={projectData.socketPointCount}
                    onChange={(e) => setProjectData({...projectData, socketPointCount: parseInt(e.target.value) || 0})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-text-secondary text-sm font-medium">Tipe Kloset</label>
                  <select value={projectData.toiletType}
                    onChange={(e) => setProjectData({...projectData, toiletType: e.target.value as 'duduk' | 'jongkok'})}
                    className="w-full h-12 bg-background border border-border rounded-xl px-4 text-white focus:outline-none focus:border-primary appearance-none transition-all"
                  >
                    <option value="duduk">Kloset Duduk</option>
                    <option value="jongkok">Kloset Jongkok</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-primary" />
              Dimensi Per Lantai
            </h3>

            {/* ── VALIDASI ERROR ── */}
            {dimensionErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <p className="text-red-400 font-bold text-sm">Periksa Input Dimensi</p>
                </div>
                {dimensionErrors.map((err, i) => (
                  <p key={i} className="text-red-300 text-xs pl-6">• {err}</p>
                ))}
              </div>
            )}
            <div className="space-y-4">
              {projectData.dimensions?.map((dim, index) => (
                <div key={index} className="bg-background/50 border border-border p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Panjang (m)</label>
                    <input 
                      type="number" 
                      value={dim.length}
                      onChange={(e) => {
                        const newDims = [...projectData.dimensions!];
                        newDims[index].length = parseFloat(e.target.value) || 0;
                        setProjectData({...projectData, dimensions: newDims});
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Lebar (m)</label>
                    <input 
                      type="number" 
                      value={dim.width}
                      onChange={(e) => {
                        const newDims = [...projectData.dimensions!];
                        newDims[index].width = parseFloat(e.target.value) || 0;
                        setProjectData({...projectData, dimensions: newDims});
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">Tinggi (m)</label>
                    <input 
                      type="number" 
                      value={dim.height}
                      onChange={(e) => {
                        const newDims = [...projectData.dimensions!];
                        newDims[index].height = parseFloat(e.target.value) || 0;
                        setProjectData({...projectData, dimensions: newDims});
                      }}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex items-center justify-between">
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

            {/* ── INPUT PANJANG SISI DINDING (opsional, lebih akurat) ── */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers size={14} className="text-primary" />
                    Panjang Sisi Dinding
                    <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">+Akurasi</span>
                  </h4>
                  <p className="text-text-secondary text-xs mt-0.5">Isi untuk hasil lebih akurat. Kosongkan = pakai estimasi dari dimensi lantai.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = projectData.wallLengths ?? [];
                    setProjectData({ ...projectData, wallLengths: [...current, { sisi: `Sisi ${current.length + 1}`, panjang: 0 }] });
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
                          type="number"
                          min="0"
                          step="0.1"
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
                  Total keliling: <span className="font-bold">{(projectData.wallLengths ?? []).reduce((s, w) => s + w.panjang, 0).toFixed(1)} m</span>
                  {' '}vs estimasi: <span className="font-bold">{((projectData.dimensions?.[0]?.length ?? 0) + (projectData.dimensions?.[0]?.width ?? 0)) * 2} m</span>
                </div>
              )}
            </div>

            {/* ── UKURAN BUKAAN & KEMIRINGAN ATAP ── */}
            <div className="border-t border-border pt-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Info size={14} className="text-primary" />
                Detail Bukaan & Atap
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-bold">Pengurang Luas Dinding</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-bold">Lebar Pintu (m)</label>
                  <input type="number" min="0.6" max="2" step="0.05"
                    value={projectData.doorWidth ?? 0.9}
                    onChange={(e) => setProjectData({ ...projectData, doorWidth: parseFloat(e.target.value) || 0.9 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-bold">Tinggi Pintu (m)</label>
                  <input type="number" min="1.8" max="3" step="0.05"
                    value={projectData.doorHeight ?? 2.1}
                    onChange={(e) => setProjectData({ ...projectData, doorHeight: parseFloat(e.target.value) || 2.1 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-bold">Lebar Jendela (m)</label>
                  <input type="number" min="0.4" max="3" step="0.05"
                    value={projectData.windowWidth ?? 1.2}
                    onChange={(e) => setProjectData({ ...projectData, windowWidth: parseFloat(e.target.value) || 1.2 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-text-secondary font-bold">Tinggi Jendela (m)</label>
                  <input type="number" min="0.4" max="2" step="0.05"
                    value={projectData.windowHeight ?? 1.0}
                    onChange={(e) => setProjectData({ ...projectData, windowHeight: parseFloat(e.target.value) || 1.0 })}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs text-text-secondary font-bold">Kemiringan Atap (derajat)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="15" max="45" step="5"
                      value={projectData.roofPitch ?? 30}
                      onChange={(e) => setProjectData({ ...projectData, roofPitch: parseInt(e.target.value) })}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-white font-bold text-sm w-12 text-center">{projectData.roofPitch ?? 30}°</span>
                  </div>
                  <p className="text-text-secondary text-[10px]">
                    Standar: 30° (genteng), 15° (spandek), 0° (dak). Makin curam = luas atap makin besar.
                  </p>
                </div>
              </div>

              {/* Preview pengurangan luas dinding */}
              <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-xs space-y-1">
                <p className="text-green-400 font-bold">Preview Luas Dinding</p>
                <div className="flex gap-6 text-text-secondary">
                  <span>Kotor: <span className="text-white font-bold">{wallPreview.gross.toFixed(1)} m²</span></span>
                  <span>Bukaan: <span className="text-red-400 font-bold">-{wallPreview.opening.toFixed(1)} m²</span></span>
                  <span>Bersih: <span className="text-green-400 font-bold">{wallPreview.net.toFixed(1)} m²</span></span>
                </div>
              </div>
            <div className="border-t border-border pt-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle size={14} className="text-primary" />
                Konfigurasi Tulangan Besi
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-bold">Akurasi Besi</span>
              </h4>
              <p className="text-text-secondary text-xs">Sesuaikan dengan gambar struktur. Default = SNI rumah tinggal 1–2 lantai.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Kolom */}
                <div className="space-y-2 bg-background/50 border border-border rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Kolom</p>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Diameter Utama (mm)</label>
                    <select value={rebarConfig.kolomDiameter}
                      onChange={e => setRebarConfig(r => ({ ...r, kolomDiameter: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[10,12,13,16,19,22].map(d => <option key={d} value={d}>D{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Jarak Sengkang (mm)</label>
                    <select value={rebarConfig.kolomSengkang}
                      onChange={e => setRebarConfig(r => ({ ...r, kolomSengkang: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[100,125,150,200].map(s => <option key={s} value={s}>{s} mm</option>)}
                    </select>
                  </div>
                </div>
                {/* Balok */}
                <div className="space-y-2 bg-background/50 border border-border rounded-xl p-3">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Balok</p>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Diameter Utama (mm)</label>
                    <select value={rebarConfig.balokDiameter}
                      onChange={e => setRebarConfig(r => ({ ...r, balokDiameter: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[10,12,13,16,19,22].map(d => <option key={d} value={d}>D{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Jarak Sengkang (mm)</label>
                    <select value={rebarConfig.balokSengkang}
                      onChange={e => setRebarConfig(r => ({ ...r, balokSengkang: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[100,125,150,200].map(s => <option key={s} value={s}>{s} mm</option>)}
                    </select>
                  </div>
                </div>
                {/* Plat Lantai */}
                <div className="space-y-2 bg-background/50 border border-border rounded-xl p-3">
                  <p className="text-xs font-bold text-green-400 uppercase tracking-widest">Plat Lantai</p>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Diameter (mm)</label>
                    <select value={rebarConfig.platDiameter}
                      onChange={e => setRebarConfig(r => ({ ...r, platDiameter: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[8,10,12,13].map(d => <option key={d} value={d}>D{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-text-secondary">Jarak Tulangan (mm)</label>
                    <select value={rebarConfig.platJarak}
                      onChange={e => setRebarConfig(r => ({ ...r, platJarak: +e.target.value }))}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-white text-xs focus:border-primary outline-none"
                    >
                      {[100,125,150,200].map(s => <option key={s} value={s}>{s} mm</option>)}
                    </select>
                  </div>
                </div>
              </div>
              {/* Preview berat besi */}
              <div className="flex gap-4 text-xs text-text-secondary bg-background/50 border border-border rounded-xl p-3">
                <span>Kolom: <span className="text-blue-400 font-bold">{rebarPreview.bk.toFixed(2)} kg/m</span></span>
                <span>Balok: <span className="text-orange-400 font-bold">{rebarPreview.bb.toFixed(2)} kg/m</span></span>
                <span>Plat: <span className="text-green-400 font-bold">{rebarPreview.bp.toFixed(2)} kg/m²</span></span>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8">
            {/* Auto-save indicator */}
            {autoSaveStatus && (
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock size={12} className="text-success" />
                <span>{autoSaveStatus}</span>
              </div>
            )}

            {/* AHSP Warnings */}
            {ahspWarnings.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-400" />
                  <p className="text-yellow-400 font-bold text-sm">Peringatan Validasi AHSP/PUPR 2022 ({ahspWarnings.length} item)</p>
                </div>
                {ahspWarnings.slice(0, 3).map(w => (
                  <p key={w.id} className="text-yellow-300 text-xs pl-6">• {w.warning?.message}</p>
                ))}
                {ahspWarnings.length > 3 && (
                  <p className="text-yellow-300 text-xs pl-6">...dan {ahspWarnings.length - 3} peringatan lainnya</p>
                )}
              </div>
            )}

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-background border border-border p-1 rounded-xl">
                <button 
                  onClick={() => setActiveSubTab('rab')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'rab' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Breakdown RAB
                </button>
                <button 
                  onClick={() => setActiveSubTab('split')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'split' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Material / Pekerja
                </button>
                <button 
                  onClick={() => setActiveSubTab('materials')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'materials' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Kebutuhan Material
                </button>
                <button
                  onClick={() => setActiveSubTab('prices')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'prices' ? 'bg-yellow-500 text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Update Harga
                </button>
                <button 
                  onClick={() => setActiveSubTab('timeline')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'timeline' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Timeline & Jadwal
                </button>
                <button 
                  onClick={() => setActiveSubTab('template')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'template' ? 'bg-primary text-white shadow-glow' : 'text-text-secondary hover:text-white'}`}
                >
                  Template
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowPreviewModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
                >
                  <Printer size={16} />
                  <span>Cetak / Export</span>
                </button>
                {/* Bandingkan Versi — tampil jika ada project yang sudah disimpan */}
                <button
                  onClick={() => setShowComparison(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-bold hover:bg-blue-500/20 transition-all"
                >
                  <GitCompare size={16} />
                  <span className="hidden sm:inline">Bandingkan</span>
                </button>
                <button
                  onClick={handleShare}
                  disabled={shareLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-bold hover:bg-green-500/20 transition-all"
                >
                  <Share2 size={16} />
                  <span className="hidden sm:inline">Bagikan</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeSubTab === 'rab' && (
                <motion.div 
                  key="rab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <GroupedRABDisplay 
                    items={rabItems}
                    onUpdateItem={(index, updates) => {
                      const newItems = [...rabItems];
                      newItems[index] = { ...newItems[index], ...updates };
                      setRabItems(newItems);
                    }}
                    onDeleteItem={(index) => {
                      const newItems = rabItems.filter((_, i) => i !== index);
                      setRabItems(newItems);
                    }}
                    onAddItem={() => {
                      const newItem: RABItem = {
                        id: `item-${Date.now()}`,
                        category: 'Lain-lain',
                        name: 'Item Baru',
                        volume: 0,
                        unit: 'm2',
                        unitPrice: 0,
                        total: 0,
                        assignedTeam: {}
                      };
                      setRabItems([...rabItems, newItem]);
                    }}
                    onSelectTeam={(itemId) => setSelectedItemForTeam(itemId)}
                  />

                  {/* Manual Labor Modal */}
                  {selectedItemForTeam && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={() => setSelectedItemForTeam(null)} />
                      <div className="relative glass-card w-full max-w-md p-8 space-y-6 border-primary/30 shadow-glow-primary/20">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white flex items-center gap-3 italic">
                            <Users className="text-primary" />
                            Alokasi Tim Kerja
                          </h3>
                          <button onClick={() => setSelectedItemForTeam(null)} className="text-text-secondary hover:text-white">
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <p className="text-text-secondary text-sm">
                          Tentukan jumlah tenaga kerja yang akan dibawa untuk pekerjaan: <br/>
                          <span className="text-white font-bold">{rabItems.find(i => i.id === selectedItemForTeam)?.name}</span>
                        </p>

                        <div className="space-y-4">
                          {['Pekerja', 'Tukang', 'Kepala Tukang', 'Mandor', 'Ahli Struktur'].map((role) => (
                            <div key={role} className="flex items-center justify-between bg-background/50 p-4 rounded-xl border border-border">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                  <Users size={16} />
                                </div>
                                <span className="text-white font-semibold text-sm">{role}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => {
                                    const newItems = [...rabItems];
                                    const idx = newItems.findIndex(i => i.id === selectedItemForTeam);
                                    const team = { ...(newItems[idx].assignedTeam || {}) };
                                    team[role] = Math.max(0, (team[role] || 0) - 1);
                                    newItems[idx].assignedTeam = team;
                                    setRabItems(newItems);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-border hover:bg-primary/20 text-white flex items-center justify-center transition-all"
                                >-</button>
                                <span className="text-white font-bold w-6 text-center">
                                  {rabItems.find(i => i.id === selectedItemForTeam)?.assignedTeam?.[role] || 0}
                                </span>
                                <button 
                                  onClick={() => {
                                    const newItems = [...rabItems];
                                    const idx = newItems.findIndex(i => i.id === selectedItemForTeam);
                                    const team = { ...(newItems[idx].assignedTeam || {}) };
                                    team[role] = (team[role] || 0) + 1;
                                    newItems[idx].assignedTeam = team;
                                    setRabItems(newItems);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-border hover:bg-primary/20 text-white flex items-center justify-center transition-all"
                                >+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
                            <Info size={18} className="text-primary flex-shrink-0" />
                            <p className="text-[10px] text-text-secondary leading-relaxed italic">
                              Perubahan jumlah tenaga kerja akan mempengaruhi estimasi durasi proyek dan distribusi biaya harian secara otomatis.
                            </p>
                          </div>
                          <button 
                            onClick={() => setSelectedItemForTeam(null)}
                            className="w-full btn-primary py-4 font-bold uppercase tracking-widest"
                          >
                            Simpan Alokasi Tim
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-6 space-y-4">
                      <h4 className="font-bold text-white flex items-center gap-2 border-b border-border pb-3">
                        <CalcIcon size={18} className="text-primary" />
                        Manajemen Keuangan
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-text-secondary font-medium">Overhead (%)</label>
                          <input 
                            type="number" 
                            value={financials.overhead}
                            onChange={(e) => setFinancials({...financials, overhead: parseFloat(e.target.value) || 0})}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-text-secondary font-medium">Profit (%)</label>
                          <input 
                            type="number" 
                            value={financials.profit}
                            onChange={(e) => setFinancials({...financials, profit: parseFloat(e.target.value) || 0})}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-text-secondary font-medium">PPN (%)</label>
                          <input 
                            type="number" 
                            value={financials.tax}
                            onChange={(e) => setFinancials({...financials, tax: parseFloat(e.target.value) || 0})}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-text-secondary font-medium">Contingency (%)</label>
                          <input 
                            type="number" 
                            value={financials.contingency}
                            onChange={(e) => setFinancials({...financials, contingency: parseFloat(e.target.value) || 0})}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-6 bg-primary/5 border-primary/20 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-white mb-4">Ringkasan Biaya Akhir</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Subtotal Pekerjaan</span>
                            <span className="text-white">{formatCurrency(summary.subtotal)}</span>
                          </div>
                          {/* Breakdown biaya pondasi */}
                          {foundationCostBreakdown && (
                            <div className="flex justify-between text-sm bg-primary/5 px-2 py-1.5 rounded-lg border border-primary/10">
                              <span className="text-primary text-xs">Biaya Pondasi ({foundationCostBreakdown.label})</span>
                              <span className="text-primary font-bold text-xs">{formatCurrency(foundationCostBreakdown.cost)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">Overhead & Profit</span>
                            <span className="text-white">{formatCurrency(summary.overheadAmount + summary.profitAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-text-secondary">PPN ({financials.tax}%)</span>
                            <span className="text-white">{formatCurrency(summary.taxAmount)}</span>
                          </div>
                          <div className="pt-3 border-t border-border flex justify-between">
                            <span className="text-white font-bold">TOTAL ANGGARAN</span>
                            <span className="text-primary font-black text-xl">{formatCurrency(summary.grandTotal)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-4 bg-background p-3 rounded-xl border border-border">
                    <div className={`p-2 rounded-lg ${category.color.replace('text', 'bg')}/10`}>
                      <AlertTriangle size={20} className={category.color} />
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Kategori Biaya</p>
                      <p className={`font-bold ${category.color}`}>{category.label} • {formatCurrency(costPerM2)}/m²</p>
                    </div>
                  </div>

                  {(costPerM2 > 12000000 || (costPerM2 < 2000000 && costPerM2 > 0)) && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                      <p className="text-[10px] text-red-500 font-bold leading-tight">
                        DATA TIDAK WAJAR: Biaya per m² di luar rentang standar (Rp 3jt - 10jt). Periksa kembali volume atau harga satuan.
                      </p>
                    </div>
                  )}
                </div>
                    </div>
                </motion.div>
              )}
              {activeSubTab === 'split' && (
                <motion.div
                  key="split"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <RABSplitView
                    items={rabItems}
                    cityId={projectData.location || ''}
                    grade={materialGrade}
                  />
                </motion.div>
              )}
              {activeSubTab === 'prices' && (
                <motion.div
                  key="prices"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MaterialPriceEditor
                    cityId={projectData.location || ''}
                    grade={materialGrade}
                    customPrices={customPrices}
                    onUpdate={(prices) => {
                      setCustomPrices(prices);
                      showToast('Harga diperbarui. Klik "Hasilkan RAB" ulang untuk menerapkan.', 'info');
                    }}
                  />
                </motion.div>
              )}
              {activeSubTab === 'materials' && (
                <motion.div 
                  key="materials"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <MaterialSummary items={rabItems} cityId={projectData.location || ''} grade={materialGrade} />
                </motion.div>
              )}
              {activeSubTab === 'timeline' && (
                <motion.div 
                  key="timeline"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ProjectTimeline items={rabItems} totalArea={totalArea} />
                </motion.div>
              )}
              {activeSubTab === 'template' && (
                <motion.div
                  key="template"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <RABTemplateManagerWrapper
                    rabItems={rabItems}
                    financials={financials}
                    onLoadTemplate={(items, fin) => {
                      setRabItems(items);
                      setFinancials(fin);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
    <div className="max-w-5xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((i) => (
          <Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                step >= i ? 'bg-primary text-white shadow-glow' : 'bg-card text-text-secondary border border-border'
              }`}>
                {step > i ? <CheckCircle2 size={20} /> : i}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${step >= i ? 'text-primary' : 'text-text-secondary'}`}>
                {i === 1 ? 'Data Proyek' : i === 2 ? 'Dimensi' : 'Breakdown RAB'}
              </span>
            </div>
            {i < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > i ? 'bg-primary' : 'bg-border'}`} />}
          </Fragment>
        ))}
      </div>

      <div className="glass-card p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
          <button 
            onClick={prevStep}
            disabled={step === 1 || loading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-0"
          >
            <ChevronLeft size={20} />
            <span>Kembali</span>
          </button>

          {step < 3 ? (
            <button 
              onClick={step === 2 ? handleGenerateRAB : nextStep}
              className="btn-primary flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (step === 2 && dimensionErrors.length > 0)}
              title={step === 2 && dimensionErrors.length > 0 ? dimensionErrors[0] : undefined}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === 2 ? 'Hasilkan RAB' : 'Lanjut'}</span>
                  {step === 2 && dimensionErrors.length > 0
                    ? <AlertTriangle size={16} className="text-red-300" />
                    : <ChevronRight size={20} />
                  }
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={handleSaveProject}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span>Simpan Proyek</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>

    {/* Sticky Total Bar — tampil saat step 3 */}
    {step === 3 && (
      <StickyTotalBar
        subtotal={summary.subtotal}
        grandTotal={summary.grandTotal}
        itemCount={rabItems.length}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    )}

    {/* RAB Preview Modal */}
    <RABPreviewModal
      isOpen={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      project={projectData}
      items={rabItems}
      financials={financials}
      grade={materialGrade}
    />

    {/* RAB Version Comparison */}
    {showComparison && (
      <RABVersionComparison
        projectId={tempProjectId}
        onClose={() => setShowComparison(false)}
      />
    )}
    </div>
    </div>
    </div>
    </>
  );
};

export default RABCalculator;
