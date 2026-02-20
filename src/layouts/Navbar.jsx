import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { notificationService } from '../services/endpoints';
import { HiOutlineMenu, HiOutlineBell, HiOutlineLogout } from 'react-icons/hi';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { connected, socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const basePath = `/${user?.role}`;

  useEffect(() => {
    notificationService.getUnreadCount()
      .then(({ data }) => setUnreadCount(data.data?.count || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => setUnreadCount((c) => c + 1);
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  useEffect(() => {
    if (location.pathname.endsWith('/notifications')) {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/create')) return 'New Donation';
    if (path.endsWith('/history')) return 'History';
    if (path.endsWith('/nearby')) return 'Find Food';
    if (path.endsWith('/pickups')) return 'My Pickups';
    if (path.endsWith('/users')) return 'Users';
    if (path.endsWith('/analytics')) return 'Analytics';
    if (path.endsWith('/notifications')) return 'Notifications';
    if (path.endsWith('/profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: mobile menu + page title */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-50 text-gray-500"
              onClick={onMenuToggle}
            >
              <HiOutlineMenu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-300'}`}
              title={connected ? 'Real-time connected' : 'Disconnected'}
            />

            <Link
              to={`${basePath}/notifications`}
              className="relative p-2 rounded-lg hover:bg-gray-50 text-gray-500"
              title="Notifications"
            >
              <HiOutlineBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            <Link
              to={`${basePath}/profile`}
              className="hidden sm:flex items-center gap-2 ml-1 pl-3 border-l border-gray-200 hover:opacity-80 transition"
            >
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
              title="Logout"
            >
              <HiOutlineLogout size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
