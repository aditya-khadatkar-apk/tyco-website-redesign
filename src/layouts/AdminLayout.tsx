import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, FileText, Box, Settings, Users as UsersIcon, Lock } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function AdminLayout() {
  const { signOut, user, role, firstName, lastName } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Pages CMS', path: '/admin/pages', icon: FileText, roles: ['super-admin', 'admin'] },
    { name: 'Products', path: '/admin/products', icon: Box, roles: ['super-admin', 'admin', 'user'] },
    { name: 'Users', path: '/admin/users', icon: UsersIcon, roles: ['super-admin', 'admin'] },
    { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['super-admin', 'admin', 'user'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(role || ''));

  return (
    <div className="min-h-screen bg-industrial-100 dark:bg-industrial-900 flex flex-col md:flex-row font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-industrial-900 dark:bg-black text-white flex flex-col border-r border-industrial-800 transition-colors duration-300">
        <div className="p-6 flex items-center justify-center border-b border-industrial-800">
          <Link to="/" className="text-xl font-heading font-bold tracking-tight text-white hover:text-primary-500 transition-colors">
            TYCO <span className="text-primary-500">ADMIN</span>
          </Link>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                      : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-2">
            <Link 
              to="/admin/settings" 
              className="flex items-center px-4 py-2 text-xs font-semibold text-industrial-500 uppercase tracking-wider hover:text-primary-400 transition-colors"
            >
              <Lock className="h-3.5 w-3.5 mr-2" />
              Security Settings
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-industrial-900 border-b border-industrial-200 dark:border-industrial-800 flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <div className="flex items-center">
            <span className="text-sm font-medium text-industrial-500 dark:text-industrial-400 capitalize">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center pr-6 border-r border-industrial-200 dark:border-industrial-800">
              <span className="text-xs font-medium text-industrial-400 mr-3">Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-industrial-900 dark:text-white truncate max-w-[200px]">
                  {firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split('@')[0]}
                </p>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] text-industrial-500 dark:text-industrial-400 truncate max-w-[150px]">
                    {user?.email}
                  </p>
                  <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider mt-0.5">
                    {role || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-2 text-industrial-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-industrial-50 dark:bg-industrial-950 transition-colors duration-300">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
