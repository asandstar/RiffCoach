import { Sparkles } from 'lucide-react';

interface AILoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AILoading({ text = 'AI 思考中...', size = 'md' }: AILoadingProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-dark animate-pulse-glow" />
        <div className="absolute inset-1 rounded-full bg-white/90 flex items-center justify-center">
          <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-8 h-8'} text-primary animate-spin-slow`} />
        </div>
        <div className="absolute -inset-1 rounded-full border-2 border-primary/20 border-t-primary animate-spin-slow" />
      </div>
      <div className="flex items-center gap-1">
        <span className={`${textSizes[size]} font-medium text-text-secondary`}>{text}</span>
        <span className="inline-flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
}
