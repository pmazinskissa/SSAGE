import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, Settings, LogOut, BookMarked } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/courses', label: 'Courses', icon: BookMarked, end: false },
  { to: '/admin/feedback', label: 'Feedback', icon: MessageSquare, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-1 h-14">
          <span className="text-sm font-semibold text-text-primary mr-4">Admin</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
