import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  title?: string;
  hitRate: number;
}

export default function ChatHeader({
  title = 'New conversation',
  hitRate,
}: ChatHeaderProps) {
  return (
    <header className="h-14 shrink-0 border-b border-border dark:border-border-dark border-line flex items-center justify-between px-6 bg-void text-fog">
      <span className="text-sm font-medium">{title}</span>
      <div className="flex items-center gap-4 text-xs text-muted dark:text-muted-dark text-mist font-mono">
        <span>Cache hit rate: {hitRate}%</span>
        <Link to="/dashboard" className="hover:text-gold transition-colors">
          Dashboard →
        </Link>
      </div>
    </header>
  );
}
