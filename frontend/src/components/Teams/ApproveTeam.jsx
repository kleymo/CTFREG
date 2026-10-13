import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function ApproveTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await api.get('/team/intro');
        const teams = response.data.data || [];
        const found = teams.find(t => t.id === parseInt(id));
        if (found) {
          setTeam(found);
        } else {
          setError('Team not found');
        }
      } catch (err) {
        setError('Failed to load team');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  const handleApprove = async () => {
    try {
      await api.post('/team/approved', { intro_id: parseInt(id) });
      navigate('/teams/intro');
    } catch (err) {
      setError('Failed to approve team');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-gray-600 font-['Orbitron'] animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container-custom">
        <div className="alert alert-error">{error || 'Team not found'}</div>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-2xl">
      <div className="card border-yellow-400/20">
        <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider mb-6">
          Approve Application
        </h1>

        <div className="space-y-4">
          <div>
            <label className="label">Team Name</label>
            <p className="text-xl font-bold text-yellow-400">{team.name}</p>
          </div>
          <div>
            <label className="label">University</label>
            <p className="text-gray-300">{team.university}</p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-gray-300">{team.email}</p>
          </div>
          <div>
            <label className="label">City</label>
            <p className="text-gray-300">{team.city}</p>
          </div>
          <div>
            <label className="label">Phone</label>
            <p className="text-gray-300">{team.phone}</p>
          </div>
          <div>
            <label className="label">Event ID</label>
            <p className="text-gray-300">{team.event_id}</p>
          </div>
          {team.comment && (
            <div>
              <label className="label">Comment</label>
              <p className="text-gray-400">{team.comment}</p>
            </div>
          )}

          <div className="divider" />

          <div className="flex gap-4">
            <button onClick={handleApprove} className="btn btn-success flex-1">
              Approve Team
            </button>
            <button onClick={() => navigate('/teams/intro')} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveTeam;