import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { supaCache } from '../../lib/supaCache';
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
  Save,
  Palette,
  Eye,
  Check,
  Database
} from 'lucide-react';
import ChangePasswordForm from '../../components/ChangePasswordForm';
import { useSiteTheme as _useSiteTheme, useAdminSiteTheme, type SiteThemeSlug } from '../../contexts/SiteThemeContext';

type Tab = 'security' | 'access' | 'preferences' | 'appearance' | 'cache';

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
  const { siteTheme, previewTheme, startPreview, cancelPreview, applyTheme, saving: themeSaving, loaded: themeLoaded } = useAdminSiteTheme();
  const [pendingTheme, setPendingTheme] = useState<SiteThemeSlug | null>(null);
  const [themeSuccess, setThemeSuccess] = useState(false);

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

      // Use native fetch to bypass the automatic Authorization header added by supabase.functions.invoke
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/revoke-session`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'x-caller-token': token
        },
        body: JSON.stringify({ userId: targetUser.id, action })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }
      
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
    { id: 'security',    name: 'Account Security',   icon: Lock,         roles: ['user', 'admin', 'super-admin'] },
    { id: 'access',      name: 'Access Control',      icon: UsersIcon,    roles: ['admin', 'super-admin'] },
    { id: 'preferences', name: 'Portal Preferences',  icon: SettingsIcon, roles: ['super-admin'] },
    { id: 'appearance',  name: 'Appearance',           icon: Palette,      roles: ['super-admin'] },
    { id: 'cache',       name: 'Cache Performance',    icon: Database,     roles: ['super-admin'] },
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
            {/* Appearance — super-admin only */}
            {activeTab === 'appearance' && (
              <AppearanceTab
                siteTheme={siteTheme}
                previewTheme={previewTheme}
                pendingTheme={pendingTheme}
                setPendingTheme={setPendingTheme}
                startPreview={startPreview}
                cancelPreview={cancelPreview}
                applyTheme={applyTheme}
                saving={themeSaving}
                loaded={themeLoaded}
                themeSuccess={themeSuccess}
                setThemeSuccess={setThemeSuccess}
              />
            )}
            {/* Cache Performance — super-admin only */}
            {activeTab === 'cache' && (
              <CacheTab />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Appearance Tab Component
───────────────────────────────────────────────────────────── */
const THEMES: Array<{
  slug: SiteThemeSlug;
  name: string;
  description: string;
  bg: string;
  surface: string;
  accent: string;
  text: string;
  textMuted: string;
  badge?: string;
}> = [
  {
    slug:        'default',
    name:        'Default',
    description: 'The original design — dark slate background with a vibrant orange accent. A bold, professional look.',
    bg:          '#0f172a',
    surface:     '#1e293b',
    accent:      '#ea580c',
    text:        '#f1f5f9',
    textMuted:   '#94a3b8',
  },
  {
    slug:        'forge',
    name:        'Industrial Forge 🔥',
    description: 'Deep navy dark mode with electric orange accents and glassmorphism. Premium heavy-industry brand feel.',
    bg:          '#0a0f1e',
    surface:     '#1a1f2e',
    accent:      '#f97316',
    text:        '#e2e8f0',
    textMuted:   '#64748b',
    badge:       'Dark',
  },
  {
    slug:        'clean-pro',
    name:        'Clean Pro ⚡',
    description: 'Clean white base with the authentic Tyco brand orange (#EA7600). Modern, minimal, and professional.',
    bg:          '#f9fafb',
    surface:     '#ffffff',
    accent:      '#EA7600',
    text:        '#111827',
    textMuted:   '#6b7280',
    badge:       'Light',
  },
];

function ThemeCard({
  theme,
  isActive,
  isPreviewing,
  isPending,
  onPreview,
  onSelect,
}: {
  theme: typeof THEMES[0];
  isActive: boolean;
  isPreviewing: boolean;
  isPending: boolean;
  onPreview: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
        isPending
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : isActive
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-industrial-200 dark:border-industrial-700 hover:border-industrial-400'
      }`}
      onClick={onSelect}
    >
      {/* Mini preview */}
      <div
        className="h-36 p-3 flex flex-col gap-2"
        style={{ backgroundColor: theme.bg }}
      >
        {/* Mini navbar */}
        <div
          className="flex items-center justify-between px-2 py-1 rounded-lg"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.accent}22` }}
        >
          <div className="flex gap-1">
            <span className="text-[9px] font-bold" style={{ color: theme.text }}>TYCO</span>
            <span className="text-[9px] font-bold" style={{ color: theme.accent }}>INDIA</span>
          </div>
          <div
            className="text-[8px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
          >
            CTA
          </div>
        </div>
        {/* Mini hero */}
        <div
          className="flex-1 rounded-lg flex flex-col justify-center px-3"
          style={{ backgroundColor: theme.surface, border: `1px solid ${theme.accent}18` }}
        >
          <div className="h-2 w-16 rounded mb-1" style={{ backgroundColor: theme.text, opacity: 0.9 }} />
          <div className="h-1.5 w-24 rounded mb-2" style={{ backgroundColor: theme.textMuted, opacity: 0.6 }} />
          <div
            className="h-4 w-12 rounded text-[7px] flex items-center justify-center font-bold"
            style={{ backgroundColor: theme.accent, color: '#fff' }}
          >
            EXPLORE
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="p-3 bg-white dark:bg-industrial-900">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-industrial-900 dark:text-white truncate">
                {theme.name}
              </span>
              {theme.badge && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${theme.accent}18`,
                    color: theme.accent,
                  }}
                >
                  {theme.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-industrial-500 dark:text-industrial-400 leading-relaxed line-clamp-2">
              {theme.description}
            </p>
          </div>
          {isActive && !isPending && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" /> Active
            </span>
          )}
          {isPending && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              <Eye className="w-3 h-3" /> Selected
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="mt-2 w-full text-xs font-medium py-1.5 rounded-lg border transition-colors"
          style={{
            borderColor: theme.accent,
            color: theme.accent,
            backgroundColor: isPreviewing ? `${theme.accent}12` : 'transparent',
          }}
        >
          {isPreviewing ? 'Previewing...' : 'Live Preview'}
        </button>
      </div>
    </div>
  );
}

function AppearanceTab({
  siteTheme,
  previewTheme,
  pendingTheme,
  setPendingTheme,
  startPreview,
  cancelPreview,
  applyTheme,
  saving,
  loaded,
  themeSuccess,
  setThemeSuccess,
}: {
  siteTheme: SiteThemeSlug;
  previewTheme: SiteThemeSlug | null;
  pendingTheme: SiteThemeSlug | null;
  setPendingTheme: (s: SiteThemeSlug | null) => void;
  startPreview: (s: SiteThemeSlug) => void;
  cancelPreview: () => void;
  applyTheme: (s: SiteThemeSlug) => Promise<void>;
  saving: boolean;
  loaded: boolean;
  themeSuccess: boolean;
  setThemeSuccess: (v: boolean) => void;
}) {
  const handleSelect = (slug: SiteThemeSlug) => {
    setPendingTheme(slug === pendingTheme ? null : slug);
  };

  const handlePreview = (slug: SiteThemeSlug) => {
    if (previewTheme === slug) {
      cancelPreview();
    } else {
      startPreview(slug);
    }
  };

  const handleApply = async () => {
    if (!pendingTheme) return;
    await applyTheme(pendingTheme);
    setPendingTheme(null);
    setThemeSuccess(true);
    setTimeout(() => setThemeSuccess(false), 3000);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-industrial-900 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary-600" />
          Public Site Appearance
        </h2>
        <p className="text-sm text-industrial-500 dark:text-industrial-400 mt-1">
          Choose a theme for the public-facing website. The admin portal is unaffected.
          Use <strong>Live Preview</strong> to preview a theme on the public site before committing.
        </p>
      </div>

      {!loaded && (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      )}

      {loaded && (
        <>
      {themeSuccess && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          Theme applied successfully! Visit the public site to see the change.
        </div>
      )}

      {previewTheme && (
        <div className="mb-4 flex items-center justify-between gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <span className="text-sm text-amber-800 dark:text-amber-400">
            <Eye className="inline w-4 h-4 mr-1 -mt-0.5" />
            <strong>Live Preview:</strong> You're previewing "{THEMES.find(t => t.slug === previewTheme)?.name}". Open the public site in another tab to see it.
          </span>
          <button
            onClick={cancelPreview}
            className="flex-shrink-0 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Stop Preview
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {THEMES.map((theme) => (
          <ThemeCard
            key={theme.slug}
            theme={theme}
            isActive={siteTheme === theme.slug}
            isPreviewing={previewTheme === theme.slug}
            isPending={pendingTheme === theme.slug}
            onPreview={() => handlePreview(theme.slug)}
            onSelect={() => handleSelect(theme.slug)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-industrial-100 dark:border-industrial-800">
        <div className="text-sm text-industrial-500 dark:text-industrial-400">
          {pendingTheme
            ? `Click "Apply Theme" to make ‘${THEMES.find(t => t.slug === pendingTheme)?.name}’ the live public theme.`
            : 'Select a theme card above to apply it.'}
        </div>
        <div className="flex gap-3">
          {pendingTheme && (
            <button
              onClick={() => { setPendingTheme(null); cancelPreview(); }}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-industrial-300 dark:border-industrial-700 text-industrial-600 dark:text-industrial-400 hover:bg-industrial-50 dark:hover:bg-industrial-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={!pendingTheme || saving || pendingTheme === siteTheme}
            className="inline-flex items-center px-5 py-2 text-sm font-bold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            {saving ? 'Applying...' : 'Apply Theme'}
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Cache Performance Tab Component (super-admin only)
───────────────────────────────────────────────────────────── */
function CacheTab() {
  const [ttlConfig, setTtlConfig] = useState({ cms: 15, products: 10, machines: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'cache_ttl_config')
          .maybeSingle();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          setTtlConfig({
            cms: parsed.cms || 15,
            products: parsed.products || 10,
            machines: parsed.machines || 5,
          });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('settings').upsert({
        key: 'cache_ttl_config',
        value: ttlConfig,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update the running cache instance with new TTLs
      supaCache.updateTTLs({
        cms: ttlConfig.cms * 60 * 1000,
        products: ttlConfig.products * 60 * 1000,
        machines: ttlConfig.machines * 60 * 1000,
      });

      setMessage({ type: 'success', text: 'Cache TTL settings saved. Changes take effect immediately for new requests.' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save cache settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    supaCache.invalidatePrefix('cms:');
    supaCache.invalidatePrefix('products:');
    supaCache.invalidatePrefix('machines:');
    try {
      // Clear all tyco cache keys from sessionStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith('tyco:cache:')) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch { /* no-op */ }
    setMessage({ type: 'success', text: 'All cached data has been cleared. Pages will fetch fresh data on next visit.' });
    setTimeout(() => setMessage(null), 4000);
  };

  const sources = [
    { key: 'cms' as const, label: 'CMS Pages', desc: 'Home, Company Profile, Clients, Contact Us', icon: '📄' },
    { key: 'products' as const, label: 'Products', desc: 'Product catalog list and detail pages', icon: '📦' },
    { key: 'machines' as const, label: 'Machine Data', desc: 'Client machine data and map aggregates', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-industrial-900 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-600" />
          Cache Performance
        </h2>
        <p className="text-sm text-industrial-500 dark:text-industrial-400 mt-1">
          Configure how long public page data is cached before refreshing from the database.
          Lower values mean fresher data but more database queries.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${
          message.type === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
            : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {sources.map(({ key, label, desc, icon }) => (
          <div key={key} className="p-5 bg-industrial-50 dark:bg-industrial-800 rounded-xl border border-industrial-200 dark:border-industrial-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{icon}</span>
                  <h4 className="font-bold text-industrial-900 dark:text-white">{label}</h4>
                </div>
                <p className="text-xs text-industrial-500 dark:text-industrial-400">{desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={ttlConfig[key]}
                  onChange={e => setTtlConfig(prev => ({ ...prev, [key]: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)) }))}
                  className="w-20 px-3 py-2 text-center bg-white dark:bg-industrial-900 border border-industrial-300 dark:border-industrial-600 rounded-lg text-sm font-bold text-industrial-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
                <span className="text-sm text-industrial-500 dark:text-industrial-400 font-medium">min</span>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
            <p className="font-bold">How Caching Works:</p>
            <p>Data is cached in the browser. When an admin makes changes, Supabase Realtime automatically invalidates the relevant cache, so visitors see updates within seconds regardless of TTL.</p>
            <p>TTL primarily affects how often data is re-fetched during <strong>normal browsing</strong> when no admin changes are occurring.</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-industrial-100 dark:border-industrial-800">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Clear All Cache Now
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            {saving ? 'Saving...' : 'Save TTL Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
