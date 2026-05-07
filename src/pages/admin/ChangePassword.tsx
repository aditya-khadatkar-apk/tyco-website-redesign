import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck } from 'lucide-react';
import ChangePasswordForm from '../../components/ChangePasswordForm';

export default function ChangePassword() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-industrial-100 dark:bg-industrial-950 flex items-center justify-center p-4">
      <Helmet>
        <title>Update Password - Tyco India</title>
      </Helmet>

      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-industrial-900 rounded-2xl shadow-xl border border-industrial-200 dark:border-industrial-800 overflow-hidden">
          <div className="bg-industrial-900 dark:bg-black p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 text-primary-500 mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Update Password</h1>
            <p className="text-industrial-400 text-sm mt-2">
              For security reasons, you must change your temporary password before continuing.
            </p>
          </div>

          <div className="p-8">
            <ChangePasswordForm onSuccess={handleSuccess} showCancel={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
