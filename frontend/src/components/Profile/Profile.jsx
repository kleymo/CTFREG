// src/components/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 font-['Orbitron'] animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-2xl">
      <div className="card border-yellow-400/20">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
            Profile
          </h1>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <span className="text-gray-400 font-['Orbitron'] text-sm">Username</span>
            <span className="text-white font-bold">{user?.login || 'Unknown'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <span className="text-gray-400 font-['Orbitron'] text-sm">Role</span>
            <span className={`badge ${
              user?.role === 'admin' ? 'badge-approved' :
              user?.role === 'moderator' ? 'badge-open' :
              'badge-pending'
            }`}>
              {user?.role || 'user'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <span className="text-gray-400 font-['Orbitron'] text-sm">User ID</span>
            <span className="text-gray-300">{user?.userId || 'N/A'}</span>
          </div>
        </div>

        <div className="divider" />

        <div className="flex gap-4">
          <Link to="/my/teams" className="btn btn-primary flex-1 text-center">
            My Applications
          </Link>
          <Link to="/" className="btn btn-outline flex-1 text-center">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;