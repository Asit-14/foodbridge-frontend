import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../../services/endpoints';
import { useSocket } from '../../context/SocketContext';
import { CardSkeleton } from '../../components/common/Loader';
import { timeAgo } from '../../utils/constants';
import toast from 'react-hot-toast';

const ICON_MAP = {
  donation_accepted: '🤝',
  donation_delivered: '✅',
  donation_expired: '⏰',
  donation_picked_up: '🚚',
  new_donation_nearby: '📍',
  otp_generated: '🔑',
  ngo_verified: '🛡️',
  reassignment: '🔄',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { socket } = useSocket();
  const limit = 20;

  const fetchNotifications = useCallback(async (p = 1) => {
    try {
      const { data } = await notificationService.getAll({ page: p, limit });
      setNotifications(data.data.notifications);
      setTotal(data.total || data.data.notifications.length);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(page); }, [fetchNotifications, page]);

  // Live: new notifications
  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchNotifications(1);
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket, fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all read');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-semibold transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <CardSkeleton count={5} />
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && handleMarkRead(n._id)}
              className={`bg-white rounded-xl p-4 border transition cursor-pointer hover:shadow-sm ${
                n.read ? 'border-gray-100 opacity-70' : 'border-primary-200 bg-primary-50/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">
                  {ICON_MAP[n.type] || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-semibold'}`}>
                    {n.title || n.message}
                  </p>
                  {n.title && n.message && (
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary-600 mt-2 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
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
          <span className="text-xs text-gray-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={notifications.length < limit}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
