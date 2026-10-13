import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

function MyTeams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        // ✅ GET /api/my/team
        const response = await api.get('/my/team');
        setTeams(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Failed to load teams');
      } finally {
        setLoading(false);
      }
    };
    fetchMyTeams();
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

  if (error) {
    return (
      <div className="container-custom">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider mb-6">
        My Applications
      </h1>

      <div className="grid-cards">
        {teams.length === 0 ? (
          <div className="card text-center py-16 border-yellow-400/10">
            <p className="text-gray-500">You haven't applied to any events yet</p>
            <Link to="/" className="link mt-4 inline-block">
              Browse Events →
            </Link>
          </div>
        ) : (
          teams.map((team, index) => (
            <div key={index} className="card">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-yellow-400 font-['Orbitron']">
                  {team.name}
                </h2>
                <span className={`badge ${
                  team.status === 'approved' ? 'badge-approved' :
                  team.status === 'rejected' ? 'badge-rejected' :
                  'badge-pending'
                }`}>
                  {team.status}
                </span>
              </div>
              
              <p className="text-gray-400 text-sm mt-2">{team.university}</p>
              <p className="text-gray-500 text-sm">📧 {team.email}</p>
              <p className="text-gray-500 text-sm">📍 {team.city}</p>
              
              <div className="mt-3 p-3 bg-white/5 rounded-lg">
                <p className="text-yellow-400 text-sm font-['Orbitron']">
                  Event: {team.event_name}
                </p>
              </div>

              {team.comment && (
                <p className="text-gray-500 text-sm mt-3 border-t border-gray-800 pt-3">
                  💬 {team.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MyTeams;