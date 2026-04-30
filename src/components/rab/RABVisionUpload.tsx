/**
 * RABVisionUpload — Segera Hadir
 * Fitur upload denah otomatis sedang dalam pengembangan
 */
import { Sparkles, X } from 'lucide-react';
import { type Project } from '../../store/useStore';

interface RABVisionUploadProps {
  onResult: (data: {
    dimensions: { length: number; width: number; height: number };
    floors?: number;
    bedroomCount?: number;
    bathroomCount?: number;
    roofModel?: Project['roofModel'];
    notes?: string;
  }) => void;
  onClose: () => void;
}

const RABVisionUpload = ({ onClose }: RABVisionUploadProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md p-8 space-y-5 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <Sparkles size={32} className="text-primary" />
        </div>

        <div>
          <h3 className="text-white font-bold text-xl">Fitur Segera Hadir!</h3>
          <p className="text-text-secondary text-sm mt-2 leading-relaxed">
            Fitur <strong className="text-white">Upload Denah Otomatis</strong> dengan AI Vision sedang dalam pengembangan aktif.
            Segera tersedia di pembaruan berikutnya.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-primary text-xs font-bold">🚀 Coming Soon</p>
          <p className="text-text-secondary text-xs mt-1">Upload foto denah, AI akan baca dimensi secara otomatis</p>
        </div>

        <button onClick={onClose} className="btn-primary w-full py-3">
          Isi Dimensi Manual
        </button>
      </div>
    </div>
  );
};

export default RABVisionUpload;
