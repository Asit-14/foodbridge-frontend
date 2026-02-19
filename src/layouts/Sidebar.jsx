import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlinePlusCircle,
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineTruck,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineBell,
  HiOutlineUser,
} from 'react-icons/hi';

const SIDEBAR_NAV = {
  donor: [
    { to: '/donor', label: 'Dashboard', icon: HiOutlineViewGrid },
    { to: '/donor/create', label: 'New Donation', icon: HiOutlinePlusCircle },
    { to: '/donor/history', label: 'History', icon: HiOutlineClock },
  ],
  ngo: [
    { to: '/ngo', label: 'Dashboard', icon: HiOutlineViewGrid },
    { to: '/ngo/nearby', label: 'Find Food', icon: HiOutlineSearch },
    { to: '/ngo/pickups', label: 'My Pickups', icon: HiOutlineTruck },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: HiOutlineViewGrid },
    { to: '/admin/users', label: 'Users', icon: HiOutlineUsers },
    { to: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  ],
};

const SHARED_NAV = (basePath) => [
  { to: `${basePath}/notifications`, label: 'Notifications', icon: HiOutlineBell },
  { to: `${basePath}/profile`, label: 'Profile', icon: HiOutlineUser },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role || 'donor';
  const basePath = `/${role}`;
  const mainLinks = SIDEBAR_NAV[role] || [];
  const sharedLinks = SHARED_NAV(basePath);

  const isActive = (to) => location.pathname === to;

  const linkClasses = (to) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
      isActive(to)
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <span className="text-2xl">🍃</span>
        <span className="font-bold text-lg text-gray-900 tracking-tight">FoodBridge</span>
      </div>

      {/* Main nav */}
      <nav className="space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>
        {mainLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={linkClasses(link.to)}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="my-6 border-t border-gray-100" />

      {/* Shared nav */}
      <nav className="space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Account
        </p>
        {sharedLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={linkClasses(link.to)}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Role badge at bottom */}
      <div className="mt-auto pt-6">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white border-r border-gray-100 px-4 py-6 z-30">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white px-4 py-6 flex flex-col shadow-xl animate-fade-in-up z-50">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
