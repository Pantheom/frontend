import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';

interface ChatHeaderProps {
  title?: string;
  hitRate: number;
  totalTokens: number;
  onOpenMobileNav?: () => void;
}

export default function ChatHeader({
  title = 'New conversation',
  hitRate,
  totalTokens,
  onOpenMobileNav,
}: ChatHeaderProps) {
  return (
    <header className="h-14 shrink-0 border-b border-border dark:border-border-dark border-line flex items-center justify-between px-3.5 sm:px-6 bg-void text-fog">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-1.5 -ml-1 rounded text-mist hover:text-fog hover:bg-surface border border-line-light transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4 text-gold" />
        </button>

        <span className="text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-xs md:max-w-md" title={title}>
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-muted dark:text-muted-dark text-mist font-mono shrink-0">
        {/* Desktop stats */}
        <span className="hidden sm:inline">Cache hit rate: {hitRate}%</span>
        <span className="hidden sm:inline">Tokens: {totalTokens.toLocaleString()}</span>

        {/* Mobile compact stats */}
        <span className="sm:hidden px-2 py-0.5 rounded bg-surface border border-line-light text-[10px]">
          Hit: {hitRate}%
        </span>
        <span className="sm:hidden px-2 py-0.5 rounded bg-surface border border-line-light text-[10px]">
          {totalTokens.toLocaleString()} tok
        </span>

        <Link to="/compare" className="hidden lg:inline hover:text-gold transition-colors">
          Compare →
        </Link>
        <Link to="/dashboard" className="hidden md:inline hover:text-gold transition-colors">
          Dashboard →
        </Link>
      </div>
    </header>
  );
}
