import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function CreateResults() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    event_id: '',
    scores: [{ team_id: '', score: '' }],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addScoreRow = () => {
    setForm({
      ...form,
      scores: [...form.scores, { team_id: '', score: '' }],
    });
  };

  const removeScoreRow = (index) => {
    if (form.scores.length === 1) return;
    const newScores = form.scores.filter((_, i) => i !== index);
    setForm({ ...form, scores: newScores });
  };

  const handleScoreChange = (index, field, value) => {
    const newScores = [...form.scores];
    newScores[index][field] = value;
    setForm({ ...form, scores: newScores });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.event_id) {
      setError('Event ID is required');
      setLoading(false);
      return;
    }
    for (const score of form.scores) {
      if (!score.team_id || !score.score) {
        setError('All team_id and score fields are required');
        setLoading(false);
        return;
      }
    }

    try {
      // ✅ POST /api/result/create
      await api.post('/result/create', {
        event_id: form.event_id,
        scores: form.scores.map(s => ({
          team_id: parseInt(s.team_id),
          score: parseInt(s.score),
        })),
      });
      navigate(`/results?event_id=${form.event_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom max-w-2xl">
      <div className="card border-yellow-400/20">
        <div className="text-center mb-6">
          <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
            Add Results
          </h1>
          <p className="text-gray-500 mt-2 font-['Inter']">Enter scores for teams</p>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="label">Event ID *</label>
            <input
              type="number"
              className="input"
              placeholder="Enter event ID"
              value={form.event_id}
              onChange={(e) => setForm({ ...form, event_id: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="label">Scores</label>
            {form.scores.map((score, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="number"
                  className="input flex-1"
                  placeholder="Team ID"
                  value={score.team_id}
                  onChange={(e) => handleScoreChange(index, 'team_id', e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="input flex-1"
                  placeholder="Score"
                  value={score.score}
                  onChange={(e) => handleScoreChange(index, 'score', e.target.value)}
                  required
                />
                {form.scores.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScoreRow(index)}
                    className="btn btn-danger text-sm px-3"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addScoreRow}
              className="btn btn-outline text-sm py-1 px-3"
            >
              + Add Team
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Results'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateResults;