import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services/endpoints';
import Button from '../components/common/Button';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message || 'Verification failed. The link may have expired.'
        );
      });
  }, [token]);

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
        <div className="w-full max-w-md text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
              <p className="text-gray-600 mt-2">Please wait a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-sm text-gray-600 mb-8">{message}</p>
              <Link to="/login">
                <Button variant="primary" size="lg" fullWidth>
                  Go to Sign In
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="text-5xl block mb-4">❌</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-sm text-gray-600 mb-8">{message}</p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="primary" size="lg" fullWidth>
                    Go to Sign In
                  </Button>
                </Link>
                <p className="text-sm text-gray-500">
                  You can request a new verification link from the login page.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
