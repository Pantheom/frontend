import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, BarChart2, ArrowLeft, LogOut, GitCompare, X } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { logout } from '../../services/authService';

interface NavRailProps {
  onNewChat?: () => void;
  onToggleHistory?: () => void;
  historyOpen?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function NavRail({
  onNewChat,
  onToggleHistory,
  historyOpen,
  mobileOpen = false,
  onCloseMobile,
}: NavRailProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onCloseMobile?.();
  };

  const handleNewChatClick = () => {
    onNewChat?.();
    onCloseMobile?.();
  };

  const handleHistoryClick = () => {
    onToggleHistory?.();
    onCloseMobile?.();
  };

  const renderNavContent = (isMobile = false) => (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-5">
          <Link
            to="/"
            onClick={onCloseMobile}
            className="font-display text-base font-semibold tracking-wider text-fog hover:text-gold transition-colors flex items-center"
            title="Return to Landing Page"
          >
            <img src={logoImg} alt="Cerberus Logo" className="h-[22px] w-auto object-contain shrink-0" />
            <span className="ml-0.5 translate-y-[2px]">ERBERUS</span>
          </Link>

          {isMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 rounded text-mist hover:text-fog hover:bg-surface-elevated transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={handleNewChatClick}
          className="text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 text-fog hover:bg-surface border border-transparent hover:border-line-light transition-colors font-medium cursor-pointer"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>New chat</span>
        </button>

        <button
          onClick={handleHistoryClick}
          className={`text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 transition-colors cursor-pointer ${
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
          onClick={onCloseMobile}
          className="text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 text-mist hover:text-fog hover:bg-surface/60 border border-transparent transition-colors"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/compare"
          onClick={onCloseMobile}
          className="text-sm text-left py-2 px-2.5 rounded flex items-center gap-2 text-mist hover:text-fog hover:bg-surface/60 border border-transparent transition-colors"
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t border-line">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="text-xs text-mist hover:text-fog py-1.5 px-2 flex items-center gap-2 transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Overview</span>
        </Link>

        <button
          onClick={handleLogout}
          className="text-xs text-mist hover:text-red-400 py-1.5 px-2 flex items-center gap-2 transition-colors font-mono w-full text-left cursor-pointer"
          title="Sign out of Cerberus"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Nav Rail */}
      <nav className="hidden md:flex w-48 shrink-0 border-r border-line flex-col p-4 gap-2 justify-between select-none bg-void">
        {renderNavContent(false)}
      </nav>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-void/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <nav className="relative w-64 max-w-[85vw] bg-surface border-r border-line flex flex-col p-4 gap-2 justify-between select-none z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </nav>
        </div>
      )}
    </>
  );
}
