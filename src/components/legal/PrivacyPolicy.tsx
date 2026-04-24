import { ShieldCheck, Lock, Eye, FileCheck, RefreshCw, Mail, Database, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: '1. Data yang Kami Kumpulkan',
      icon: Eye,
      content: [
        'Informasi Akun: Nama lengkap dan alamat email yang Anda daftarkan.',
        'Kata Sandi: Disimpan dalam bentuk terenkripsi (bcrypt hash) — kami tidak pernah menyimpan kata sandi dalam bentuk teks biasa.',
        'Kode OTP: Hanya disimpan sementara di memori server selama 5 menit, kemudian dihapus otomatis.',
        'Data Proyek: Detail perhitungan RAB, volume pekerjaan, dan data AHSP yang Anda masukkan.',
        'Log Aktivitas: Informasi penggunaan platform untuk tujuan keamanan dan optimasi sistem.',
        'Data Teknis: Alamat IP dan user agent untuk keperluan keamanan dan pencegahan penyalahgunaan.',
      ]
    },
    {
      title: '2. Tujuan Penggunaan Data',
      icon: FileCheck,
      content: [
        'Menyediakan layanan perhitungan RAB dan manajemen proyek konstruksi.',
        'Mengirimkan kode OTP untuk verifikasi identitas saat login dan pendaftaran.',
        'Mengirimkan notifikasi terkait status akun dan pembaruan sistem.',
        'Menjaga keamanan akun dan mencegah akses tidak sah.',
        'Meningkatkan kualitas layanan berdasarkan pola penggunaan secara anonim.',
      ]
    },
    {
      title: '3. Penyimpanan & Keamanan Data',
      icon: Lock,
      content: [
        'Data disimpan di MongoDB Atlas dengan enkripsi at-rest dan in-transit (TLS/SSL).',
        'Kata sandi dienkripsi menggunakan bcrypt dengan salt factor 10.',
        'Kode OTP di-hash menggunakan SHA-256 sebelum disimpan.',
        'Sistem dilindungi oleh firewall, rate limiting, dan proteksi DDoS.',
        'Token autentikasi (JWT) memiliki masa berlaku 30 hari dan dapat dicabut saat logout.',
        'Kami tidak pernah menjual atau membagikan data pribadi Anda kepada pihak ketiga.',
      ]
    },
    {
      title: '4. Layanan Pihak Ketiga',
      icon: Globe,
      content: [
        'Resend (resend.com): Digunakan untuk pengiriman email OTP. Email Anda diteruskan ke layanan ini hanya untuk keperluan pengiriman.',
        'MongoDB Atlas: Penyedia database cloud untuk penyimpanan data akun dan proyek.',
        'Vercel: Platform hosting untuk frontend dan backend aplikasi.',
        'Google Gemini AI: Digunakan untuk fitur analisis gambar denah (AI Vision). Gambar yang diunggah diproses oleh Google AI dan tidak disimpan oleh kami.',
      ]
    },
    {
      title: '5. Hak Pengguna',
      icon: ShieldCheck,
      content: [
        'Hak Akses: Anda dapat melihat data akun Anda kapan saja melalui halaman profil.',
        'Hak Koreksi: Anda dapat memperbarui nama dan email melalui pengaturan profil.',
        'Hak Hapus: Anda dapat meminta penghapusan akun dan seluruh data dengan menghubungi kami.',
        'Hak Portabilitas: Anda dapat mengekspor data proyek Anda dalam format JSON melalui fitur Backup.',
      ]
    },
    {
      title: '6. Retensi Data',
      icon: Database,
      content: [
        'Data akun aktif disimpan selama akun masih aktif digunakan.',
        'Jika akun tidak aktif selama 2 tahun, kami berhak menghapus data secara permanen.',
        'Log keamanan disimpan maksimal 90 hari.',
        'Kode OTP dihapus otomatis setelah 5 menit atau setelah digunakan.',
      ]
    },
    {
      title: '7. Pembaruan Kebijakan',
      icon: RefreshCw,
      content: [
        'Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan diberitahukan melalui email.',
        'Penggunaan layanan setelah pembaruan dianggap sebagai persetujuan terhadap kebijakan baru.',
        'Versi terbaru kebijakan selalu tersedia di halaman ini.',
      ]
    },
    {
      title: '8. Hubungi Kami',
      icon: Mail,
      content: [
        'Untuk pertanyaan terkait privasi, hubungi: muhamadadrian210@gmail.com',
        'Perusahaan: Sivilize Corp',
        'Platform: Sivilize Hub Pro — sivilize-hub-pro.vercel.app',
      ]
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Kebijakan Privasi</h1>
            <p className="text-text-secondary text-sm">Sivilize Corp — Sivilize Hub Pro</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
          <span>📅 Berlaku sejak: <span className="text-white font-bold">13 Februari 2026</span></span>
          <span>🔄 Terakhir diperbarui: <span className="text-white font-bold">April 2026</span></span>
          <span>🏢 Sivilize Corp</span>
        </div>
        <p className="text-text-secondary text-sm mt-4 leading-relaxed">
          Sivilize Corp ("kami", "kita") berkomitmen melindungi privasi pengguna Sivilize Hub Pro. 
          Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda.
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <div key={i} className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <h2 className="text-white font-bold">{section.title}</h2>
            </div>
            <ul className="space-y-2">
              {section.content.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-text-secondary text-sm leading-relaxed">
                  <span className="text-primary mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default PrivacyPolicy;
