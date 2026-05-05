import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user, role } = useAuth();

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard - Tyco India</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-industrial-900">
          Welcome back, <span className="text-primary-600">{user?.email?.split('@')[0] || 'Admin'}</span>
        </h1>
        <p className="text-industrial-600 mt-2">
          Manage your website content, product catalog, and settings from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(role === 'super-admin' || role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
            <h3 className="text-lg font-semibold text-industrial-900 mb-2">Pages CMS</h3>
            <p className="text-industrial-600 text-sm mb-4">Edit content for Home, Company Profile, and Contact Us pages.</p>
            <a href="/admin/pages" className="text-primary-600 font-medium hover:text-primary-700 text-sm">Manage Pages &rarr;</a>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
          <h3 className="text-lg font-semibold text-industrial-900 mb-2">Product Catalog</h3>
          <p className="text-industrial-600 text-sm mb-4">Add, edit, or remove products and specifications.</p>
          <a href="/admin/products" className="text-primary-600 font-medium hover:text-primary-700 text-sm">Manage Products &rarr;</a>
        </div>

        {(role === 'super-admin' || role === 'admin') && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
            <h3 className="text-lg font-semibold text-industrial-900 mb-2">User Management</h3>
            <p className="text-industrial-600 text-sm mb-4">Invite and manage {role === 'super-admin' ? 'administrators and users' : 'new users'}.</p>
            <a href="/admin/users" className="text-primary-600 font-medium hover:text-primary-700 text-sm">Manage Users &rarr;</a>
          </div>
        )}

        {role === 'super-admin' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-industrial-200">
            <h3 className="text-lg font-semibold text-industrial-900 mb-2">Global Settings</h3>
            <p className="text-industrial-600 text-sm mb-4">Update contact information and social media links.</p>
            <a href="/admin/settings" className="text-primary-600 font-medium hover:text-primary-700 text-sm">Manage Settings &rarr;</a>
          </div>
        )}
      </div>
    </div>
  );
}
