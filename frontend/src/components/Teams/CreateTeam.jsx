import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';

function CreateTeam() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const params = new URLSearchParams(location.search);
  const eventIdFromUrl = params.get('event_id');

  const [form, setForm] = useState({
    name: '',
    university: '',
    email: '',
    city: '',
    phone: '',
    event_id: eventIdFromUrl || '',
    comment: '',
  });
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (eventIdFromUrl) {
      const fetchEventName = async () => {
        try {
          const response = await api.get('/event');
          const events = response.data.data || [];
          const event = events.find(e => e.eventId === parseInt(eventIdFromUrl));
          if (event) {
            setEventName(event.name);
            if (new Date(event.endDate) < new Date()) {
              setError('This event has already ended');
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchEventName();
    }
  }, [eventIdFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.phone.length !== 12 || !form.phone.startsWith('+7')) {
      setError('Phone must be in format: +79876543219');
      setLoading(false);
      return;
    }

    try {
      // ✅ POST /api/team/create
      await api.post('/team/create', {
        name: form.name,
        university: form.university,
        email: form.email,
        city: form.city,
        phone: form.phone,
        event_id: parseInt(form.event_id),
        comment: form.comment,
      });
      navigate('/my/teams');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom max-w-2xl">
      <div className="card border-yellow-400/20">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👥</div>
          <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
            Apply for Event
          </h1>
          {eventName && (
            <p className="text-yellow-400 mt-2 font-['Orbitron'] text-sm">
              {eventName}
            </p>
          )}
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Team Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Enter team name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">University *</label>
            <input
              type="text"
              className="input"
              placeholder="Enter your university"
              value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              placeholder="team@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">City *</label>
              <input
                type="text"
                className="input"
                placeholder="Enter city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>
            <div className="mb-4">
              <label className="label">Phone *</label>
              <input
                type="tel"
                className="input"
                placeholder="+79876543219"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <p className="text-xs text-gray-600 mt-1 font-['Inter']">Format: +79876543219</p>
            </div>
          </div>

          <input type="hidden" name="event_id" value={form.event_id} />

          <div className="mb-6">
            <label className="label">Comment</label>
            <textarea
              className="input min-h-[80px]"
              placeholder="Any additional information"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-full py-3 text-lg"
            disabled={loading || !!error}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateTeam;