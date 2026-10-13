import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../api/axios';

function ResultsList() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const eventIdFromUrl = params.get('event_id');

  const [results, setResults] = useState([]);
  const [eventName, setEventName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (eventIdFromUrl) {
      fetchResults(eventIdFromUrl);
    }
  }, [eventIdFromUrl]);

  const fetchResults = async (eventId) => {
    setLoading(true);
    setError('');
    try {
      // ✅ GET /api/result?event_id=...
      const response = await api.get(`/result?event_id=${eventId}`);
      setResults(response.data.data || []);
      
      const eventsResponse = await api.get('/event');
      const events = eventsResponse.data.data || [];
      const event = events.find(e => e.eventId === parseInt(eventId));
      setEventName(event?.name || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventId = e.target.elements.event_id.value;
    if (eventId) {
      fetchResults(eventId);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-gray-400 font-['Orbitron'] animate-pulse">
          Loading results...
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom max-w-4xl">
      <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider mb-6">
        Results
        {eventName && <span className="text-sm text-gray-400 font-['Inter'] ml-4">— {eventName}</span>}
      </h1>

      <div className="card border-yellow-400/20 mb-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="number"
            name="event_id"
            className="input flex-1"
            placeholder="Enter Event ID"
            defaultValue={eventIdFromUrl || ''}
            required
          />
          <button type="submit" className="btn btn-primary">
            Load Results
          </button>
        </form>
        <Link to="/results/create" className="link text-sm mt-4 inline-block">
          + Add Results (Moderator)
        </Link>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          {error}
        </div>
      )}

      {results.length === 0 && !loading && !error && eventIdFromUrl && (
        <div className="card text-center py-16 border-yellow-400/10">
          <p className="text-gray-500">No results found for this event</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="card border-yellow-400/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-400/20">
                  <th className="text-left py-3 text-yellow-400 font-['Orbitron'] text-xs uppercase tracking-wider">#</th>
                  <th className="text-left py-3 text-yellow-400 font-['Orbitron'] text-xs uppercase tracking-wider">Team</th>
                  <th className="text-left py-3 text-yellow-400 font-['Orbitron'] text-xs uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, index) => (
                  <tr key={r.result_id} className="border-b border-gray-800/50 hover:bg-white/5">
                    <td className="py-3 text-yellow-400 font-['Orbitron']">{index + 1}</td>
                    <td className="py-3">{r.team_name}</td>
                    <td className="py-3 font-bold text-lg">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsList;