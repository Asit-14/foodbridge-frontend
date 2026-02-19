import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/endpoints';
import { getReliabilityBadge, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organizationName: user?.organizationName || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(form);
      toast.success('Profile updated');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const reliability = user.role === 'ngo' ? getReliabilityBadge(user.reliabilityScore || 50) : null;

  return (
    <div className="space-y-6 animate-fade-in-up max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information</p>
      </div>

      {/* Avatar & role card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 capitalize">
                {user.role}
              </span>
              {user.isVerified && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  Verified
                </span>
              )}
              {reliability && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${reliability.color}`}>
                  {reliability.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Account Details</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Full Name</label>
            {editing ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Email</label>
            <p className="text-sm text-gray-900 font-medium">{user.email}</p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Phone</label>
            {editing ? (
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{user.phone || 'Not set'}</p>
            )}
          </div>

          {(user.role === 'ngo' || user.role === 'donor') && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">Organization Name</label>
              {editing ? (
                <input
                  name="organizationName"
                  value={form.organizationName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{user.organizationName || 'Not set'}</p>
              )}
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Address</label>
            {editing ? (
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
              />
            ) : (
              <p className="text-sm text-gray-900 font-medium">{user.address || 'Not set'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account meta */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Account Info</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Joined:</span>{' '}
            <span className="text-gray-900">{formatDateTime(user.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>{' '}
            <span className={user.isActive ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {user.role === 'ngo' && (
            <>
              <div>
                <span className="text-gray-500">Reliability Score:</span>{' '}
                <span className="text-gray-900 font-medium">{user.reliabilityScore || 50}/100</span>
              </div>
              <div>
                <span className="text-gray-500">Verification:</span>{' '}
                <span className={user.isVerified ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                  {user.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
