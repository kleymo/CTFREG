// src/components/Layout/Header.jsx
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const isModerator = user.role === 'moderator' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-yellow-400/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-3xl text-yellow-400">⚡</span>
          <span className="text-xl font-bold text-white tracking-wider font-['Orbitron']">
            CTF<span className="text-yellow-400">REG</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          {token ? (
            <>
              <Link to="/teams/create" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                Create Team
              </Link>
              <Link to="/my/teams" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                My Teams
              </Link>
              <Link to="/profile" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                Profile
              </Link>

              {isModerator && (
                <>
                  <Link to="/events/create" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                    Create Event
                  </Link>
                  <Link to="/teams/intro" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                    Applications
                  </Link>
                  <Link to="/results" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                    Results
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm uppercase tracking-wider font-['Orbitron']">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider text-yellow-400 border border-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition-all duration-200"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;