import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lock, 
  Users as UsersIcon, 
  Settings as SettingsIcon, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  UserMinus, 
  UserCheck, 
  ShieldAlert,
  Mail,
  User,
  Save
} from 'lucide-react';
import ChangePasswordForm from '../../components/ChangePasswordForm';

type Tab = 'security' | 'access' | 'preferences';

interface Profile {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function Settings() {
  const { role, user: currentUser, session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('security');
  
  // Access Control State
  const [users, setUsers] = useState<Profile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Preferences State
  const [prefs, setPrefs] = useState({
    contact_enquiry_email: '',
    sender_email: '',
    sender_name: ''
  });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'access' && (role === 'admin' || role === 'super-admin')) {
      fetchUsers();
    } else if (activeTab === 'preferences' && role === 'super-admin') {
      fetchPrefs();
    }
  }, [activeTab, role]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      let query = supabase.from('profiles').select('*');
      
      if (role === 'admin') {
        query = query.eq('role', 'user');
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPrefs = async () => {
    setPrefsLoading(true);
    try {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;

      const prefsMap = Object.fromEntries(data?.map(s => [s.key, s.value]) || []);
      setPrefs({
        contact_enquiry_email: prefsMap.contact_enquiry_email || '',
        sender_email: prefsMap.sender_email || '',
        sender_name: prefsMap.sender_name || ''
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setPrefsLoading(false);
    }
  };

  const handleToggleStatus = async (targetUser: Profile) => {
    if (currentUser?.id === targetUser.id) {
      alert("You cannot suspend your own account.");
      return;
    }

    const action = targetUser.is_active ? 'suspend' : 'reactivate';
    const confirmMsg = action === 'suspend' 
      ? `Are you sure you want to suspend ${targetUser.email}? They will be immediately signed out and blocked from logging in.`
      : `Reactivate account for ${targetUser.email}?`;

    if (!confirm(confirmMsg)) return;

    setActionLoading(targetUser.id);
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Authentication session expired. Please log out and back in.');
      }

      const { error } = await supabase.functions.invoke('revoke-session', {
        body: { userId: targetUser.id, action },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => u.id === targetUser.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSaving(true);
    setPrefsMessage(null);

    try {
      const updates = Object.entries(prefs).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('settings').upsert(updates);
      if (error) throw error;

      setPrefsMessage({ type: 'success', text: 'Settings saved successfully. Email changes will take effect immediately.' });
    } catch (err: any) {
      setPrefsMessage({ type: 'error', text: err.message || 'Failed to save settings' });
    } finally {
      setPrefsSaving(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'security', name: 'Account Security', icon: Lock, roles: ['user', 'admin', 'super-admin'] },
    { id: 'access', name: 'Access Control', icon: UsersIcon, roles: ['admin', 'super-admin'] },
    { id: 'preferences', name: 'Portal Preferences', icon: SettingsIcon, roles: ['super-admin'] },
  ].filter(t => t.roles.includes(role || ''));

  return (
    <div className="pb-12">
      <Helmet>
        <title>Settings - Tyco India Admin</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-industrial-900 dark:text-white flex items-center">
          <SettingsIcon className="mr-3 h-8 w-8 text-primary-600" />
          Settings
        </h1>
        <p className="text-industrial-600 dark:text-industrial-400 mt-2">Manage your account security and portal configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-industrial-900 rounded-xl shadow-sm border border-industrial-200 dark:border-industrial-800 overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center px-4 py-4 text-sm font-medium transition-colors border-l-4 ${
                      activeTab === tab.id
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-600 text-primary-700 dark:text-primary-400'
                        : 'border-transparent text-industrial-600 dark:text-industrial-400 hover:bg-industrial-50 dark:hover:bg-industrial-800 hover:text-industrial-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-industrial-900 rounded-xl shadow-sm border border-industrial-200 dark:border-industrial-800 p-6 lg:p-8">
            
            {/* Account Security */}
            {activeTab === 'security' && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-industrial-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-industrial-500 dark:text-industrial-400 mt-1">Update your login credentials regularly to stay secure.</p>
                </div>
                <ChangePasswordForm />
              </div>
            )}

            {/* Access Control */}
            {activeTab === 'access' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-industrial-900 dark:text-white">User Access Control</h2>
                    <p className="text-sm text-industrial-500 dark:text-industrial-400">Suspend or reactivate accounts based on your administrative scope.</p>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-industrial-300 dark:border-industrial-700 rounded-lg bg-industrial-50 dark:bg-industrial-800 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white transition-all w-full sm:w-64"
                    />
                    <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                  </div>
                </div>

                {usersLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
                    <p className="text-industrial-500">Loading user directory...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-industrial-100 dark:border-industrial-800 text-industrial-500 dark:text-industrial-400 font-semibold uppercase text-xs">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-industrial-100 dark:divide-industrial-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-industrial-50 dark:hover:bg-industrial-800/50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-industrial-200 dark:bg-industrial-700 flex items-center justify-center text-industrial-600 dark:text-industrial-300 mr-3">
                                  <User className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-industrial-900 dark:text-white">{u.email}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'super-admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                u.role === 'admin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                u.is_active 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                {u.is_active ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={actionLoading === u.id || currentUser?.id === u.id}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  u.is_active
                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                } disabled:opacity-30`}
                              >
                                {actionLoading === u.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  u.is_active ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />
                                )}
                                {u.is_active ? 'Suspend' : 'Reactivate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Portal Preferences */}
            {activeTab === 'preferences' && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-industrial-900 dark:text-white">Portal Configuration</h2>
                  <p className="text-sm text-industrial-500 dark:text-industrial-400">Global settings for outbound communications and enquiries.</p>
                </div>

                {prefsLoading ? (
                  <div className="py-20 flex justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                  </div>
                ) : (
                  <form onSubmit={handleSavePrefs} className="space-y-8">
                    {prefsMessage && (
                      <div className={`p-4 rounded-lg flex items-start text-sm ${
                        prefsMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {prefsMessage.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
                        <span>{prefsMessage.text}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-industrial-700 dark:text-industrial-300">Enquiry Notification Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                          <input
                            type="email"
                            required
                            value={prefs.contact_enquiry_email}
                            onChange={(e) => setPrefs({ ...prefs, contact_enquiry_email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-industrial-50 dark:bg-industrial-800 border border-industrial-200 dark:border-industrial-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white text-sm"
                            placeholder="info@tyco-india.com"
                          />
                        </div>
                        <p className="text-[11px] text-industrial-500">Form submissions from the public site go here.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-industrial-700 dark:text-industrial-300">Transactional From Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                          <input
                            type="email"
                            required
                            value={prefs.sender_email}
                            onChange={(e) => setPrefs({ ...prefs, sender_email: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-industrial-50 dark:bg-industrial-800 border border-industrial-200 dark:border-industrial-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white text-sm"
                            placeholder="admin@tyco-india.com"
                          />
                        </div>
                        <p className="text-[11px] text-industrial-500">Must be a verified sender in SendGrid.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-industrial-700 dark:text-industrial-300">Transactional Sender Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                          <input
                            type="text"
                            required
                            value={prefs.sender_name}
                            onChange={(e) => setPrefs({ ...prefs, sender_name: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-industrial-50 dark:bg-industrial-800 border border-industrial-200 dark:border-industrial-700 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:text-white text-sm"
                            placeholder="Tyco India Admin"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
                        <p className="font-bold">Important Note on Email Settings:</p>
                        <p>Changing the "Transactional From Email" requires that the new address is already verified as a Single Sender or Domain in your SendGrid dashboard. If not verified, emails will fail to send.</p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={prefsSaving}
                        className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-70"
                      >
                        {prefsSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {prefsSaving ? 'Saving Changes...' : 'Save Preferences'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
