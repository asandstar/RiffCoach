import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', elevated = false, hoverable = false, onClick }: GlassCardProps) {
  const baseClass = elevated ? 'glass-card-elevated' : 'glass-card';
  const hoverClass = hoverable || onClick ? 'glass-card-hover' : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div className={`${baseClass} ${hoverClass} ${cursorClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
