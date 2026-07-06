import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      setMsg({ text: 'Logged in successfully.', type: 'success' });
      onLogin(res.data);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || 'Invalid credentials. Please attempt again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" id="login-form-view">
      <h2 className="form-title">Welcome Back</h2>

      {msg.text && (
        <div className={`form-message ${msg.type}`} id="login-feedback">
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            placeholder="name@domain.com"
            className="form-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Account Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            className="form-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary btn-block"
          style={{ padding: '0.9rem', marginTop: '1rem' }}
          disabled={loading}
          id="btn-login-submit"
        >
          {loading ? 'Entering Shop...' : 'Authentication Login'}
        </button>
      </form>
      <div className="form-link-row">
        Don't have an account? <Link to="/register">Create Account</Link>
      </div>
    </div>
  );
}

export default Login;
