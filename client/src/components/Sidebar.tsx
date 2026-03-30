import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/resume', label: 'Resume Score', icon: '📄' },
  { to: '/enhance', label: 'AI Enhancer', icon: '✨' },
  { to: '/culture', label: 'Culture Fit', icon: '🧬' },
  { to: '/roadmap', label: 'Roadmap', icon: '🗺️' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40"
      style={{ background: 'rgba(10,10,20,0.95)', borderRight: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>

      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔭</span>
          <span className="text-lg font-bold gradient-text">CareerLens</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(109,40,217,0.15))', border: '1px solid rgba(124,58,237,0.3)' }
              : {}}
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full text-xs py-2">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
