import React from 'react';

interface CivilEngineeringLogoProps {
  size?: number;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

/**
 * Logo SIVILIZE HUB PRO
 * Kotak orange rounded dengan ikon gedung klasik/capitol (kolom + kubah)
 */
const CivilEngineeringLogo: React.FC<CivilEngineeringLogoProps> = ({
  size = 64,
  className = '',
  variant = 'icon'
}) => {
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Background kotak orange rounded */}
        <rect x="0" y="0" width="64" height="64" rx="14" ry="14" fill="#FF7A00" />

        {/* Gedung klasik/capitol — coklat gelap */}
        {/* Kubah atas */}
        <ellipse cx="32" cy="16" rx="8" ry="5" fill="#7B3F00" />
        <rect x="29" y="11" width="6" height="6" fill="#7B3F00" />

        {/* Atap/pediment segitiga */}
        <polygon points="14,28 32,18 50,28" fill="#8B4513" />

        {/* Badan gedung */}
        <rect x="14" y="28" width="36" height="18" fill="#8B4513" />

        {/* Kolom-kolom */}
        <rect x="17" y="28" width="4" height="18" fill="#A0522D" rx="1" />
        <rect x="24" y="28" width="4" height="18" fill="#A0522D" rx="1" />
        <rect x="36" y="28" width="4" height="18" fill="#A0522D" rx="1" />
        <rect x="43" y="28" width="4" height="18" fill="#A0522D" rx="1" />

        {/* Pintu tengah */}
        <rect x="28" y="36" width="8" height="10" fill="#5C2E00" rx="1" />

        {/* Tangga/pondasi */}
        <rect x="12" y="46" width="40" height="4" fill="#8B4513" rx="1" />
        <rect x="10" y="50" width="44" height="4" fill="#7B3F00" rx="1" />

        {/* Garis bawah */}
        <rect x="8" y="54" width="48" height="3" fill="#6B3000" rx="1" />
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
        <span className="text-[10px] text-text-secondary">Platform Teknik Sipil Berbasis AI</span>
      </div>
    </div>
  );
};

export { CivilEngineeringLogo as LogoCivil };
export default CivilEngineeringLogo;
