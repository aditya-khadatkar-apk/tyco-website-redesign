import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { UserPlus, Loader2, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Profile {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export default function Users() {
  const { role } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      let query = supabase.from('profiles').select('*');
      
      // If admin, only show users with the 'user' role
      if (role === 'admin') {
        query = query.eq('role', 'user');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setMessage(null);

    try {
      // Call our custom edge function
      const { error } = await supabase.functions.invoke('create-user', {
        body: { email, role: newRole, firstName, lastName },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create user');
      }

      setMessage({ type: 'success', text: `User ${firstName} ${lastName} created successfully. An email with their temporary password has been sent.` });
      setEmail('');
      setFirstName('');
      setLastName('');
      setNewRole('user');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setInviting(false);
    }
  };

  if (role === 'user') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-industrial-900 mb-2">Access Denied</h2>
        <p className="text-industrial-600">You do not have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>User Management - Admin Portal</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-industrial-900 flex items-center">
          <UserPlus className="mr-3 h-8 w-8 text-primary-600" />
          User Management
        </h1>
        <p className="text-industrial-600 mt-2">Invite new administrators and users to the portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-industrial-900">Add New User</h2>
            
            {message && (
              <div className={`mb-6 p-4 rounded-md flex items-start text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-industrial-700 mb-1">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Aditya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-700 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="Khadatkar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="admin@tyco-india.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                >
                  <option value="user">User</option>
                  {role === 'super-admin' && (
                    <>
                      <option value="admin">Admin</option>
                      <option value="super-admin">Super Admin</option>
                    </>
                  )}
                </select>
                <p className="text-xs text-industrial-500 mt-1">
                  {role === 'super-admin' 
                    ? 'Super-admins have full access. Admins can edit content. Users have basic access.'
                    : 'Invite new users with basic product management access.'}
                </p>
              </div>
              <button 
                type="submit" 
                disabled={inviting}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white py-2 rounded-md font-semibold transition-colors flex justify-center items-center disabled:opacity-70"
              >
                {inviting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                {inviting ? 'Creating User...' : 'Create & Email Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-industrial-200 bg-industrial-50">
              <h2 className="text-lg font-semibold text-industrial-900">Current Users</h2>
            </div>
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-industrial-600">
                  <thead className="bg-industrial-50 text-xs uppercase text-industrial-500 font-semibold border-b border-industrial-200">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-industrial-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-industrial-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-industrial-900">{u.first_name} {u.last_name}</span>
                            <span className="text-xs text-industrial-500">{u.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            u.role === 'super-admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            u.role === 'admin' ? 'bg-primary-100 text-primary-800 border-primary-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-industrial-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
