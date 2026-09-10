import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, BarChart2, ArrowLeft, LogOut } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { logout } from '../../services/authService';

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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-48 shrink-0 border-r border-line flex flex-col p-4 gap-2 justify-between select-none bg-void">
      <div className="flex flex-col gap-2">
        <Link
          to="/"
          className="font-display text-base mb-6 font-semibold tracking-wider text-fog hover:text-gold transition-colors flex items-center"
          title="Return to Landing Page"
        >
          <img src={logoImg} alt="Cerberus Logo" className="h-[22px] w-auto object-contain shrink-0" />
          <span className="ml-0.5 translate-y-[2px]">ERBERUS</span>
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

        <button
          onClick={handleLogout}
          className="text-xs text-mist hover:text-red-400 py-1.5 px-2 flex items-center gap-2 transition-colors font-mono w-full text-left"
          title="Sign out of Cerberus"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </nav>
  );
}
