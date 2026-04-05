import React, { useState } from 'react';
import { LogoCivil, LogoBlueprint, LogoStructural, LogoBridge } from './LogoCivil';

const LogoSelector = ({ size = 40, className = "" }) => {
  const [currentLogo, setCurrentLogo] = useState('civil');
  
  const logos = {
    civil: LogoCivil,
    blueprint: LogoBlueprint,
    structural: LogoStructural,
    bridge: LogoBridge
  };
  
  const logoNames = {
    civil: 'Building Structure',
    blueprint: 'Blueprint Design',
    structural: 'Truss Engineering',
    bridge: 'Bridge Engineering'
  };
  
  const CurrentLogo = logos[currentLogo];
  
  return (
    <div className="relative group">
      <CurrentLogo size={size} className={className} />
      
      {/* Logo Selector Dropdown */}
      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[200px]">
        <div className="text-xs font-semibold text-gray-700 mb-2 px-2">Pilih Logo Teknik Sipil:</div>
        {Object.entries(logos).map(([key, LogoComponent]) => (
          <button
            key={key}
            onClick={() => setCurrentLogo(key)}
            className={`w-full flex items-center space-x-2 px-2 py-1 rounded text-xs hover:bg-gray-100 transition-colors ${
              currentLogo === key ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
            }`}
          >
            <LogoComponent size={20} />
            <span className="text-left">{logoNames[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LogoSelector;
