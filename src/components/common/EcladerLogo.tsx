import React from 'react';

interface EcladerLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'icon' | 'full' | 'horizontal';
  showSubtitle?: boolean;
}

export const EcladerLogo: React.FC<EcladerLogoProps> = ({
  className = '',
  size = 48,
  variant = 'icon',
  showSubtitle = true,
}) => {
  // Pure Icon Emblem
  const renderEmblem = (emblemSize: number | string = size) => (
    <svg
      width={emblemSize}
      height={emblemSize}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        {/* Soft radial background glow */}
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f0fdf7" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#ecfdf5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#e6fcf1" stopOpacity="0" />
        </radialGradient>

        {/* Outer circuit path gradient (blue to deep emerald) */}
        <linearGradient id="circuitGrad" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="25%" stopColor="#0ea5e9" />
          <stop offset="55%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Leaf gradient left half */}
        <linearGradient id="leafGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Leaf gradient right half */}
        <linearGradient id="leafGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Shadow for depth */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#047857" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Subtle Circular Backdrop Glow */}
      <circle cx="200" cy="200" r="170" fill="url(#bgGlow)" />
      
      {/* Dashed Orbit Alignment Line */}
      <circle
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="#10b981"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />

      {/* Main Stylized "E" Circuit Enclosure */}
      <g filter="url(#softShadow)">
        {/* Outer C-loop representing the "E" spine and outer tracks */}
        <path
          d="M 250 110
             H 160
             A 90 90 0 0 0 70 200
             A 90 90 0 0 0 160 290
             H 230
             A 45 45 0 0 0 275 245
             A 45 45 0 0 0 230 200
             H 170
             A 30 30 0 0 1 140 170
             A 30 30 0 0 1 170 140
             H 240
             A 20 20 0 0 1 260 160
             A 20 20 0 0 1 240 180
             H 220"
          fill="none"
          stroke="url(#circuitGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner circuit branch track */}
        <path
          d="M 105 200
             A 55 55 0 0 0 160 255
             H 215
             A 25 25 0 0 0 240 230"
          fill="none"
          stroke="#059669"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Circuit Node Pin 1 (Top Blue) */}
        <circle cx="145" cy="110" r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="4" />

        {/* Circuit Node Pin 2 (Bottom Left) */}
        <circle cx="75" cy="235" r="7" fill="#059669" stroke="#ffffff" strokeWidth="3" />

        {/* Circuit Node Pin 3 (Internal) */}
        <circle cx="225" cy="180" r="6" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />

        {/* Center Circular Economy Leaf (Emblem Heart) */}
        <g transform="translate(185, 125) rotate(12)">
          {/* Left half of leaf */}
          <path
            d="M 25 0
               C 25 0 0 35 0 65
               C 0 95 25 115 25 115
               Z"
            fill="url(#leafGradLeft)"
          />
          {/* Right half of leaf */}
          <path
            d="M 25 0
               C 25 0 50 35 50 65
               C 50 95 25 115 25 115
               Z"
            fill="url(#leafGradRight)"
          />
          {/* Central Stem & Vein */}
          <path
            d="M 25 0 L 25 125"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />
        </g>
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{renderEmblem()}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {renderEmblem(size)}
        <div className="flex flex-col text-left">
          <span className="font-black text-xl tracking-[0.2em] text-[#131b2e] leading-none font-['Plus_Jakarta_Sans']">
            ECLADER
          </span>
          {showSubtitle && (
            <>
              <span className="text-[9px] font-bold tracking-[0.18em] text-[#007a5e] uppercase mt-1 leading-none font-['Plus_Jakarta_Sans']">
                Circular Electronics Intelligence
              </span>
              <span className="text-[8px] font-medium text-slate-400 tracking-wider mt-0.5 leading-none">
                REPAIR • REUSE • RESALE • DONATION • PARTS RECOVERY
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Full Stacked Brand Logo (Exact replica of uploaded image)
  return (
    <div className={`flex flex-col items-center text-center p-4 ${className}`}>
      {renderEmblem(typeof size === 'number' ? size : 240)}
      
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[#131b2e] tracking-[0.3em] font-['Plus_Jakarta_Sans'] pl-2">
          ECLADER
        </h1>
        
        <p className="text-xs sm:text-sm font-bold text-[#007a5e] tracking-[0.24em] uppercase font-['Plus_Jakarta_Sans']">
          Circular Electronics Intelligence
        </p>

        <p className="text-[10px] sm:text-xs font-semibold text-slate-500 tracking-[0.16em] uppercase flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="text-[#0d9488]">REPAIR</span>
          <span>•</span>
          <span className="text-[#007a5e]">REUSE</span>
          <span>•</span>
          <span className="text-[#0284c7]">RESALE</span>
          <span>•</span>
          <span className="text-[#4f46e5]">DONATION</span>
          <span>•</span>
          <span className="text-[#64748b]">PARTS RECOVERY</span>
        </p>
      </div>
    </div>
  );
};
