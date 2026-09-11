import React from 'react';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({ className = 'w-8 h-8', style }: LogoProps) {
  const src = `${import.meta.env.BASE_URL}logo.jpeg`;
  return (
    <img
      src={src}
      alt="Jamia Taleem-ul-Quran Logo"
      className={className}
      style={{ objectFit: 'contain', borderRadius: '50%', ...style }}
    />
  );
}
