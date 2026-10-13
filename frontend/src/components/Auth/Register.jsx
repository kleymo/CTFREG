import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

function Register() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-hex">
      <div className="w-full max-w-md">
        <div className="card border-yellow-400/20">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">✨</div>
            <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
              Join the CTF
            </h1>
            <p className="text-gray-500 mt-2 font-['Inter']">Create your account</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="label">Username</label>
              <input
                type="text"
                className="input"
                placeholder="Choose a username"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                required
              />
            </div>

            <div className="mb-6">
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-success w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Join Now'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 font-['Inter']">
            Already have an account?{' '}
            <Link to="/login" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;