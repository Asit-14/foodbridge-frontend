import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Loader';
import { INPUT_CLASS } from '../utils/constants';
import toast from 'react-hot-toast';

/**
 * Two-factor authentication verification page.
 * Displayed after login when the user has 2FA enabled.
 * Reads twoFactorToken from AuthContext state.
 */
export default function Verify2FA() {
  const { verify2FA, is2FARequired, twoFactorToken } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('totp'); // 'totp' | 'backup'
  const [totpCode, setTotpCode] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Redirect to login if user didn't come through the 2FA flow
  useEffect(() => {
    if (!is2FARequired || !twoFactorToken) {
      navigate('/login', { replace: true });
    }
  }, [is2FARequired, twoFactorToken, navigate]);

  // Focus input on mode change
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  if (!is2FARequired || !twoFactorToken) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const payload = { twoFactorToken };
    if (mode === 'totp') {
      if (totpCode.length !== 6) {
        toast.error('Enter a 6-digit code');
        return;
      }
      payload.totpCode = totpCode;
    } else {
      if (!backupCode.trim()) {
        toast.error('Enter a backup code');
        return;
      }
      payload.backupCode = backupCode.trim().toUpperCase();
    }

    setLoading(true);
    try {
      const user = await verify2FA(payload);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Verification failed';
      toast.error(message);

      // If token expired, redirect back to login
      if (err.response?.status === 401 && message.toLowerCase().includes('expired')) {
        navigate('/login', { replace: true });
      }
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

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-5 py-8 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="text-5xl block mb-4">🔐</span>
            <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
            <p className="text-gray-600 mt-1">
              {mode === 'totp'
                ? 'Enter the 6-digit code from your authenticator app'
                : 'Enter one of your backup codes'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'totp' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Verification Code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={totpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setTotpCode(val);
                  }}
                  className={`${INPUT_CLASS} text-center text-2xl tracking-[0.5em] font-mono`}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Backup Code
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  required
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className={`${INPUT_CLASS} font-mono tracking-wider`}
                  placeholder="0123456789ABCDEF"
                  autoComplete="off"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Spinner className="w-4 h-4" />}
              Verify
            </button>
          </form>

          {/* Toggle between TOTP and backup code */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'totp' ? 'backup' : 'totp');
                setTotpCode('');
                setBackupCode('');
              }}
              className="text-sm text-primary-600 font-medium hover:underline"
            >
              {mode === 'totp' ? 'Use a backup code instead' : 'Use authenticator app instead'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            Lost access to your authenticator?{' '}
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="text-primary-600 hover:underline"
            >
              Start over
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
