import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginGoogle } from '../services/api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Simulated Google Chooser State
  const [showChooser, setShowChooser] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customUser, setCustomUser] = useState({ name: '', email: '' });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleGoogleSuccess = async (response, mockName, mockEmail) => {
    setMsg({ text: '', type: '' });
    setLoading(true);
    setShowChooser(false);
    try {
      const res = await loginGoogle({
        token: response.credential,
        mockName,
        mockEmail
      });
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

  const handleCustomMockSubmit = (e) => {
    e.preventDefault();
    if (!customUser.name || !customUser.email) return;
    handleGoogleSuccess({ credential: 'mock_google_id_token_123' }, customUser.name, customUser.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await registerUser(form);
      setMsg({ text: 'Account registered successfully. Logging you in...', type: 'success' });

      // Auto login the user
      if (onLogin && res.data) {
        onLogin(res.data);
      }

      setForm({ name: '', email: '', phone: '', password: '' });
      setTimeout(() => navigate('/'), 1500);
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
    <div className="modern-auth-container">
      <div className="modern-auth-card" id="signup-form-view">
        <h2 className="modern-auth-title">Sign up</h2>

        {msg.text && (
          <div className={`form-message ${msg.type}`} id="signup-feedback">
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modern-input-group">
            <input
              id="reg-name"
              name="name"
              type="text"
              placeholder=" "
              className="modern-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <label className="modern-label" htmlFor="reg-name">Name</label>
          </div>

          <div className="modern-input-group">
            <input
              id="reg-email"
              name="email"
              type="email"
              placeholder=" "
              className="modern-input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
            <label className="modern-label" htmlFor="reg-email">Email</label>
          </div>

          <div className="modern-input-group">
            <input
              id="reg-phone"
              name="phone"
              type="text"
              placeholder=" "
              className="modern-input"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
            <label className="modern-label" htmlFor="reg-phone">Phone Number</label>
          </div>

          <div className="modern-input-group modern-password-wrap">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              className="modern-input"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
            <label className="modern-label" htmlFor="reg-password">Password</label>
            <button
              type="button"
              className="modern-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle Password Visibility"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="modern-btn-primary"
            disabled={loading}
            id="btn-register-submit"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        {/* Google Configuration Area */}
        <div className="modern-auth-divider">
          <span>or</span>
        </div>

        {isGoogleConfigured && (
          <div id="google-signup-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}></div>
        )}

        {!isGoogleConfigured && (
          <button
            type="button"
            className="modern-google-btn"
            onClick={() => setShowChooser(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </button>
        )}

        {/* Account Chooser Dialog Overlay */}
        {showChooser && (
          <div className="g-modal-overlay">
            <div className="g-modal-card">
              <button className="g-modal-close" onClick={() => { setShowChooser(false); setShowCustomInput(false); }} aria-label="Close Sandbox Chooser">&times;</button>
              <div className="g-modal-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
              </div>
              <h3 className="g-modal-title">Sign in with Google</h3>
              <p className="g-modal-subtitle">to continue to CakeNKitchen Sandbox</p>

              <div className="g-modal-sandbox-warning">
                <strong>Simulated Testing Sandbox</strong>
                Real Google credentials ID is not set in your local .env configuration. These testing profiles are simulated for development layout preview only.
              </div>

              {!showCustomInput ? (
                <div className="g-accounts-list">
                  <button
                    type="button"
                    className="g-account-item"
                    onClick={() => handleGoogleSuccess({ credential: 'mock_google_id_token_123' }, 'Ankit Ghimire', 'ankitghimire2004@gmail.com')}
                  >
                    <div className="g-account-avatar">A</div>
                    <div className="g-account-info">
                      <span className="g-account-name">Ankit Ghimire</span>
                      <span className="g-account-email">ankitghimire2004@gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="g-account-item"
                    onClick={() => handleGoogleSuccess({ credential: 'mock_google_id_token_123' }, 'John Doe', 'johnuser@gmail.com')}
                  >
                    <div className="g-account-avatar" style={{ backgroundColor: '#0f9d58' }}>J</div>
                    <div className="g-account-info">
                      <span className="g-account-name">John Doe</span>
                      <span className="g-account-email">johnuser@gmail.com</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="g-account-item"
                    onClick={() => setShowCustomInput(true)}
                    style={{ justifyContent: 'center', color: '#1a73e8', fontWeight: '500' }}
                  >
                    ➕ Use another testing account
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCustomMockSubmit} className="g-custom-form">
                  <input
                    type="text"
                    placeholder="Testing Account Full Name"
                    className="g-custom-input"
                    value={customUser.name}
                    onChange={e => setCustomUser({ ...customUser, name: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Testing Email Address"
                    className="g-custom-input"
                    value={customUser.email}
                    onChange={e => setCustomUser({ ...customUser, email: e.target.value })}
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '0.65rem' }}>Select & Sign In</button>
                  <button type="button" className="nav-link" onClick={() => setShowCustomInput(false)} style={{ border: 'none', background: 'none' }}>Back to list</button>
                </form>
              )}

              <div className="g-modal-footer">
                To continue, Google will share your name, email address, language preference, and profile picture with CakeNKitchen (Simulated Sandbox session).
              </div>
            </div>
          </div>
        )}

        <div className="modern-link-row">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
