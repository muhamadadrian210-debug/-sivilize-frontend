/* eslint-disable */
import React from 'react';

// Logo Teknik Sipil - Modern Construction Theme
const LogoCivil = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="#1e293b" stroke="#ff6b35" strokeWidth="2"/>
      
      {/* Building Structure */}
      <g fill="none" stroke="#ff6b35" strokeWidth="3">
        {/* Foundation */}
        <rect x="30" y="140" width="140" height="40" fill="#ff6b35" opacity="0.8"/>
        
        {/* Main Building */}
        <rect x="40" y="60" width="120" height="80" fill="#ff6b35" opacity="0.3"/>
        
        {/* Columns */}
        <rect x="55" y="60" width="8" height="80" fill="#ff6b35" opacity="0.8"/>
        <rect x="85" y="60" width="8" height="80" fill="#ff6b35" opacity="0.8"/>
        <rect x="115" y="60" width="8" height="80" fill="#ff6b35" opacity="0.8"/>
        <rect x="137" y="60" width="8" height="80" fill="#ff6b35" opacity="0.8"/>
        
        {/* Roof */}
        <polygon points="35,60 100,20 165,60" fill="#ff6b35" opacity="0.6"/>
        
        {/* Crane/Tower */}
        <line x1="100" y1="20" x2="100" y2="5" stroke="#ff6b35" strokeWidth="4"/>
        <line x1="95" y1="10" x2="105" y2="10" stroke="#ff6b35" strokeWidth="2"/>
      </g>
      
      {/* SIVILIZE Text */}
      <text x="100" y="185" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">
        SIVILIZE
      </text>
      
      {/* HUB PRO Text */}
      <text x="100" y="195" textAnchor="middle" fill="#ff6b35" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">
        HUB PRO
      </text>
    </svg>
  );
};

// Logo Alternative 2 - Blueprint Style
const LogoBlueprint = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blueprint Background */}
      <rect width="200" height="200" fill="#0f172a" stroke="#3b82f6" strokeWidth="2"/>
      
      {/* Grid Lines */}
      <g stroke="#1e40af" strokeWidth="0.5" opacity="0.5">
        <line x1="50" y1="0" x2="50" y2="200"/>
        <line x1="100" y1="0" x2="100" y2="200"/>
        <line x1="150" y1="0" x2="150" y2="200"/>
        <line x1="0" y1="50" x2="200" y2="50"/>
        <line x1="0" y1="100" x2="200" y2="100"/>
        <line x1="0" y1="150" x2="200" y2="150"/>
      </g>
      
      {/* Building Blueprint */}
      <g fill="none" stroke="#3b82f6" strokeWidth="2">
        {/* Foundation Plan */}
        <rect x="40" y="130" width="120" height="50" fill="#3b82f6" opacity="0.2"/>
        
        {/* Floor Plan */}
        <rect x="50" y="70" width="100" height="60" fill="#3b82f6" opacity="0.1"/>
        
        {/* Room Divisions */}
        <line x1="100" y1="70" x2="100" y2="130"/>
        <line x1="50" y1="100" x2="150" y2="100"/>
        
        {/* Dimensions */}
        <line x1="40" y1="140" x2="40" y2="145" stroke="#3b82f6" strokeWidth="3"/>
        <line x1="160" y1="140" x2="160" y2="145" stroke="#3b82f6" strokeWidth="3"/>
        <line x1="40" y1="142" x2="160" y2="142" stroke="#3b82f6" strokeWidth="1"/>
        
        <line x1="60" y1="70" x2="60" y2="65" stroke="#3b82f6" strokeWidth="3"/>
        <line x1="140" y1="70" x2="140" y2="65" stroke="#3b82f6" strokeWidth="3"/>
        <line x1="60" y1="67" x2="140" y2="67" stroke="#3b82f6" strokeWidth="1"/>
      </g>
      
      {/* Text */}
      <text x="100" y="185" textAnchor="middle" fill="#3b82f6" fontSize="14" fontWeight="bold" fontFamily="monospace">
        SIVILIZE
      </text>
      <text x="100" y="195" textAnchor="middle" fill="#60a5fa" fontSize="7" fontFamily="monospace">
        HUB PRO
      </text>
    </svg>
  );
};

// Logo Alternative 3 - Structural Engineering
const LogoStructural = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="200" height="200" fill="#1e293b"/>
      
      {/* Truss Structure */}
      <g fill="none" stroke="#ff6b35" strokeWidth="2.5">
        {/* Bottom Chord */}
        <line x1="30" y1="140" x2="170" y2="140" stroke="#ff6b35" strokeWidth="3"/>
        
        {/* Top Chord */}
        <line x1="40" y1="80" x2="160" y2="80" stroke="#ff6b35" strokeWidth="3"/>
        
        {/* Vertical Members */}
        <line x1="40" y1="80" x2="40" y2="140"/>
        <line x1="70" y1="80" x2="70" y2="140"/>
        <line x1="100" y1="80" x2="100" y2="140"/>
        <line x1="130" y1="80" x2="130" y2="140"/>
        <line x1="160" y1="80" x2="160" y2="140"/>
        
        {/* Diagonal Members */}
        <line x1="40" y1="80" x2="70" y2="140"/>
        <line x1="70" y1="80" x2="40" y2="140"/>
        
        <line x1="70" y1="80" x2="100" y2="140"/>
        <line x1="100" y1="80" x2="70" y2="140"/>
        
        <line x1="100" y1="80" x2="130" y2="140"/>
        <line x1="130" y1="80" x2="100" y2="140"/>
        
        <line x1="130" y1="80" x2="160" y2="140"/>
        <line x1="160" y1="80" x2="130" y2="140"/>
        
        {/* Supports */}
        <polygon points="30,140 40,140 35,150" fill="#ff6b35"/>
        <polygon points="160,140 170,140 165,150" fill="#ff6b35"/>
      </g>
      
      {/* Load Arrows */}
      <g fill="#ff6b35">
        <polygon points="100,60 95,70 105,70" />
        <line x1="100" y1="60" x2="100" y2="70" stroke="#ff6b35" strokeWidth="2"/>
      </g>
      
      {/* Text */}
      <text x="100" y="175" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">
        SIVILIZE
      </text>
      <text x="100" y="185" textAnchor="middle" fill="#ff6b35" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">
        HUB PRO
      </text>
    </svg>
  );
};

// Logo Alternative 4 - Bridge Engineering
const LogoBridge = ({ size = 40, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Sky Background */}
      <rect width="200" height="200" fill="#0f172a"/>
      
      {/* Water */}
      <rect x="0" y="140" width="200" height="60" fill="#1e3a8a" opacity="0.6"/>
      
      {/* Bridge Structure */}
      <g fill="none" stroke="#ff6b35" strokeWidth="2">
        {/* Bridge Deck */}
        <rect x="20" y="120" width="160" height="8" fill="#ff6b35" opacity="0.8"/>
        
        {/* Towers */}
        <rect x="55" y="60" width="8" height="68" fill="#ff6b35" opacity="0.8"/>
        <rect x="137" y="60" width="8" height="68" fill="#ff6b35" opacity="0.8"/>
        
        {/* Suspension Cables */}
        <path d="M 59 60 Q 100 40 141 60" fill="none" stroke="#ff6b35" strokeWidth="3"/>
        
        {/* Vertical Cables */}
        <line x1="59" y1="60" x2="59" y2="124" stroke="#ff6b35" strokeWidth="1"/>
        <line x1="75" y1="65" x2="75" y2="124" stroke="#ff6b35" strokeWidth="1"/>
        <line x1="100" y1="50" x2="100" y2="124" stroke="#ff6b35" strokeWidth="1"/>
        <line x1="125" y1="65" x2="125" y2="124" stroke="#ff6b35" strokeWidth="1"/>
        <line x1="141" y1="60" x2="141" y2="124" stroke="#ff6b35" strokeWidth="1"/>
        
        {/* Foundation */}
        <rect x="45" y="128" width="28" height="12" fill="#ff6b35" opacity="0.6"/>
        <rect x="127" y="128" width="28" height="12" fill="#ff6b35" opacity="0.6"/>
      </g>
      
      {/* Text */}
      <text x="100" y="175" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">
        SIVILIZE
      </text>
      <text x="100" y="185" textAnchor="middle" fill="#ff6b35" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">
        HUB PRO
      </text>
    </svg>
  );
};

export { LogoCivil, LogoBlueprint, LogoStructural, LogoBridge };
