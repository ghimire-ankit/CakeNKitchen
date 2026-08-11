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

  // Mock Google Login States
  const [showMockGoogle, setShowMockGoogle] = useState(false);
  const [mockStep, setMockStep] = useState('list'); // 'list', 'email'
  const [mockEmailInput, setMockEmailInput] = useState('');
  const [mockAccountsList, setMockAccountsList] = useState(() => {
    const saved = localStorage.getItem('mock_google_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) { }
    }
    return [
      { name: 'Ankit Ghimire', email: 'ankit@cakenkitchen.com' },
      { name: 'Demo Customer', email: 'demo.cust@gmail.com' }
    ];
  });

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

  const handleSelectMockAccount = (acc) => {
    handleGoogleSuccess({ credential: 'mock_google_id_token_' + Date.now() }, acc.name, acc.email);
    setShowMockGoogle(false);
  };

  const handleMockGoogleSubmit = (e) => {
    e.preventDefault();
    if (!mockEmailInput) return;
    const parts = mockEmailInput.split('@')[0].split(/[\._\-]/);
    const mockName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Google User';
    const newAcc = { name: mockName, email: mockEmailInput };
    const updated = [newAcc, ...mockAccountsList.filter(a => a.email !== mockEmailInput)];
    setMockAccountsList(updated);
    localStorage.setItem('mock_google_accounts', JSON.stringify(updated));
    handleGoogleSuccess({ credential: 'mock_google_id_token_' + Date.now() }, mockName, mockEmailInput);
    setShowMockGoogle(false);
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
            onClick={() => {
              if (mockAccountsList.length === 0) {
                setMockStep('email');
              } else {
                setMockStep('list');
              }
              setMockEmailInput('');
              setShowMockGoogle(true);
            }}
            id="google-signin-btn-mock"
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
              background: '#fff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>

      {showMockGoogle && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 9999, fontFamily: 'Roboto, Arial, sans-serif'
        }}>
          {/* Simulated Google Popup Browser Window */}
          <div style={{
            width: '440px',
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Window title bar */}
            <div style={{
              background: '#f1f3f4',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#3c4043',
              borderBottom: '1px solid #dadce0',
              userSelect: 'none'
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
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                <span style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => setShowMockGoogle(false)}>&times;</span>
              </div>
            </div>

            {/* Address Bar */}
            <div style={{
              background: '#f8f9fa',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #e8eaed'
            }}>
              <div style={{ display: 'flex', gap: '10px', color: '#5f6368', fontSize: '11px' }}>
                <span>←</span><span>→</span><span>↻</span>
              </div>
              <div style={{
                background: '#fff',
                fontSize: '11px',
                color: '#5f6368',
                padding: '3px 10px',
                borderRadius: '12px',
                border: '1px solid #dadce0',
                flex: 1,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ color: '#1a73e8' }}>🔒</span> accounts.google.com/o/oauth2/v2/auth?client_id=1019688537554-mockclientid123...
              </div>
            </div>

            {/* Google OAuth Page Content */}
            <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', minHeight: '380px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: '500', letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#4285F4' }}>G</span>
                  <span style={{ color: '#EA4335' }}>o</span>
                  <span style={{ color: '#FBBC05' }}>o</span>
                  <span style={{ color: '#4285F4' }}>g</span>
                  <span style={{ color: '#34A853' }}>l</span>
                  <span style={{ color: '#EA4335' }}>e</span>
                </span>
              </div>

              {mockStep === 'list' && (
                <>
                  <h3 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 8px 0', color: '#202124' }}>Choose an account</h3>
                  <p style={{ fontSize: '16px', color: '#5f6368', margin: '0 0 24px 0' }}>to continue to CakeNKitchen</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
                    {mockAccountsList.map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectMockAccount(acc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 4px',
                          border: 'none',
                          borderBottom: '1px solid #e8eaed',
                          background: 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: '#1a73e8', color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: '500', fontSize: '14px'
                        }}>
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#3c4043' }}>{acc.name}</span>
                          <span style={{ fontSize: '12px', color: '#5f6368' }}>{acc.email}</span>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => { setMockStep('email'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '16px 4px',
                        border: 'none',
                        borderBottom: '1px solid #e8eaed',
                        background: 'transparent',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#1a73e8',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        border: '1px solid #dadce0', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#5f6368'
                      }}>
                        +
                      </div>
                      Use another account
                    </button>
                  </div>

                  <p style={{ marginTop: 'auto', fontSize: '12px', color: '#5f6368', lineHeight: 1.5 }}>
                    To continue, Google will share your name, email address, language preference, and profile picture with CakeNKitchen.
                  </p>
                </>
              )}

              {mockStep === 'email' && (
                <form onSubmit={handleMockGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '24px', fontWeight: 400, margin: '0 0 8px 0', color: '#202124' }}>Sign in</h3>
                  <p style={{ fontSize: '16px', color: '#5f6368', margin: '0 0 24px 0' }}>to continue to CakeNKitchen</p>

                  <div style={{ position: 'relative', marginBottom: '24px', width: '100%' }}>
                    <input
                      type="email"
                      id="gd-email-mock"
                      value={mockEmailInput}
                      onChange={e => setMockEmailInput(e.target.value)}
                      placeholder="Email or phone"
                      required
                      style={{
                        width: '100%',
                        padding: '16px 14px',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        fontSize: '16px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (mockAccountsList.length > 0) {
                          setMockStep('list');
                        }
                      }}
                      disabled={mockAccountsList.length === 0}
                      style={{
                        background: 'none', border: 'none', color: '#1a73e8',
                        fontSize: '14px', fontWeight: 500, cursor: 'pointer',
                        opacity: mockAccountsList.length === 0 ? 0.5 : 1
                      }}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      style={{
                        background: '#1a73e8', border: 'none', color: '#fff',
                        padding: '10px 24px', borderRadius: '4px', fontSize: '14px',
                        fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#1557b0'}
                      onMouseOut={e => e.currentTarget.style.background = '#1a73e8'}
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
