// src/components/Teams/TeamIntroList.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function TeamIntroList() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const eventIdFromUrl = params.get('event_id');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ Если нет event_id → редирект
    if (!eventIdFromUrl) {
      setError('Event ID is required');
      setLoading(false);
      return;
    }
    fetchApplications();
  }, [eventIdFromUrl]);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      // ✅ Всегда передаем event_id
      const url = `/team/intro?event_id=${eventIdFromUrl}`;
      console.log('📡 Fetching applications:', url);
      
      const response = await api.get(url);
      setApplications(response.data.data || []);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (introId) => {
    try {
      await api.post('/team/approved', { intro_id: introId });
      setMessage('✅ Team approved successfully!');
      fetchApplications();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Failed to approve team');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 font-['Orbitron'] animate-pulse">
          Loading applications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom">
        <div className="alert alert-error mb-4">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom">
      <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider mb-6">
        Applications
        <span className="text-sm text-gray-400 font-['Inter'] ml-4">Event ID: {eventIdFromUrl}</span>
      </h1>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'} mb-4`}>
          {message}
        </div>
      )}

      <div className="grid-cards">
        {applications.length === 0 ? (
          <div className="card text-center py-16 border-yellow-400/10">
            <p className="text-gray-500">No applications found for this event</p>
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="card">
              <h2 className="text-xl font-bold text-yellow-400 font-['Orbitron']">
                {app.name}
              </h2>
              <p className="text-gray-400 text-sm mt-2">{app.university}</p>
              <p className="text-gray-500 text-sm">Email: {app.email}</p>
              <p className="text-gray-500 text-sm">City: {app.city}</p>
              <div className="mt-3">
                <span className={`badge ${
                  app.status === 'approved' ? 'badge-approved' :
                  app.status === 'rejected' ? 'badge-rejected' :
                  'badge-pending'
                }`}>
                  {app.status}
                </span>
              </div>
              {app.status === 'pending' && (
                <button
                  onClick={() => handleApprove(app.id)}
                  className="btn btn-success text-sm py-1 px-3 mt-4 w-full"
                >
                  Approve Team
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TeamIntroList;