import { Link } from 'react-router-dom';
import { Plus, Clock, BarChart2, ArrowLeft, Shield } from 'lucide-react';

interface NavRailProps {
  onNewChat?: () => void;
  onToggleHistory?: () => void;
  historyOpen?: boolean;
}

export default function NavRail({
  onNewChat,
  onToggleHistory,
  historyOpen,
}: NavRailProps) {
  return (
    <nav className="w-48 shrink-0 border-r border-line flex flex-col p-4 gap-2 justify-between select-none bg-void">
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="font-display text-base mb-6 font-semibold tracking-wider text-fog hover:text-gold transition-colors flex items-center gap-2"
          title="Return to Landing Page"
        >
          <Shield className="w-4 h-4 text-gold" />
          <span>CERBERUS</span>
        </Link>

        <button
          onClick={onNewChat}
          className="text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 text-fog hover:bg-surface border border-transparent hover:border-line-light transition-colors font-medium"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>New chat</span>
        </button>

        <button
          onClick={onToggleHistory}
          className={`text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 transition-colors ${
            historyOpen
              ? 'text-fog bg-surface border border-line font-medium'
              : 'text-mist hover:text-fog hover:bg-surface/60 border border-transparent'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>History</span>
        </button>

        <Link
          to="/dashboard"
          className="text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 text-mist hover:text-fog hover:bg-surface/60 border border-transparent transition-colors"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-line">
        <Link
          to="/"
          className="text-xs text-mist hover:text-fog py-1.5 px-2 flex items-center gap-2 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Overview</span>
        </Link>
      </div>
    </nav>
  );
}
