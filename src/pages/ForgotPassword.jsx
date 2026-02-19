import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/endpoints';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {sent ? (
            /* Success state */
            <div className="text-center">
              <span className="text-5xl block mb-4">📧</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 mb-6">
                We sent a password reset link to <strong>{email}</strong>.
                The link expires in 1 hour.
              </p>
              <p className="text-xs text-gray-400 mb-8">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setSent(false)}
                >
                  Try a different email
                </Button>
                <Link to="/login" className="block">
                  <Button variant="ghost" size="md" fullWidth>
                    Back to Sign in
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Forgot password?</h2>
                <p className="text-gray-500 mt-1">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                >
                  Send Reset Link
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
