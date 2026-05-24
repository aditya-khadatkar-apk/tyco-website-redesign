import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.functions.invoke('forgot-password', {
        body: { email },
      });

      if (error) {
        // Handle specific edge function errors
        let errorMsg = 'Failed to send reset link. Please try again.';
        try {
          // If error is an object with a message or text, use it
          if (typeof error === 'object' && error !== null) {
            const errorData = await error.json?.() || error;
            errorMsg = errorData.error || errorData.message || errorMsg;
          }
        } catch (e) {
          // Fallback to basic error string
          errorMsg = error.message || errorMsg;
        }
        throw new Error(errorMsg);
      }

      setMessage({ 
        type: 'success', 
        text: 'If an account exists with this email, you will receive a password reset link shortly.' 
      });
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let displayMsg = 'An error occurred. Please try again.';
      
      // Handle Supabase Function Errors specifically
      // err.context.status is 4xx or 5xx
      const status = err.context?.status || err.status;
      
      if (status >= 400 && status < 500) {
        // Client errors (invalid email, etc)
        displayMsg = err.message || 'Invalid request. Please check your email and try again.';
      } else if (status >= 500) {
        // Server errors
        displayMsg = 'The mail server is currently unavailable. Please contact support.';
      } else if (err.message) {
        displayMsg = err.message;
      }
      
      setMessage({ type: 'error', text: displayMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-industrial-100 flex items-center justify-center p-4">
      <Helmet>
        <title>Forgot Password - Tyco India</title>
      </Helmet>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-industrial-200 overflow-hidden">
          <div className="bg-industrial-900 p-8 text-center">
            <h1 className="text-2xl font-heading font-bold text-white">Forgot Password</h1>
            <p className="text-industrial-400 text-sm mt-2">
              Enter your email address and we'll send you a link to reset your password.
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
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-industrial-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-industrial-300 text-sm"
                    placeholder="admin@tyco-india.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending link...</>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <Link
              to="/admin/login"
              className="mt-8 flex items-center justify-center text-sm text-industrial-500 hover:text-industrial-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
