import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, loginGoogle } from '../services/api';

function Register({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Google Sign-Up States
  const [showGooglePopup, setShowGooglePopup] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

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
          callback: handleRealGoogleSuccess,
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

  // Real Google OAuth callback
  const handleRealGoogleSuccess = async (response) => {
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await loginGoogle({ token: response.credential });
      if (res.success && res.data) {
        setMsg({ text: 'Registered with Google successfully!', type: 'success' });
        if (onLogin) onLogin(res.data);
        setTimeout(() => navigate('/'), 1200);
      } else {
        setMsg({ text: res.error || 'Google Sign-Up failed.', type: 'error' });
      }
    } catch (err) {
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'Backend server is offline.' : err.message) || 'Google Sign-Up failed.';
      setMsg({ text: errorText, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Mock Google Sign-Up (email-only flow)
  const handleGoogleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail) return;
    setGoogleLoading(true);
    setGoogleError('');
    try {
      const parts = googleEmail.split('@')[0].split(/[._\-]/);
      const autoName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Google User';
      const res = await loginGoogle({
        token: 'mock_google_id_token_' + Date.now(),
        mockName: autoName,
        mockEmail: googleEmail
      });
      if (res.success && res.data) {
        setShowGooglePopup(false);
        setMsg({ text: 'Registered and logged in with Google successfully!', type: 'success' });
        if (onLogin) onLogin(res.data);
        setTimeout(() => navigate('/'), 1200);
      } else {
        setGoogleError(res.error || 'Sign-Up failed. Please try again.');
      }
    } catch (err) {
      const errorText = err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'Backend server is offline.' : err.message) || 'Google Sign-Up failed.';
      setGoogleError(errorText);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Standard registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    // Password validation: must contain letter, number, symbol, min 8 chars
    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pwdRegex.test(form.password)) {
      setMsg({
        text: 'Password must be at least 8 characters with a letter, number, and symbol (!@#$%...)',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(form);
      setMsg({ text: 'Account registered successfully. Logging you in...', type: 'success' });
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
        <h2 className="modern-auth-title">Create Account</h2>

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
            <label className="modern-label" htmlFor="reg-name">Full Name</label>
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
            <label className="modern-label" htmlFor="reg-email">Email Address</label>
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
              minLength={8}
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
          <p style={{ fontSize: '11px', color: '#888', margin: '-0.3rem 0 0.8rem 0.2rem' }}>
            Min 8 chars: letters + numbers + symbols (!@#$...)
          </p>

          <button
            type="submit"
            className="modern-btn-primary"
            disabled={loading}
            id="btn-register-submit"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Divider */}
        <div className="modern-auth-divider">
          <span>or sign up with</span>
        </div>

        {/* Google Button */}
        {isGoogleConfigured ? (
          <div id="google-signup-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.8rem', minHeight: '44px' }}></div>
        ) : (
          <button
            type="button"
            className="modern-google-btn"
            onClick={() => {
              setGoogleEmail('');
              setGoogleError('');
              setShowGooglePopup(true);
            }}
            id="google-signup-btn-mock"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: '#4285F4',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'background 0.2s',
              marginBottom: '0.8rem'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#357ae8'}
            onMouseOut={e => e.currentTarget.style.background = '#4285F4'}
          >
            <div style={{
              background: '#fff', borderRadius: '50%', width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
            </div>
            Continue with Google
          </button>
        )}

        <div className="modern-link-row">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>

      {/* Google Sign-Up Popup — Clean email-only flow */}
      {showGooglePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, fontFamily: "'Google Sans', Roboto, Arial, sans-serif"
        }}>
          <div style={{
            width: '440px', background: '#fff', borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Title Bar */}
            <div style={{
              background: '#f1f3f4', padding: '8px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: '12px', color: '#3c4043', borderBottom: '1px solid #dadce0', userSelect: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Sign in - Google Accounts</span>
              </div>
              <span style={{ cursor: 'pointer', opacity: 0.7, fontWeight: 'bold', fontSize: '14px' }} onClick={() => setShowGooglePopup(false)}>&times;</span>
            </div>

            {/* Address Bar */}
            <div style={{
              background: '#f8f9fa', padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: '8px',
              borderBottom: '1px solid #e8eaed'
            }}>
              <div style={{ display: 'flex', gap: '10px', color: '#5f6368', fontSize: '11px' }}>
                <span>←</span><span>→</span><span>↻</span>
              </div>
              <div style={{
                background: '#fff', fontSize: '11px', color: '#5f6368',
                padding: '3px 10px', borderRadius: '12px', border: '1px solid #dadce0',
                flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <span style={{ color: '#1a73e8' }}>🔒</span> accounts.google.com/o/oauth2/v2/auth?client_id=...
              </div>
            </div>

            {/* Sign-Up Content */}
            <form onSubmit={handleGoogleEmailSubmit} style={{ padding: '40px 36px', display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
              {/* Google Logo */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <span style={{ fontSize: '24px', fontWeight: '500', letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#4285F4' }}>G</span>
                  <span style={{ color: '#EA4335' }}>o</span>
                  <span style={{ color: '#FBBC05' }}>o</span>
                  <span style={{ color: '#4285F4' }}>g</span>
                  <span style={{ color: '#34A853' }}>l</span>
                  <span style={{ color: '#EA4335' }}>e</span>
                </span>
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 8px 0', color: '#202124' }}>Sign in</h3>
              <p style={{ fontSize: '16px', color: '#5f6368', margin: '0 0 28px 0' }}>to continue to CakeNKitchen</p>

              {/* Error Message */}
              {googleError && (
                <div style={{
                  background: '#fce8e6', border: '1px solid #f5c6cb', borderRadius: '4px',
                  padding: '10px 14px', fontSize: '13px', color: '#c5221f', marginBottom: '16px'
                }}>
                  {googleError}
                </div>
              )}

              {/* Email Input */}
              <div style={{ position: 'relative', marginBottom: '10px', width: '100%' }}>
                <input
                  type="email"
                  id="gd-email-register"
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="Email or phone"
                  required
                  autoFocus
                  style={{
                    width: '100%', padding: '16px 14px',
                    border: '1px solid #dadce0', borderRadius: '4px',
                    fontSize: '16px', outline: 'none', boxSizing: 'border-box',
                    color: '#202124'
                  }}
                  onFocus={e => e.target.style.borderColor = '#1a73e8'}
                  onBlur={e => e.target.style.borderColor = '#dadce0'}
                />
              </div>

              <p style={{ fontSize: '13px', color: '#5f6368', margin: '0 0 24px 0', lineHeight: 1.5 }}>
                If you don't have an account, we'll create one for you automatically.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <Link
                  to="/login"
                  style={{
                    background: 'none', border: 'none', color: '#1a73e8',
                    fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  onClick={() => setShowGooglePopup(false)}
                >
                  Sign in instead
                </Link>

                <button
                  type="submit"
                  disabled={googleLoading}
                  style={{
                    background: '#1a73e8', border: 'none', color: '#fff',
                    padding: '10px 24px', borderRadius: '4px', fontSize: '14px',
                    fontWeight: 500, cursor: googleLoading ? 'wait' : 'pointer',
                    transition: 'background 0.2s', opacity: googleLoading ? 0.7 : 1
                  }}
                  onMouseOver={e => { if (!googleLoading) e.currentTarget.style.background = '#1557b0'; }}
                  onMouseOut={e => e.currentTarget.style.background = '#1a73e8'}
                >
                  {googleLoading ? 'Processing...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
