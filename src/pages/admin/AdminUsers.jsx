import { useState, useEffect } from 'react';
import { adminService } from '../../services/endpoints';
import { CardSkeleton } from '../../components/common/Loader';
import { getReliabilityBadge, timeAgo, formatDateTime } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', active: '' });
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params = { page, limit };
    if (filter.role) params.role = filter.role;
    if (filter.active) params.active = filter.active;

    adminService.getUsers(params)
      .then(({ data }) => {
        setUsers(data.data.users);
        setTotal(data.total || 0);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, filter]);

  const handleToggleActive = async (userId, currentActive) => {
    try {
      const { data } = await adminService.updateUserStatus(userId, { isActive: !currentActive });
      setUsers((prev) => prev.map((u) => u._id === userId ? data.data.user : u));
      toast.success(`User ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleVerifyNGO = async (userId) => {
    try {
      const { data } = await adminService.updateUserStatus(userId, { isVerified: true });
      setUsers((prev) => prev.map((u) => u._id === userId ? data.data.user : u));
      toast.success('NGO verified successfully');
    } catch {
      toast.error('Failed to verify NGO');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage platform users, verify NGOs, and control access</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {['', 'donor', 'ngo', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setFilter((f) => ({ ...f, role: r })); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                filter.role === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r || 'All Roles'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { val: '', label: 'All' },
            { val: 'true', label: 'Active' },
            { val: 'false', label: 'Inactive' },
          ].map((a) => (
            <button
              key={a.val}
              onClick={() => { setFilter((f) => ({ ...f, active: a.val })); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter.active === a.val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">{total} users total</span>
      </div>

      {/* User list */}
      {loading ? (
        <CardSkeleton count={5} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-4xl mb-3">👤</p>
          <p className="text-gray-500">No users found with these filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500">Joined</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const reliability = u.role === 'ngo' ? getReliabilityBadge(u.reliabilityScore || 50) : null;
                  return (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                            {u.organizationName && (
                              <p className="text-[10px] text-gray-400">{u.organizationName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                          {u.role}
                        </span>
                        {reliability && (
                          <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${reliability.color}`}>
                            {reliability.label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span className="text-xs text-gray-600">{u.isActive ? 'Active' : 'Inactive'}</span>
                          {u.role === 'ngo' && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                              u.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {u.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {timeAgo(u.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role === 'ngo' && !u.isVerified && (
                            <button
                              onClick={() => handleVerifyNGO(u._id)}
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition"
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                              u.isActive
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / limit)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
