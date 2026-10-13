import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isModerator = user.role === 'moderator' || user.role === 'admin';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // ✅ GET /api/event
        const response = await api.get('/event');
        setEvents(response.data.data || []);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err.response?.data?.error || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCardClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleApplyClick = (e, eventId) => {
    e.stopPropagation();
    navigate(`/teams/create?event_id=${eventId}`);
  };

  const handleResultsClick = (e, eventId) => {
    e.stopPropagation();
    navigate(`/results?event_id=${eventId}`);
  };

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

  const isEventPassed = (endDate) => {
    return new Date(endDate) < new Date();
  };

  return (
    <div className="container-custom max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="heading-glow text-5xl font-bold uppercase tracking-wider">
            Competitions
          </h1>
          <p className="text-gray-400 mt-2 font-['Inter'] text-lg">
            Discover and join cybersecurity competitions
          </p>
        </div>
        {isModerator && (
          <Link to="/event/create" className="btn btn-primary text-lg px-8 py-4">
            + Create Event
          </Link>
        )}
      </div>

      <div className="divider" />

      {events.length === 0 ? (
        <div className="card text-center py-20 border-yellow-400/10">
          <div className="text-7xl mb-4">📭</div>
          <h2 className="heading text-3xl text-gray-400">No events yet</h2>
          <p className="text-gray-500 mt-3 font-['Inter'] text-lg">Be the first to create an event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event) => {
            const passed = isEventPassed(event.endDate);

            return (
              <div
                key={event.eventId}
                className="card border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer p-8"
                onClick={() => handleCardClick(event.eventId)}
              >
                <div className="flex items-start justify-between mb-5">
                  <h2 className="text-3xl font-bold text-yellow-400 font-['Orbitron'] uppercase tracking-wider">
                    {event.name}
                  </h2>
                  <span className={event.is_open ? 'badge-open text-base px-4 py-2' : 'badge-closed text-base px-4 py-2'}>
                    {event.is_open ? '● Open' : '● Closed'}
                  </span>
                </div>
                
                <p className="text-gray-300 text-lg mb-5 line-clamp-3 font-['Inter'] leading-relaxed">
                  {event.description || 'No description provided'}
                </p>
                
                <div className="text-base text-gray-400 space-y-2 font-['Inter']">
                  <div>📅 {new Date(event.dateStart).toLocaleDateString()} → {new Date(event.endDate).toLocaleDateString()}</div>
                </div>

                <div className="divider my-5" />

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {!passed && token && (
                      <button
                        onClick={(e) => handleApplyClick(e, event.eventId)}
                        className="btn btn-primary text-base py-2 px-6"
                      >
                        Apply Now
                      </button>
                    )}

                    {passed && (
                      <button
                        onClick={(e) => handleResultsClick(e, event.eventId)}
                        className="btn btn-outline text-base py-2 px-6"
                      >
                        View Results
                      </button>
                    )}
                  </div>

                  <span className="text-yellow-400/50 hover:text-yellow-400 transition text-base font-['Orbitron']">
                    View Details →
                  </span>
                </div>

                {!token && !passed && (
                  <p className="text-sm text-gray-500 mt-4 font-['Inter']">
                    🔒 <Link to="/login" className="link">Login</Link> to apply
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventList;