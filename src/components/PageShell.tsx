import type { ReactNode } from 'react';

interface PageShellProps {
  title?: string;
  children: ReactNode;
  showBottomNav: boolean;
}

export function PageShell({ title, children, showBottomNav }: PageShellProps) {
  return (
    <div className={`min-h-screen bg-bg-base ${showBottomNav ? 'pb-28 md:pb-24' : 'pb-8 md:pb-12'}`}>
      {title && (
        <header className="sticky top-0 bg-bg-base/90 backdrop-blur-md z-40 border-b border-border-subtle">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-text-primary">{title}</h1>
          </div>
        </header>
      )}
      <main className="max-w-lg mx-auto px-4 py-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
