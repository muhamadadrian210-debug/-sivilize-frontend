import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, FileText, Building2, Wallet, Landmark, ArrowLeft } from 'lucide-react';

const VerifyView = () => {
  // Parse query params: ?id=SIV-123456&project=Nama%20Proyek&total=150000000&date=10/07/2026&company=PT%20Sivilize%2520Corp%2520Indonesia
  const getParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get('id') || 'SIV-UNKNOWN',
      project: params.get('project') || 'Proyek Tidak Diketahui',
      total: params.get('total') || '0',
      date: params.get('date') || new Date().toLocaleDateString('id-ID'),
      company: params.get('company') || 'PT Sivilize Corp Indonesia',
    };
  };

  const { id, project, total, date, company } = getParams();

  const formatCurrency = (val: string) => {
    const num = parseFloat(val.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return 'Rp 0';
    return 'Rp ' + num.toLocaleString('id-ID');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#ff7a0015,transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-card/65 backdrop-blur-lg border border-border rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        {/* Verification Status Badge */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-[0_0_30px_rgba(34,197,94,0.15)]">
            <ShieldCheck size={44} className="animate-pulse" />
            <span className="absolute -bottom-1 px-3 py-0.5 rounded-full bg-green-500 text-black text-[10px] font-black tracking-wider uppercase">
              ASLI
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Dokumen Terverifikasi</h2>
          <p className="text-text-secondary text-xs mt-2 leading-relaxed px-4">
            Dokumen Rencana Anggaran Biaya (RAB) ini telah terverifikasi secara resmi diterbitkan melalui platform **Sivilize Hub Pro**.
          </p>
        </div>

        {/* Certificate / Details Frame */}
        <div className="space-y-4 bg-background/50 border border-border/80 rounded-2xl p-5 mb-8">
          {/* Company Name */}
          <div className="flex items-start gap-4 pb-4 border-b border-border/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Landmark size={16} />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Penerbit Resmi</p>
              <p className="text-white font-extrabold text-sm mt-0.5">{company}</p>
              <p className="text-[10px] text-primary font-semibold mt-0.5">Bagian dari Ekosistem PT Sivilize Corp Indonesia</p>
            </div>
          </div>

          {/* Doc ID */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                <FileText size={12} />
                <span>No. Dokumen</span>
              </div>
              <p className="text-white font-bold text-xs mt-1 font-mono tracking-wider">{id}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                <Calendar size={12} />
                <span>Tanggal Cetak</span>
              </div>
              <p className="text-white font-bold text-xs mt-1">{date}</p>
            </div>
          </div>

          {/* Project Name */}
          <div className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
              <Building2 size={12} />
              <span>Nama Proyek</span>
            </div>
            <p className="text-white font-extrabold text-sm">{project}</p>
          </div>

          {/* Grand Total */}
          <div>
            <div className="flex items-center gap-2 text-text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
              <Wallet size={12} />
              <span>Total Estimasi Biaya (RAB)</span>
            </div>
            <p className="text-primary font-black text-xl tracking-tight">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="text-center pt-2 border-t border-border/50 text-[10px] text-text-secondary leading-relaxed">
          <p>© {new Date().getFullYear()} PT Sivilize Corp Indonesia. Hak Cipta Dilindungi.</p>
          <p className="mt-1 italic">Sistem Keamanan Tanda Tangan Digital Verifikasi Cepat & Anti-Duplikasi</p>
        </div>

        {/* Return Button */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Utama</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyView;
