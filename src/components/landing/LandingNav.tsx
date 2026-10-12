import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, BarChart2, GitCompare, MessageSquare, Layers } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { isAuthenticated, logout } from '../../services/authService';

export const LandingNav = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="w-full border-b border-line/60 bg-void/90 sticky top-0 z-40 backdrop-blur-md">
      <nav className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-16 flex justify-between items-center py-3.5 sm:py-5">
        <Link to="/" onClick={closeMenu} className="flex items-center group shrink-0">
          <img
            src={logoImg}
            alt="Cerberus Logo"
            className="h-[26px] sm:h-[30px] w-auto object-contain shrink-0"
          />
          <span className="font-display text-base sm:text-lg tracking-wider text-fog group-hover:text-gold transition-colors font-semibold ml-0.5 sm:ml-1 translate-y-[2px] sm:translate-y-[3px]">
            ERBERUS
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-sm text-mist font-body">
          <a href="#how-it-works" className="hover:text-fog transition-colors">
            How it works
          </a>
          <a href="#example" className="hover:text-fog transition-colors">
            Example
          </a>
          <a href="#architecture" className="hover:text-fog transition-colors">
            Architecture
          </a>
          <Link to="/dashboard" className="hover:text-fog transition-colors">
            Dashboard
          </Link>
          <Link to="/compare" className="hover:text-fog transition-colors">
            Compare
          </Link>
          {authed ? (
            <button
              onClick={handleLogout}
              className="text-xs text-mist hover:text-red-400 flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
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

        {/* Medium and Tablet Navigation */}
        <div className="hidden md:flex lg:hidden items-center gap-4 text-xs font-mono">
          <a href="#architecture" className="text-mist hover:text-fog transition-colors">
            Architecture
          </a>
          <Link to="/dashboard" className="text-mist hover:text-fog transition-colors">
            Dashboard
          </Link>
          <Link to="/compare" className="text-mist hover:text-fog transition-colors">
            Compare
          </Link>
          <Link
            to="/chat"
            className="px-3 py-1.5 rounded bg-gold text-void hover:bg-gold-hover transition-colors font-medium uppercase"
          >
            Launch Chat →
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-mist hover:text-fog hover:bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile controls (< 768px) */}
        <div className="flex md:hidden items-center gap-2.5">
          <Link
            to="/chat"
            className="text-[11px] uppercase tracking-wider font-mono font-medium px-3 py-1.5 rounded bg-gold text-void hover:bg-gold-hover transition-colors"
          >
            Chat →
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded text-mist hover:text-fog hover:bg-surface border border-line-light transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-gold" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-line bg-surface/98 backdrop-blur-xl px-5 py-6 shadow-2xl transition-all">
          <div className="flex flex-col gap-4 font-body text-sm">
            <a
              href="#how-it-works"
              onClick={closeMenu}
              className="flex items-center gap-2.5 py-2 text-mist hover:text-fog transition-colors"
            >
              <Layers className="w-4 h-4 text-gold" />
              <span>How it works</span>
            </a>
            <a
              href="#example"
              onClick={closeMenu}
              className="flex items-center gap-2.5 py-2 text-mist hover:text-fog transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-gold" />
              <span>Concrete Example</span>
            </a>
            <a
              href="#architecture"
              onClick={closeMenu}
              className="flex items-center gap-2.5 py-2 text-mist hover:text-fog transition-colors"
            >
              <Layers className="w-4 h-4 text-gold" />
              <span>Architecture</span>
            </a>
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="flex items-center gap-2.5 py-2 text-mist hover:text-fog transition-colors"
            >
              <BarChart2 className="w-4 h-4 text-gold" />
              <span>Telemetry Dashboard</span>
            </Link>
            <Link
              to="/compare"
              onClick={closeMenu}
              className="flex items-center gap-2.5 py-2 text-mist hover:text-fog transition-colors"
            >
              <GitCompare className="w-4 h-4 text-gold" />
              <span>Groq vs Cerebrus Compare</span>
            </Link>

            <div className="pt-4 mt-2 border-t border-line flex items-center justify-between">
              {authed ? (
                <button
                  onClick={handleLogout}
                  className="text-xs text-mist hover:text-red-400 flex items-center gap-1.5 transition-colors font-mono py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out of Cerberus</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-xs text-mist hover:text-fog transition-colors font-mono py-2"
                >
                  Sign In →
                </Link>
              )}
              <Link
                to="/chat"
                onClick={closeMenu}
                className="text-xs uppercase tracking-wider font-mono font-medium px-4 py-2 rounded bg-gold text-void hover:bg-gold-hover transition-colors"
              >
                Launch Chat Surface
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
