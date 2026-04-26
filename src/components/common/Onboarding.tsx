import { useState, useEffect, useRef } from 'react';
import {
  Calculator, BookOpen, BarChart3, Shield,
  ChevronRight, CheckCircle2, Bell, Share2, Download,
  Users, Lock, AlertTriangle, Play, Pause
} from 'lucide-react';

// ── Durasi minimum per slide (detik) ────────────────────────
const MIN_READ_TIME = 6; // user wajib baca minimal 6 detik per slide

const STEPS = [
  {
    icon: <Shield size={36} className="text-primary" />,
    badge: '⚠️ WAJIB DIBACA',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    title: 'Selamat Datang di SIVILIZE HUB PRO',
    desc: 'Sebelum mulai, baca panduan ini sampai selesai. Ini akan membantu lo menghindari kesalahan yang tidak perlu dan memaksimalkan penggunaan platform.',
    tips: [
      'Tutorial ini wajib diselesaikan sebelum bisa menggunakan aplikasi',
      'Setiap slide memiliki waktu minimum — tombol Lanjut aktif setelah lo membaca',
      'Data lo tersimpan aman di server terenkripsi',
    ],
    color: 'border-primary/30',
  },
  {
    icon: <Lock size={36} className="text-yellow-400" />,
    badge: '🔒 KEAMANAN AKUN',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    title: 'Jaga Keamanan Akun Lo',
    desc: 'Akun lo berisi data proyek dan RAB yang berharga. Lindungi dengan baik.',
    tips: [
      'Jangan bagikan password ke siapapun — termasuk tim lo',
      'Password harus mengandung huruf besar, kecil, angka, dan simbol',
      'Gunakan fitur "Lupa Password" jika lupa — jangan tebak-tebak',
      'Logout setelah selesai jika pakai perangkat bersama',
    ],
    color: 'border-yellow-500/30',
  },
  {
    icon: <Calculator size={36} className="text-primary" />,
    badge: '📐 FITUR UTAMA',
    badgeColor: 'bg-primary/20 text-primary border-primary/30',
    title: 'Kalkulator RAB Otomatis',
    desc: 'Buat RAB profesional sesuai standar AHSP/SNI dalam 3 langkah mudah.',
    tips: [
      'Step 1: Isi data proyek (nama, lokasi, dimensi bangunan)',
      'Step 2: Pilih jenis tanah dan pondasi untuk akurasi lebih baik',
      'Step 3: Klik "Generate RAB" — sistem otomatis hitung semua item',
      'Selalu simpan RAB sebagai versi setelah selesai input',
    ],
    color: 'border-primary/30',
  },
  {
    icon: <BarChart3 size={36} className="text-green-400" />,
    badge: '📊 KURVA S',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    title: 'Kurva S & Progress Proyek',
    desc: 'Pantau progress rencana vs realisasi untuk laporan ke owner atau bank.',
    tips: [
      'Isi tanggal mulai dan target selesai proyek terlebih dahulu',
      'Update progress realisasi secara rutin di Buku Harian',
      'Export Kurva S ke PDF untuk laporan ke bank atau owner',
      'Toggle Per Minggu / Per Bulan sesuai kebutuhan laporan',
    ],
    color: 'border-green-500/30',
  },
  {
    icon: <BookOpen size={36} className="text-blue-400" />,
    badge: '📔 BUKU HARIAN',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    title: 'Buku Harian Digital',
    desc: 'Catat progress harian dan upload foto lapangan langsung dari HP.',
    tips: [
      'Update buku harian minimal 1x per hari saat proyek berjalan',
      'Sistem akan kirim notifikasi jika proyek tidak diupdate 7 hari',
      'Foto lapangan tersimpan aman di server',
      'Progress dari buku harian otomatis masuk ke Kurva S',
    ],
    color: 'border-blue-500/30',
  },
  {
    icon: <Download size={36} className="text-purple-400" />,
    badge: '📄 EXPORT DOKUMEN',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'Cetak & Export RAB',
    desc: 'Export RAB ke PDF atau Excel dengan kop surat profesional.',
    tips: [
      'Klik "Cetak / Export" untuk preview sebelum download',
      'Isi nama perusahaan dan estimator sebelum cetak',
      'PDF sudah include kop surat, tanda tangan, dan nomor dokumen',
      'Excel berisi 3 sheet: RAB Detail, Rekapitulasi, dan AHSP',
    ],
    color: 'border-purple-500/30',
  },
  {
    icon: <Share2 size={36} className="text-orange-400" />,
    badge: '🔗 SHARE & BACKUP',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    title: 'Share RAB & Backup Data',
    desc: 'Bagikan RAB ke klien dan backup data agar tidak hilang.',
    tips: [
      'Gunakan "Bagikan RAB" untuk kirim link read-only ke klien/owner',
      'Klien bisa lihat RAB tanpa perlu daftar akun',
      'Backup data secara rutin via menu Backup & Restore',
      'File backup bisa di-import kembali jika ganti HP',
    ],
    color: 'border-orange-500/30',
  },
  {
    icon: <Bell size={36} className="text-red-400" />,
    badge: '🔔 NOTIFIKASI',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    title: 'Notifikasi & Pengingat',
    desc: 'Sistem akan otomatis mengingatkan lo tentang hal penting.',
    tips: [
      '"RAB Belum Disimpan" — muncul jika ada data yang belum disimpan sebagai versi',
      '"Proyek Tidak Diupdate" — muncul jika tidak ada update 7 hari',
      '"Progress Terlambat" — muncul jika realisasi jauh di bawah rencana',
      'Cek notifikasi secara rutin di ikon lonceng',
    ],
    color: 'border-red-500/30',
  },
  {
    icon: <AlertTriangle size={36} className="text-yellow-400" />,
    badge: '⚠️ KESALAHAN UMUM',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    title: 'Hindari Kesalahan Ini',
    desc: 'Kesalahan yang sering dilakukan pengguna baru — baca baik-baik.',
    tips: [
      'JANGAN tutup browser sebelum klik "Simpan Proyek" — data bisa hilang',
      'JANGAN pakai password yang sama dengan akun lain',
      'JANGAN bagikan link share RAB ke sembarang orang',
      'SELALU backup data sebelum ganti HP atau clear browser',
    ],
    color: 'border-yellow-500/30',
  },
  {
    icon: <Users size={36} className="text-green-400" />,
    badge: '✅ SIAP MULAI',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    title: 'Lo Siap Menggunakan SIVILIZE HUB PRO!',
    desc: 'Lo sudah membaca semua panduan penting. Selamat menggunakan platform ini.',
    tips: [
      'Mulai dengan membuat proyek pertama di menu Kalkulator RAB',
      'Hubungi support jika ada pertanyaan via menu Kontak',
      'Update aplikasi secara rutin untuk fitur terbaru',
      'Semoga proyek lo sukses dan lancar! 🚀',
    ],
    color: 'border-green-500/30',
  },
];

const Onboarding = () => {
  const [show, setShow] = useState(() => !localStorage.getItem('sivilize_onboarding_done'));
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MIN_READ_TIME);
  const canProceed = timeLeft <= 0;
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer setiap ganti slide
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(MIN_READ_TIME);
    setIsPaused(false);
  }, [step]);

  // Countdown timer
  useEffect(() => {
    if (!show || isPaused) return;
    if (timeLeft <= 0) {
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [show, step, isPaused, timeLeft]);

  const finish = () => {
    localStorage.setItem('sivilize_onboarding_done', '1');
    setShow(false);
  };

  const next = () => {
    if (!canProceed) return;
    if (step === STEPS.length - 1) {
      finish();
    } else {
      setStep(s => s + 1);
    }
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step) / (STEPS.length - 1)) * 100;
  const timerProgress = ((MIN_READ_TIME - timeLeft) / MIN_READ_TIME) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      <div className={`relative glass-card w-full max-w-lg border-2 ${current.color} overflow-hidden`}>

        {/* Progress bar atas */}
        <div className="h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <span className="text-text-secondary text-xs font-bold">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-background rounded-2xl border border-border flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h2 className="text-white font-black text-lg leading-tight">{current.title}</h2>
              <p className="text-text-secondary text-sm mt-1">{current.desc}</p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-background/60 border border-border rounded-xl p-4 space-y-2.5">
            {current.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-primary shrink-0 mt-0.5" />
                <p className="text-text-secondary text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>

          {/* Timer bar */}
          {!canProceed && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-xs">
                  {isPaused ? '⏸ Dijeda' : `⏱ Baca dulu... ${timeLeft}s`}
                </span>
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="text-text-secondary hover:text-white transition-colors"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${timerProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Step dots */}
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 h-1.5 bg-primary' :
                  i < step ? 'w-1.5 h-1.5 bg-primary/50' :
                  'w-1.5 h-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Tombol */}
          <button
            onClick={next}
            disabled={!canProceed}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              canProceed
                ? 'btn-primary'
                : 'bg-border text-text-secondary cursor-not-allowed opacity-60'
            }`}
          >
            {!canProceed ? (
              `Tunggu ${timeLeft} detik...`
            ) : isLast ? (
              <><CheckCircle2 size={18} /> Saya Sudah Mengerti — Mulai Sekarang</>
            ) : (
              <>Lanjut <ChevronRight size={18} /></>
            )}
          </button>

          {/* Catatan kecil */}
          <p className="text-center text-text-secondary text-[11px]">
            Tutorial ini wajib diselesaikan untuk melindungi data proyek lo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
