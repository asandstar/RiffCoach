import { Calendar, Home, Music, ClipboardList, User, BookOpen } from 'lucide-react';
import type { PageType } from '@/types';

interface BottomNavProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  show: boolean;
}

const navItems: { id: PageType; label: string; icon: typeof Home }[] = [
  { id: 'today', label: '今日', icon: Home },
  { id: 'cover', label: 'Cover', icon: Music },
  { id: 'resource', label: '资料', icon: ClipboardList },
  { id: 'knowledge', label: '知识库', icon: BookOpen },
  { id: 'me', label: '我的', icon: User },
];

export function BottomNav({ currentPage, onPageChange, show }: BottomNavProps) {
  if (!show) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border-default z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-full transition-all duration-base ${
                isActive ? 'text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
