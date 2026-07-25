import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, logout, cartCount }) {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const options = {
          timeZone: 'Asia/Kathmandu',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        setTimeStr(formatter.format(new Date()));
      } catch (e) {
        // Fallback if client lacks Intl TZ database
        setTimeStr(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="brand-logo" id="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          {!logoFailed && (
            <img
              src="/logo.png"
              alt="Logo"
              className="brand-logo-img"
              onError={() => setLogoFailed(true)}
            />
          )}
          <span>Cake And Kitchen</span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link" id="nav-home">Home</Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link" id="nav-admin">Admin Portal</Link>
          )}
          <Link to="/cart" className="nav-link" id="nav-cart">
            <span className="cart-icon-wrapper">
              Cart
              {cartCount > 0 && <span className="cart-badge" id="cart-counter">{cartCount}</span>}
            </span>
          </Link>
          {user ? (
            <>
              <span style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hi, <strong>{user.name}</strong></span>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-secondary"
                style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 800 }}
                id="btn-logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" id="nav-login">Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }} id="nav-signup">Sign Up</Link>
            </>
          )}

          {/* Real-time green Nepal clock */}
          <div className="nepal-clock" id="nepal-time-clock" style={{ marginLeft: '0.5rem' }}>
            🟢 {timeStr}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
