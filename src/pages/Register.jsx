import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/Loader';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    phone: '',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const user = await register(payload);
      toast.success(`Welcome, ${user.name}!`);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-primary-700 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <span className="text-6xl mb-6 block">🤝</span>
          <h1 className="text-4xl font-bold mb-4">Join FoodBridge</h1>
          <p className="text-lg text-white/80 leading-relaxed">
            Whether you have food to share or a community to feed, your participation
            makes a difference. Sign up in 30 seconds.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-gray-500 mt-1">Select your role to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Role selector ── */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'donor', label: 'Donor', icon: '🏪', desc: 'I have surplus food' },
                { value: 'ngo', label: 'NGO', icon: '🤲', desc: 'I distribute food' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: opt.value })}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    form.role === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="font-semibold text-sm mt-2">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" required value={form.name} onChange={set('name')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
              <input type="text" value={form.organizationName} onChange={set('organizationName')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                placeholder="Restaurant / NGO name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required value={form.email} onChange={set('email')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={set('phone')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                placeholder="+91 98765 43210" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" required value={form.password} onChange={set('password')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                  placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <input type="password" required value={form.confirmPassword} onChange={set('confirmPassword')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm"
                  placeholder="••••••••" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Spinner className="w-4 h-4" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
