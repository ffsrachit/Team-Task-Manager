import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true }); // ✅ prevents back navigation
  };

  const linkStyle = (path) =>
    location.pathname === path
      ? "text-blue-400"
      : "hover:text-blue-400";

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      
      {/* Left side */}
      <div className="flex gap-6 font-semibold">
        <Link to="/dashboard" className={linkStyle('/dashboard')}>
          Dashboard
        </Link>
        <Link to="/projects" className={linkStyle('/projects')}>
          Projects
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">
          {user ? `${user.name} (${user.role})` : "Loading..."}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}