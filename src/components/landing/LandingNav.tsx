import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { isAuthenticated, logout } from '../../services/authService';

export const LandingNav = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full border-b border-line/60 bg-void/90 sticky top-0 z-40 backdrop-blur-none">
      <nav className="max-w-[1600px] w-full mx-auto px-6 sm:px-10 lg:px-16 flex justify-between items-center py-4 sm:py-5">
        <Link to="/" className="flex items-center group shrink-0">
          <img
            src={logoImg}
            alt="Cerberus Logo"
            className="h-[28px] sm:h-[30px] w-auto object-contain shrink-0"
          />
          <span className="font-display text-lg tracking-wider text-fog group-hover:text-gold transition-colors font-semibold ml-0.5 sm:ml-1 translate-y-[3px]">
            ERBERUS
          </span>
        </Link>

        <div className="flex items-center gap-6 md:gap-10 text-sm text-mist font-body">
          <a href="#how-it-works" className="hover:text-fog transition-colors hidden sm:inline-block">
            How it works
          </a>
          <a href="#example" className="hover:text-fog transition-colors hidden md:inline-block">
            Example
          </a>
          <a href="#architecture" className="hover:text-fog transition-colors">
            Architecture
          </a>
          <Link to="/dashboard" className="hover:text-fog transition-colors hidden sm:inline-block">
            Dashboard
          </Link>
          {authed ? (
            <button
              onClick={handleLogout}
              className="text-xs text-mist hover:text-red-400 flex items-center gap-1.5 transition-colors font-mono"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs text-mist hover:text-fog transition-colors font-mono"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/chat"
            className="text-xs uppercase tracking-wider font-mono font-medium px-4 py-2 rounded bg-gold text-void hover:bg-gold-hover transition-colors"
          >
            Launch Chat →
          </Link>
        </div>
      </nav>
    </header>
  );
};
