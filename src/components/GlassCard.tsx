import type { ReactNode, CSSProperties } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  elevated?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', style, elevated = false, hoverable = false, onClick }: GlassCardProps) {
  const baseClass = elevated ? 'glass-card-elevated' : 'glass-card';
  const hoverClass = hoverable || onClick ? 'glass-card-hover' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div className={`${baseClass} ${hoverClass} ${cursorClass} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
