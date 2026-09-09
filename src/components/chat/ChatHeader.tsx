import { Link } from 'react-router-dom';

interface ChatHeaderProps {
  title?: string;
  hitRate?: number;
}

export default function ChatHeader({
  title = 'New conversation',
  hitRate = 68,
}: ChatHeaderProps) {
  return (
    <header className="h-14 shrink-0 border-b border-line flex items-center justify-between px-6 bg-void">
      <span className="text-sm font-medium text-fog">{title}</span>
      <Link
        to="/dashboard"
        className="text-xs text-mist hover:text-gold transition-colors font-mono"
      >
        Cache hit rate: {hitRate}% →
      </Link>
    </header>
  );
}
