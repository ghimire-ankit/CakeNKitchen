import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar({ user, logout, cartCount, searchQuery, setSearchQuery, selectedCat, setSelectedCat }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goMenu = (catId) => {
    setMenuOpen(false);
    setSelectedCat(catId);
    if (location.pathname !== '/') navigate('/');
    else setTimeout(() => document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <>
      {/* Top info bar */}
      <div className="topbar">
        <div className="topbar-inner wrap">
          <span>📞 +977 980-6461461 &nbsp;|&nbsp; ✉ hello@cakenkitchen.com</span>
          <span>🎁 Free delivery on orders above NPR 2,000 &nbsp;·&nbsp; Use code <strong>CAKE10</strong> for 10% off</span>
        </div>
      </div>

      {/* Primary Nav */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="main-nav">
        <div className="nav-wrap wrap">

          {/* Logo */}
          <Link to="/" className="nav-logo" id="nav-logo">
            <img src="/logo.png" alt="Cake & Kitchen" style={{ height: '50px', objectFit: 'contain' }} />
          </Link>

          {/* Desktop links */}
          <nav className="nav-links" aria-label="Primary">
            <Link to="/" className="nav-link">Home</Link>
            <button className="nav-link" onClick={() => scrollTo('about-section')}>About</button>
            <button className="nav-link" onClick={() => scrollTo('shop-menu')}>Menu</button>
            <button className="nav-link" onClick={() => goMenu(3)}>Weddings</button>
            <Link to="/custom-cake" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Build Cake</Link>
            {user && <Link to="/my-orders" className="nav-link" id="nav-my-orders">My Orders</Link>}
            <button className="nav-link" onClick={() => scrollTo('hours-section')}>Visit Us</button>
            {user?.role === 'admin' && <Link to="/admin" className="nav-link" id="nav-admin">Admin</Link>}
          </nav>

          {/* Right side */}
          <div className="nav-right">
            {/* Search */}
            <div className="nav-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search cakes..."
                value={searchQuery || ''}
                onChange={e => { setSearchQuery(e.target.value); if (location.pathname !== '/') navigate('/'); }}
                aria-label="Search cakes"
                id="nav-search-input"
              />
            </div>

            {/* Auth */}
            {user ? (
              <>
                <span className="nav-username">Hi, {user.name?.split(' ')[0]}</span>
                <button onClick={() => { logout(); navigate('/'); }} className="nav-text-btn" id="btn-logout">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="nav-text-btn" id="nav-login">Sign in</Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="nav-cart" id="nav-cart" aria-label={`Cart (${cartCount})`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              Order Online
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* Hamburger */}
            <button
              className={`hamburger${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              <span /><span />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/" className="mobile-link">Home</Link>
            <button className="mobile-link" onClick={() => scrollTo('about-section')}>About</button>
            <button className="mobile-link" onClick={() => scrollTo('shop-menu')}>Menu</button>
            <button className="mobile-link" onClick={() => goMenu(3)}>Weddings</button>
            <Link to="/custom-cake" className="mobile-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Build Cake</Link>
            {user && <Link to="/my-orders" className="mobile-link">My Orders</Link>}
            <button className="mobile-link" onClick={() => scrollTo('hours-section')}>Visit Us</button>
            {user ? (
              <button className="mobile-link" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
            ) : (
              <Link to="/login" className="mobile-link">Sign in</Link>
            )}
            <Link to="/cart" className="mobile-link">Cart ({cartCount})</Link>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;
