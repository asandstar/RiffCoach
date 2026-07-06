import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', elevated = false, onClick }: GlassCardProps) {
  return (
    <div className={`${elevated ? 'glass-card-elevated' : 'glass-card'} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
