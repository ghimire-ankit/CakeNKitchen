import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginGoogle } from '../services/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const initGoogle = () => {
      if (!active) return;
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1019688537554-mockclientid123.apps.googleusercontent.com",
          callback: handleGoogleSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 376, text: "signin_with" }
        );
      } else {
        setTimeout(initGoogle, 200);
      }
    };
    initGoogle();
    return () => { active = false; };
  }, []);

  const handleGoogleSuccess = async (response) => {
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await loginGoogle({ token: response.credential });
      setMsg({ text: 'Logged in with Google successfully!', type: 'success' });
      onLogin(res.data);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' || err.message === 'Network Error' ? 'Backend server is offline. Please run the server to login.' : err.message) || 'Google Login failed.';
      setMsg({ text: errorText, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

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
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' || err.message === 'Network Error' ? 'Backend server is offline. Please run the server to login.' : err.message) || 'Login failed.';
      setMsg({
        text: errorText,
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

      {/* Google Button Container */}
      <div className="google-auth-wrap">
        <div id="google-signin-btn"></div>
        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>
      </div>

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
