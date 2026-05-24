import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useSiteTheme } from '../contexts/SiteThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { siteTheme, previewTheme } = useSiteTheme();
  // Only show dark/light toggle for Default theme — Forge & Clean Pro have fixed palettes
  const effectiveTheme = previewTheme ?? siteTheme;
  const showToggle = effectiveTheme === 'default';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Company Profile', path: '/company-profile' },
    { name: 'Products', path: '/products' },
    { name: 'Clients', path: '/clients' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b transition-colors duration-300"
      style={{
        background: 'var(--st-nav-bg,   rgba(255,255,255,0.95))',
        borderColor: 'var(--st-nav-border, #e2e8f0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              className="text-2xl font-heading font-bold tracking-tight"
              style={{ color: 'var(--st-text, #0f172a)' }}
            >
              TYCO{' '}
              <span className="text-primary-500" style={{ color: 'var(--st-primary, #ea580c)' }}>INDIA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="px-3 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{
                    color: isActive
                      ? 'var(--st-primary, #ea580c)'
                      : 'var(--st-nav-text, #334155)',
                    backgroundColor: isActive
                      ? 'rgba(var(--st-primary-rgb, 234,88,12), 0.08)'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--st-primary, #ea580c)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'var(--st-nav-text, #334155)';
                    }
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
            {showToggle && (
              <div
                className="border-l pl-4 ml-2"
                style={{ borderColor: 'var(--st-border, #e2e8f0)' }}
              >
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            {showToggle && <ThemeToggle />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: 'var(--st-nav-text, #334155)' }}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div
          className="md:hidden border-b"
          style={{
            background: 'var(--st-nav-bg, rgba(255,255,255,0.95))',
            borderColor: 'var(--st-nav-border, #e2e8f0)',
          }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{
                    color: isActive ? 'var(--st-primary, #ea580c)' : 'var(--st-nav-text, #334155)',
                    backgroundColor: isActive
                      ? 'rgba(var(--st-primary-rgb, 234,88,12), 0.08)'
                      : 'transparent',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
