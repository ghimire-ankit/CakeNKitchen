import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginGoogle } from '../services/api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
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
          document.getElementById("google-signup-btn"),
          { theme: "outline", size: "large", width: 376, text: "signup_with" }
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
      setMsg({ text: 'Registered and logged in with Google successfully!', type: 'success' });
      if (onLogin) {
        onLogin(res.data);
      }
      setTimeout(() => navigate('/'), 1000);
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

      {/* Google Button Container */}
      <div className="google-auth-wrap">
        <div id="google-signup-btn"></div>
        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>
      </div>

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
      <div className="form-link-row">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default Register;
