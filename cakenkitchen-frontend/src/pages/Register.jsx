import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginGoogle } from '../services/api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = googleClientId && !googleClientId.includes('mock') && googleClientId !== '';

  useEffect(() => {
    if (!isGoogleConfigured) return;
    let active = true;
    const initGoogle = () => {
      if (!active) return;
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleSuccess,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: 376, text: "signup_with" }
        );
      } else {
        setTimeout(initGoogle, 200);
      }
    };
    initGoogle();
    return () => { active = false; };
  }, [isGoogleConfigured, googleClientId]);

  const handleGoogleSuccess = async (response) => {
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await loginGoogle({ token: response.credential });
      setMsg({ text: 'Registered and logged in with Google successfully!', type: 'success' });
      if (onLogin) {
        onLogin(res.data);
      }
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' || err.message === 'Network Error' ? 'Backend server is offline. Please run the server to register.' : err.message) || 'Google SignUp failed.';
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
      await registerUser(form);
      setMsg({ text: 'Account registered successfully. Proceeding to login...', type: 'success' });
      setForm({ name: '', email: '', phone: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' || err.message === 'Network Error' ? 'Backend server is offline. Please run the server to register.' : err.message) || 'Registration failed.';
      setMsg({
        text: errorText,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" id="signup-form-view">
      <h2 className="form-title">Create Account</h2>

      {msg.text && (
        <div className={`form-message ${msg.type}`} id="signup-feedback">
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Customer Name</label>
          <input
            id="reg-name"
            name="name"
            type="text"
            placeholder="John Doe"
            className="form-input"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Valid Email Address</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="name@domain.com"
            className="form-input"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-phone">Contact Phone Number</label>
          <input
            id="reg-phone"
            name="phone"
            type="text"
            placeholder="Phone e.g 98XXXXXXXX"
            className="form-input"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Security Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            placeholder="Min 6 characters recommended"
            className="form-input"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-primary btn-block"
          style={{ padding: '0.9rem', marginTop: '1rem' }}
          disabled={loading}
          id="btn-register-submit"
        >
          {loading ? 'Creating...' : 'Register Profile'}
        </button>
      </form>

      {/* Google Button Container (Placed at bottom, under the email signup form) */}
      <div className="google-auth-wrap" style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        <div className="auth-divider" style={{ margin: '1rem 0 1.5rem' }}>
          <span>or sign up with google</span>
        </div>

        {isGoogleConfigured && (
          <div id="google-signup-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}></div>
        )}

        {/* Local Sandbox option, displays if Google Client ID is not configured */}
        {!isGoogleConfigured && (
          <button
            type="button"
            className="btn-mock-google"
            onClick={() => handleGoogleSuccess({ credential: 'mock_google_id_token_123' })}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#fff',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--ink)',
              fontFamily: 'var(--sans)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google (Local Sandbox)
          </button>
        )}
      </div>

      <div className="form-link-row">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Register;
