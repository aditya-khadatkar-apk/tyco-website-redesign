import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Company Profile', path: '/company-profile' },
    { name: 'Products', path: '/products' },
    { name: 'Clients', path: '/clients' },
    { name: 'Contact Us', path: '/contact-us' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white dark:bg-industrial-900 border-b border-industrial-200 dark:border-industrial-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-heading font-bold text-industrial-900 dark:text-white tracking-tight">
              TYCO <span className="text-primary-600">INDIA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-industrial-600 dark:text-industrial-300 hover:text-primary-600 dark:hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="border-l border-industrial-200 dark:border-industrial-700 pl-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-industrial-600 hover:text-industrial-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-industrial-900 border-b border-industrial-200 dark:border-industrial-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-industrial-600 dark:text-industrial-300 hover:text-primary-600 dark:hover:text-primary-500 hover:bg-industrial-100 dark:hover:bg-industrial-800"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
