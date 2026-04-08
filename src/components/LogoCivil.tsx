import React from 'react';

interface CivilEngineeringLogoProps {
  size?: number;
  className?: string;
  variant?: 'icon' | 'text' | 'full';
}

/**
 * Civil Engineering themed logo for SIVILIZE HUB PRO
 * Features construction/architecture elements
 */
const CivilEngineeringLogo: React.FC<CivilEngineeringLogoProps> = ({
  size = 64,
  className = '',
  variant = 'icon'
}) => {
  const iconSize = size;

  // Icon-only variant (construction blueprint style)
  if (variant === 'icon') {
    return (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Blueprint grid background */}
        <circle cx="32" cy="32" r="30" fill="url(#grad1)" opacity="0.1" />
        
        {/* Main structure - building silhouette */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* Foundation */}
          <rect x="16" y="44" width="32" height="12" stroke="currentColor" strokeWidth="2" fill="none" />
          
          {/* Main building */}
          <rect x="18" y="24" width="28" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
          
          {/* Roof/Peak */}
          <polygon
            points="18,24 32,8 46,24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          
          {/* Windows - left column */}
          <rect x="22" y="28" width="4" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="22" y="36" width="4" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          
          {/* Windows - right column */}
          <rect x="38" y="28" width="4" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="38" y="36" width="4" height="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          
          {/* Door */}
          <rect x="30" y="38" width="4" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          
          {/* Ruler/measurement line */}
          <line x1="12" y1="56" x2="52" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="12" y1="54" x2="12" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="52" y1="54" x2="52" y2="58" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Gradient definition */}
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF7A00', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FF7A00', stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Text variant
  if (variant === 'text') {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span className="text-3xl font-black text-primary italic tracking-tighter">SIVILIZE</span>
        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">HUB PRO</span>
      </div>
    );
  }

  // Full variant with icon and text
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className={`w-${size / 4} h-${size / 4} text-primary`}>
        <CivilEngineeringLogo size={size} variant="icon" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-black text-white italic tracking-tighter">SIVILIZE</span>
        <span className="text-xs font-bold text-primary uppercase tracking-widest">HUB PRO</span>
        <span className="text-[10px] text-text-secondary">Platform Teknik Sipil Berbasis AI</span>
      </div>
    </div>
  );
};

// Named export for backward compatibility
export { CivilEngineeringLogo as LogoCivil };
export default CivilEngineeringLogo;
