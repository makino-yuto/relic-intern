import { CalendarDays, List, Settings } from 'lucide-react';
import { Page } from '../types/diary';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems = [
  { id: 'list' as Page, label: '一覧', icon: List },
  { id: 'calendar' as Page, label: 'カレンダー', icon: CalendarDays },
  { id: 'settings' as Page, label: '設定', icon: Settings },
];

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex items-center h-16">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary/10' : ''}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
