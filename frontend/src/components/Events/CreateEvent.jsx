// src/components/Events/CreateEvent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function CreateEvent() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    dateStart: '',
    endDate: '',
    photoURL: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Функция форматирования даты из YYYY-MM-DD в DD.MM.YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}.${parts[1]}.${parts[0]}`; // DD.MM.YYYY
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // ✅ Отправляем даты в правильном формате
      const payload = {
        name: form.name,
        description: form.description,
        dateStart: formatDate(form.dateStart), // DD.MM.YYYY
        endDate: formatDate(form.endDate),     // DD.MM.YYYY
        photoURL: form.photoURL,
      };

      console.log('📤 Sending:', payload);

      await api.post('/event/create', payload);
      navigate('/');
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom max-w-2xl">
      <div className="card border-yellow-400/20">
        <div className="text-center mb-6">
          <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
            Create Event
          </h1>
          <p className="text-gray-500 mt-2 font-['Inter']">Set up a new competition</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Event Name *</label>
            <input
              type="text"
              className="input"
              placeholder="Enter event name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Describe your event"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="label">Start Date</label>
              <input
                type="date"
                className="input"
                value={form.dateStart}
                onChange={(e) => setForm({ ...form, dateStart: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="label">End Date</label>
              <input
                type="date"
                className="input"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Photo URL</label>
            <input
              type="url"
              className="input"
              placeholder="https://example.com/photo.jpg"
              value={form.photoURL}
              onChange={(e) => setForm({ ...form, photoURL: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;