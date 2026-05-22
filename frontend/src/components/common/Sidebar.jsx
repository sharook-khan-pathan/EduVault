import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiBook, FiUpload, FiSearch, FiBell, FiUsers,
  FiSettings, FiLogOut, FiLayers, FiBookOpen, FiGrid
} from 'react-icons/fi';

const navConfig = {
  ADMIN: [
    { to: '/admin', icon: FiHome, label: 'Dashboard' },
    { to: '/admin/departments', icon: FiGrid, label: 'Departments' },
    { to: '/admin/courses', icon: FiLayers, label: 'Courses' },
    { to: '/admin/subjects', icon: FiBookOpen, label: 'Subjects' },
    { to: '/admin/faculty', icon: FiUsers, label: 'Faculty' },
    { to: '/admin/students', icon: FiUsers, label: 'Students' },
    { to: '/admin/materials', icon: FiBook, label: 'Materials' },
    { to: '/admin/announcements', icon: FiBell, label: 'Announcements' },
  ],
  FACULTY: [
    { to: '/faculty', icon: FiHome, label: 'Dashboard' },
    { to: '/faculty/subjects', icon: FiBookOpen, label: 'My Subjects' },
    { to: '/faculty/upload', icon: FiUpload, label: 'Upload Material' },
    { to: '/faculty/materials', icon: FiBook, label: 'My Materials' },
    { to: '/faculty/announcements', icon: FiBell, label: 'Announcements' },
  ],
  STUDENT: [
    { to: '/student', icon: FiHome, label: 'Dashboard' },
    { to: '/student/browse', icon: FiBookOpen, label: 'Browse Materials' },
    { to: '/student/search', icon: FiSearch, label: 'Search' },
    { to: '/student/announcements', icon: FiBell, label: 'Announcements' },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <FiBook className="text-white text-lg" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-lg leading-none">EduVault</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-sm">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split('/').length === 2}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
            <FiSettings size={18} />
            <span>Profile Settings</span>
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
