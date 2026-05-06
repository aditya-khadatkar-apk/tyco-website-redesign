import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ChangePassword() {
  const { user, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Update password in auth
      const { error: authError } = await supabase.auth.updateUser({
        password: password
      });

      if (authError) throw authError;

      // 2. Update must_change_password flag in profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setMessage({ type: 'success', text: 'Password updated successfully! Redirecting...' });
      
      // 3. Refresh profile status in context
      await refreshProfile();

      // 4. Redirect after a short delay
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-100 flex items-center justify-center p-4">
      <Helmet>
        <title>Update Password - Tyco India</title>
      </Helmet>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-industrial-200 overflow-hidden">
          <div className="bg-industrial-900 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 text-primary-500 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Update Password</h1>
            <p className="text-industrial-400 text-sm mt-2">
              For security reasons, you must change your temporary password before continuing.
            </p>
          </div>

          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-lg flex items-start text-sm ${
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-industrial-300 text-sm"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-industrial-300 text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>

            <button
              onClick={signOut}
              className="w-full mt-6 text-sm text-industrial-500 hover:text-industrial-700 transition-colors"
            >
              Cancel and Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
