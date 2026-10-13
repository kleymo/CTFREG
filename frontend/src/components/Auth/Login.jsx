import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

function Login() {
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', form);
      const data = response.data.data;
      
      // ✅ Читаем токен из заголовка Authorization
      const authHeader = response.headers['authorization'];
      console.log('🔑 Auth header:', authHeader);
      
      let token = null;
      if (authHeader) {
        token = authHeader.replace('Bearer ', '');
      }
      
      if (!token) {
        setError('No token received from server');
        setLoading(false);
        return;
      }
      
      console.log('✅ Token saved:', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.user_id,
        login: data.login,
        role: data.role,
      }));
      
      navigate('/');
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-hex">
      <div className="w-full max-w-md">
        <div className="card border-yellow-400/20">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="heading-glow text-3xl font-bold uppercase tracking-wider">
              Welcome Back
            </h1>
            <p className="text-gray-500 mt-2 font-['Inter']">Sign in to continue</p>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 font-['Inter']">
            Don't have an account?{' '}
            <Link to="/register" className="link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;