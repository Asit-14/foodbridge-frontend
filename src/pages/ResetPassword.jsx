import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authService } from '../services/endpoints';
import Button from '../components/common/Button';
import { INPUT_CLASS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passwordValid = form.password.length >= 8;
  const passwordsMatch = form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, { password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-emerald-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <span className="text-6xl mb-6 block">🍃</span>
          <h1 className="text-4xl font-bold mb-4">FoodBridge</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Connecting surplus food with those who need it.
            Reduce waste. Feed communities. Make an impact.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-8">
        <div className="w-full max-w-md">
          {done ? (
            /* Success state */
            <div className="text-center">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password updated</h2>
              <p className="text-sm text-gray-600 mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
                <p className="text-gray-600 mt-1">
                  Choose a strong password for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={INPUT_CLASS}
                    placeholder="••••••••"
                    autoFocus
                  />
                  {form.password && !passwordValid && (
                    <p className="text-xs text-rose-500 mt-1">Must be at least 8 characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className={INPUT_CLASS}
                    placeholder="••••••••"
                  />
                  {form.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-rose-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={!passwordValid || !passwordsMatch}
                >
                  Reset Password
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Back to Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
