import { FileText, AlertCircle, Ban, CheckCircle2, ShieldOff, Scale, CreditCard, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
  const sections = [
    {
      title: '1. Penerimaan Syarat',
      icon: CheckCircle2,
      content: [
        'Dengan mendaftar dan menggunakan Sivilize Hub Pro, Anda menyetujui syarat dan ketentuan ini secara penuh.',
        'Jika Anda tidak menyetujui syarat ini, harap hentikan penggunaan layanan.',
        'Pengguna harus berusia minimal 18 tahun atau memiliki izin dari wali yang sah.',
        'Syarat ini berlaku efektif sejak 13 Februari 2026.',
      ]
    },
    {
      title: '2. Deskripsi Layanan',
      icon: FileText,
      content: [
        'Sivilize Hub Pro adalah platform perhitungan Rencana Anggaran Biaya (RAB) konstruksi berbasis web.',
        'Layanan mencakup: kalkulator RAB, database AHSP, analisis struktur, manajemen proyek, dan ekspor dokumen.',
        'Perhitungan mengacu pada SE 47/SE/Dk/2026 (Dirjen Bina Konstruksi) dan standar SNI yang berlaku.',
        'Kami berhak memperbarui, memodifikasi, atau menghentikan fitur tertentu tanpa pemberitahuan sebelumnya.',
      ]
    },
    {
      title: '3. Akun Pengguna & Keamanan',
      icon: ShieldOff,
      content: [
        'Setiap pengguna wajib memverifikasi email melalui kode OTP saat pertama kali mendaftar dan login.',
        'Anda bertanggung jawab penuh atas keamanan akun dan kata sandi Anda.',
        'Jangan bagikan kode OTP kepada siapapun — Sivilize Corp tidak pernah meminta kode OTP Anda.',
        'Laporkan segera jika Anda mencurigai akun Anda telah diakses tanpa izin.',
        'Akun bersifat personal dan tidak boleh dipindahtangankan.',
      ]
    },
    {
      title: '4. Penggunaan yang Diizinkan',
      icon: CheckCircle2,
      content: [
        'Menggunakan platform untuk keperluan perhitungan RAB dan manajemen proyek konstruksi.',
        'Mengekspor hasil perhitungan untuk keperluan profesional dan bisnis.',
        'Menyimpan dan mengelola data proyek konstruksi Anda sendiri.',
        'Berbagi hasil RAB dengan klien melalui fitur share link yang tersedia.',
      ]
    },
    {
      title: '5. Larangan Penggunaan',
      icon: Ban,
      content: [
        'Dilarang melakukan reverse engineering terhadap algoritma perhitungan AHSP.',
        'Dilarang menggunakan skrip otomatis (bot) untuk mengambil data dari platform.',
        'Dilarang mengunggah konten berbahaya, virus, atau malware.',
        'Dilarang menggunakan platform untuk tujuan ilegal atau merugikan pihak lain.',
        'Dilarang mencoba menembus sistem keamanan atau mengakses data pengguna lain.',
        'Pelanggaran dapat mengakibatkan penangguhan atau penghapusan akun secara permanen.',
      ]
    },
    {
      title: '6. Disclaimer Perhitungan',
      icon: AlertCircle,
      content: [
        'Hasil perhitungan RAB bersifat ESTIMASI berdasarkan koefisien AHSP dan harga pasar.',
        'Untuk konstruksi riil, hasil harus divalidasi oleh Structural Engineer bersertifikat.',
        'Sivilize Corp tidak bertanggung jawab atas kerugian akibat penggunaan hasil perhitungan tanpa validasi profesional.',
        'Harga material dan upah dapat berbeda di lapangan — selalu lakukan survei harga lokal.',
        'Fitur AI Vision (analisis denah) adalah estimasi awal dan tidak menggantikan pengukuran lapangan.',
      ]
    },
    {
      title: '7. Hak Kekayaan Intelektual',
      icon: Scale,
      content: [
        'Seluruh konten, desain, algoritma, dan kode Sivilize Hub Pro adalah milik Sivilize Corp.',
        'Data proyek yang Anda buat adalah milik Anda sepenuhnya.',
        'Anda memberikan kami lisensi terbatas untuk menyimpan dan memproses data Anda guna menyediakan layanan.',
        'Dilarang menyalin, mendistribusikan, atau mengkomersialkan platform tanpa izin tertulis.',
      ]
    },
    {
      title: '8. Layanan Gratis & Berbayar',
      icon: CreditCard,
      content: [
        'Saat ini Sivilize Hub Pro tersedia secara gratis dalam fase beta.',
        'Kami berhak memperkenalkan paket berbayar di masa mendatang dengan pemberitahuan sebelumnya.',
        'Pengguna yang sudah terdaftar sebelum perubahan harga akan mendapat pemberitahuan minimal 30 hari.',
      ]
    },
    {
      title: '9. Kontak & Dukungan',
      icon: HelpCircle,
      content: [
        'Email: muhamadadrian210@gmail.com',
        'Platform: sivilize-hub-pro.vercel.app',
        'Perusahaan: Sivilize Corp',
        'Untuk pertanyaan, keluhan, atau permintaan penghapusan akun, hubungi email di atas.',
      ]
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <FileText size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Syarat & Ketentuan</h1>
            <p className="text-text-secondary text-sm">Sivilize Corp — Sivilize Hub Pro</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary">
          <span>📅 Berlaku sejak: <span className="text-white font-bold">13 Februari 2026</span></span>
          <span>🔄 Terakhir diperbarui: <span className="text-white font-bold">April 2026</span></span>
          <span>🏢 Sivilize Corp</span>
        </div>
        <p className="text-text-secondary text-sm mt-4 leading-relaxed">
          Syarat dan Ketentuan ini mengatur penggunaan platform Sivilize Hub Pro yang dioperasikan oleh Sivilize Corp. 
          Harap baca dengan seksama sebelum menggunakan layanan kami.
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

      {/* Footer note */}
      <div className="glass-card p-6 border-primary/20">
        <p className="text-text-secondary text-xs text-center leading-relaxed">
          Dengan menggunakan Sivilize Hub Pro, Anda menyatakan telah membaca, memahami, dan menyetujui 
          seluruh Syarat & Ketentuan ini. Sivilize Corp berhak memperbarui syarat ini sewaktu-waktu.
          <br /><br />
          <span className="text-primary font-bold">© 2026 Sivilize Corp. All rights reserved.</span>
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
