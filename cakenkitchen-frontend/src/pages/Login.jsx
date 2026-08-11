import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginGoogle } from '../services/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showChooser, setShowChooser] = useState(false);

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
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 376, text: "signin_with" }
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
      setMsg({ text: 'Logged in with Google successfully!', type: 'success' });
      onLogin(res.data);
      setTimeout(() => navigate('/'), 1200);
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
    <div className="modern-auth-container">
      <div className="modern-auth-card" id="login-form-view">
        <h2 className="modern-auth-title">Welcome Back</h2>

        {msg.text && (
          <div className={`form-message ${msg.type}`} id="login-feedback">
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modern-input-group">
            <input
              id="login-email"
              type="email"
              placeholder=" "
              className="modern-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label className="modern-label" htmlFor="login-email">Email Address</label>
          </div>

          <div className="modern-input-group modern-password-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder=" "
              className="modern-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label className="modern-label" htmlFor="login-password">Password</label>
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
            id="btn-login-submit"
          >
            {loading ? 'Entering Shop...' : 'Authentication Login'}
          </button>
        </form>

        {/* Google Configuration Area */}
        <div className="modern-auth-divider">
          <span>or sign in with google</span>
        </div>

        {isGoogleConfigured ? (
          <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.8rem', minHeight: '44px' }}></div>
        ) : (
          <button
            type="button"
            className="modern-google-btn"
            onClick={() => setShowChooser(true)}
            id="google-signin-btn-mock"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1.5px solid var(--border)',
              background: '#fff',
              color: '#3c4043',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: 'var(--shadow-soft)',
              marginBottom: '0.8rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        )}

        <div className="modern-link-row">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>

      {showChooser && (
        <div className="g-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="g-modal-card" style={{
            background: '#fff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            position: 'relative',
            textAlign: 'center',
            fontFamily: "'Roboto', sans-serif"
          }}>
            <button
              onClick={() => setShowChooser(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >&times;</button>
            <div style={{ marginBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 500, color: '#202124' }}>Choose an account</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#5f6368' }}>to continue to CakeNKitchen</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '24px' }}>
              <button
                onClick={() => handleGoogleSuccess({ credential: 'mock_google_id_token_123' }, 'Ankit Ghimire', 'ankitghimire2004@gmail.com')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8c2f39', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>A</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#3c4043' }}>Ankit Ghimire</span>
                  <span style={{ fontSize: '12px', color: '#5f6368' }}>ankitghimire2004@gmail.com</span>
                </div>
              </button>

              <button
                onClick={() => handleGoogleSuccess({ credential: 'mock_google_id_token_123' }, 'John Doe', 'johnuser@gmail.com')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #dadce0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4285F4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>J</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#3c4043' }}>John Doe</span>
                  <span style={{ fontSize: '12px', color: '#5f6368' }}>johnuser@gmail.com</span>
                </div>
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: '#5f6368', lineHeight: 1.5, textAlign: 'left' }}>
              To continue, Google will share your name, email address, language preference, and profile picture with CakeNKitchen.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
