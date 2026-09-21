import React from 'react';

interface LokhaLogoProps {
  variant?: 'full' | 'compact' | 'icon-only' | 'badge';
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  onClick?: () => void;
}

export const LokhaLogo: React.FC<LokhaLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  onClick
}) => {
  // Dimension calculation
  const pixelSize = typeof size === 'number'
    ? size
    : size === 'sm' ? 32 : size === 'lg' ? 56 : 42;

  // Interwoven Armillary Sphere SVG Emblem
  const ArmillarySphere = () => (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
      aria-label="Lokha Sphere Emblem"
    >
      <defs>
        {/* Radiant Gold Gradient */}
        <linearGradient id="lokhaGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9EDB8" />
          <stop offset="35%" stopColor="#E2C167" />
          <stop offset="70%" stopColor="#C99E2A" />
          <stop offset="100%" stopColor="#966F12" />
        </linearGradient>

        {/* Platinum / Polished Silver Gradient */}
        <linearGradient id="lokhaPlatinum" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#E6E6EF" />
          <stop offset="75%" stopColor="#B4B4C4" />
          <stop offset="100%" stopColor="#7E7E90" />
        </linearGradient>

        {/* Subtle drop shadow for 3D depth */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#D4AF37" floodOpacity="0.28" />
        </filter>
      </defs>

      <g filter="url(#goldGlow)">
        {/* Band 1: Primary Gold Ellipse (Tilted Left) */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="22"
          transform="rotate(-35 50 50)"
          stroke="url(#lokhaGold)"
          strokeWidth="3.8"
          strokeLinecap="round"
        />

        {/* Band 2: Platinum Silver Ellipse (Tilted Right) */}
        <ellipse
          cx="50"
          cy="50"
          rx="44"
          ry="23"
          transform="rotate(35 50 50)"
          stroke="url(#lokhaPlatinum)"
          strokeWidth="3.6"
          strokeLinecap="round"
        />

        {/* Band 3: Vertical Gold Orbital Ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="25"
          ry="44"
          transform="rotate(15 50 50)"
          stroke="url(#lokhaGold)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />

        {/* Band 4: Interwoven Platinum Oblique Ring */}
        <ellipse
          cx="50"
          cy="50"
          rx="42"
          ry="19"
          transform="rotate(78 50 50)"
          stroke="url(#lokhaPlatinum)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Band 5: Equatorial Golden Belt */}
        <ellipse
          cx="50"
          cy="50"
          rx="45"
          ry="14"
          transform="rotate(-5 50 50)"
          stroke="url(#lokhaGold)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Inner Golden Core Accents */}
        <circle cx="50" cy="50" r="4" fill="url(#lokhaGold)" opacity="0.9" />
      </g>
    </svg>
  );

  // Squircle Badge Variant (as shown in the bottom row of the branding sheet)
  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={className}
        style={{
          width: pixelSize * 1.5,
          height: pixelSize * 1.5,
          borderRadius: '24%',
          backgroundColor: '#0E0E12',
          border: '1px solid rgba(212, 175, 55, 0.28)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform var(--transition-base), border-color var(--transition-base)'
        }}
      >
        <ArmillarySphere />
      </div>
    );
  }

  // Icon Only Variant
  if (variant === 'icon-only') {
    return (
      <div
        onClick={onClick}
        className={className}
        style={{
          cursor: onClick ? 'pointer' : 'default',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ArmillarySphere />
      </div>
    );
  }

  // Compact & Full Variants
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: pixelSize > 40 ? '0.9rem' : '0.65rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      <ArmillarySphere />

      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Brand Title: LOKHA */}
        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: pixelSize > 40 ? '1.45rem' : pixelSize > 32 ? '1.25rem' : '1.05rem',
          fontWeight: 800,
          letterSpacing: '0.22em',
          color: '#FFFFFF',
          lineHeight: 1.05,
          textTransform: 'uppercase'
        }}>
          LOKHA
        </div>

        {/* Gold Horizontal Accent Line */}
        <div style={{
          width: '32px',
          height: '1.5px',
          backgroundColor: 'var(--gold-primary)',
          margin: '3px 0',
          borderRadius: '1px',
          opacity: 0.9
        }} />

        {/* Subtitle / Tagline */}
        {variant === 'full' && (
          <div style={{
            fontSize: pixelSize > 40 ? '0.58rem' : '0.5rem',
            fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--gold-primary)',
            textTransform: 'uppercase',
            lineHeight: 1
          }}>
            Global Real Estate & Hospitality
          </div>
        )}
      </div>
    </div>
  );
};
