// src/components/Events/EventDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isModerator = user.role === 'moderator' || user.role === 'admin';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get('/event');
        const events = response.data.data || [];
        const found = events.find(e => e.eventId === parseInt(id));
        if (found) {
          setEvent(found);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleApplyClick = () => {
    navigate(`/teams/create?event_id=${event.eventId}`);
  };

  const handleResultsClick = () => {
    navigate(`/results?event_id=${event.eventId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-gray-500 font-['Orbitron'] animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container-custom">
        <div className="alert alert-error text-red-400 text-lg">
          {error || 'Event not found'}
        </div>
        <Link to="/" className="link text-yellow-400 text-lg font-['Orbitron']">← BACK TO EVENTS</Link>
      </div>
    );
  }

  const passed = new Date(event.endDate) < new Date();

  return (
    <div className="container-custom max-w-5xl">
      <Link to="/" className="link text-yellow-400 hover:text-yellow-300 inline-block mb-8 text-xl transition-colors font-['Orbitron'] tracking-wider">
        ← BACK TO EVENTS
      </Link>

      <div className="card border-yellow-400/20 p-12 hover:border-yellow-400/40 transition-all duration-300">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-10">
          <h1 className="text-6xl font-bold text-yellow-400 font-['Orbitron'] uppercase tracking-wider text-glow-yellow">
            {event.name}
          </h1>
          <span className={event.is_open ? 'badge-open text-xl px-8 py-3' : 'badge-closed text-xl px-8 py-3'}>
            {event.is_open ? '● OPEN' : '● CLOSED'}
          </span>
        </div>

        {/* Описание */}
        <div className="mb-10">
          <h2 className="text-base text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-4">
            DESCRIPTION
          </h2>
          <p className="text-gray-300 text-2xl font-['Inter'] leading-relaxed">
            {event.description || 'No description provided'}
          </p>
        </div>

        {/* Даты - без серого фона, желтые цифры */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-sm text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-3">
              START DATE
            </h3>
            <p className="text-3xl font-bold text-yellow-400 font-['Orbitron'] tracking-wider">
              {new Date(event.dateStart).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-3">
              END DATE
            </h3>
            <p className="text-3xl font-bold text-yellow-400 font-['Orbitron'] tracking-wider">
              {new Date(event.endDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Статус */}
        <div className="mb-10">
          <div className={`text-xl font-['Orbitron'] tracking-wider ${passed ? 'text-red-400' : 'text-green-400'}`}>
            {passed ? '● EVENT HAS ENDED' : '● EVENT IS ACTIVE'}
          </div>
        </div>

        <div className="divider border-yellow-400/20 my-8" />

        {/* Кнопки действий */}
        <div className="flex flex-wrap gap-4">
          {!passed && token && (
            <button
              onClick={handleApplyClick}
              className="btn btn-primary px-12 py-5 text-xl font-['Orbitron'] tracking-wider"
            >
              APPLY NOW
            </button>
          )}

          {passed && (
            <button
              onClick={handleResultsClick}
              className="btn btn-outline px-12 py-5 text-xl font-['Orbitron'] tracking-wider text-gray-300 border-gray-600 hover:border-yellow-400 hover:text-yellow-400"
            >
              VIEW RESULTS
            </button>
          )}

          {isModerator && (
            <Link
              to={`/teams/intro?event_id=${event.eventId}`}
              className="btn btn-outline px-12 py-5 text-xl font-['Orbitron'] tracking-wider border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
            >
              MANAGE APPLICATIONS
            </Link>
          )}

          {!token && !passed && (
            <div className="text-gray-400 font-['Inter'] text-xl">
              🔒 Please <Link to="/login" className="link text-yellow-400 hover:text-yellow-300 font-['Orbitron']">LOGIN</Link> to apply
            </div>
          )}
        </div>

        {/* Информация для модераторов */}
        {isModerator && (
          <div className="mt-8 p-6 bg-black/40 border border-yellow-400/10 rounded-lg">
            <h3 className="text-xs text-gray-500 font-['Orbitron'] uppercase tracking-wider mb-2">
              MODERATOR INFO
            </h3>
            <div className="text-base text-gray-400 font-['Inter']">
              EVENT ID: <span className="text-yellow-400 font-['Orbitron']">{event.eventId}</span> | 
              CREATED BY: USER <span className="text-yellow-400 font-['Orbitron']">{event.userId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;