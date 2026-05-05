import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, FileText, Box, Settings, Users as UsersIcon } from 'lucide-react';

export default function AdminLayout() {
  const { signOut, user, role } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Pages CMS', path: '/admin/pages', icon: FileText, roles: ['super-admin', 'admin'] },
    { name: 'Products', path: '/admin/products', icon: Box, roles: ['super-admin', 'admin', 'user'] },
    { name: 'Users', path: '/admin/users', icon: UsersIcon, roles: ['super-admin', 'admin'] },
    { name: 'Settings', path: '/admin/settings', icon: Settings, roles: ['super-admin', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(role || ''));

  return (
    <div className="min-h-screen bg-industrial-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-industrial-900 text-white flex flex-col">
        <div className="p-6 flex items-center justify-center border-b border-industrial-800">
          <Link to="/" className="text-xl font-heading font-bold tracking-tight text-white hover:text-primary-500 transition-colors">
            TYCO <span className="text-primary-500">ADMIN</span>
          </Link>
        </div>
        
        <div className="p-4">
          <div className="mb-6 px-2 text-sm text-industrial-400">
            <p className="truncate">Logged in as:</p>
            <p className="font-medium text-white truncate">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-600/20 text-primary-400 text-xs rounded border border-primary-600/30">
              {role?.toUpperCase() || 'ADMIN'}
            </span>
          </div>

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
                      ? 'bg-primary-600 text-white' 
                      : 'text-industrial-300 hover:bg-industrial-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-industrial-800">
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-industrial-300 hover:text-white hover:bg-industrial-800 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
