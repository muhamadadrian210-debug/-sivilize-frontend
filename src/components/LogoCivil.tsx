import React from 'react';

interface CivilEngineeringLogoProps {
  size?: number;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

const CivilEngineeringLogo: React.FC<CivilEngineeringLogoProps> = ({ size = 64, className = '', variant = 'icon' }) => {
  if (variant === 'icon') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9A3C"/>
            <stop offset="100%" stopColor="#FF6B00"/>
          </linearGradient>
        </defs>
        {/* Kotak orange rounded */}
        <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#orangeGrad)"/>
        {/* 3 gedung - tengah paling tinggi */}
        {/* Gedung kiri */}
        <rect x="10" y="28" width="12" height="26" fill="#1a1a2e" rx="1"/>
        <rect x="12" y="32" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="17" y="32" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="12" y="38" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="17" y="38" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        {/* Gedung tengah - paling tinggi */}
        <rect x="24" y="16" width="16" height="38" fill="#1a1a2e" rx="1"/>
        <rect x="27" y="20" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        <rect x="33" y="20" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        <rect x="27" y="28" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        <rect x="33" y="28" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        <rect x="27" y="36" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        <rect x="33" y="36" width="4" height="4" fill="#FF9A3C" opacity="0.7"/>
        {/* Gedung kanan */}
        <rect x="42" y="28" width="12" height="26" fill="#1a1a2e" rx="1"/>
        <rect x="44" y="32" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="49" y="32" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="44" y="38" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        <rect x="49" y="38" width="3" height="3" fill="#FF9A3C" opacity="0.6"/>
        {/* Tanah/garis bawah */}
        <path d="M6 54 Q32 50 58 54" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  if (variant === 'text') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span className="text-3xl font-black text-primary italic tracking-tighter">SIVILIZE</span>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">HUB PRO</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <CivilEngineeringLogo size={size} variant="icon" />
      <div className="flex flex-col">
        <span className="text-2xl font-black text-white italic tracking-tighter">SIVILIZE</span>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">HUB PRO</span>
      </div>
    </div>
  );
};

export { CivilEngineeringLogo as LogoCivil };
export default CivilEngineeringLogo;
