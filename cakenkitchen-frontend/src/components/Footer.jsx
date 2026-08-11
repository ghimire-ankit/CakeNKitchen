import { Link } from 'react-router-dom';
import '../styles/footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main wrap">

        {/* Brand Column */}
        <div className="foot-brand">
          <Link to="/" className="foot-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
            <img src="/logo.png" alt="Cake & Kitchen Logo" style={{ height: '48px', objectFit: 'contain' }} />
            <span style={{ fontSize: '1.25rem', fontFamily: 'var(--f-display)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '0.5px' }}>Cake & Kitchen</span>
          </Link>
          <p className="foot-desc">
            Handcrafted cakes and pastries made fresh every morning from organic, locally-sourced ingredients. Your celebration deserves nothing less.
          </p>
          <div className="foot-socials">
            <a href="https://www.facebook.com/cakeNkitchencafeofficial" target="_blank" rel="noreferrer" aria-label="Facebook" className="foot-social">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="foot-social">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
            </a>
            <a href="https://wa.me/9779806461461" target="_blank" rel="noreferrer" aria-label="WhatsApp" className="foot-social">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.885 3.49" />
              </svg>
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div className="foot-col">
          <h4>Explore</h4>
          <nav>
            <Link to="/">Home</Link>
            <a href="#about-section" onClick={e => { e.preventDefault(); document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }); }}>Our Story</a>
            <a href="#shop-menu" onClick={e => { e.preventDefault(); document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' }); }}>Cake Menu</a>
            <Link to="/cart">My Cart</Link>
            <Link to="/register">Create Account</Link>
          </nav>
        </div>

        {/* Collections Links */}
        <div className="foot-col">
          <h4>Collections</h4>
          <nav>
            <a href="#shop-menu">Anniversary Cakes</a>
            <a href="#shop-menu">Birthday Cakes</a>
            <a href="#shop-menu">Wedding Tiers</a>
            <a href="#shop-menu">Engagement</a>
            <a href="#shop-menu">Pastries & Confections</a>
          </nav>
        </div>

        {/* Contact info with high-end matching inline SVGs */}
        <div className="foot-col">
          <h4>Contact Us</h4>
          <div className="foot-contacts-list">
            <div className="foot-contact-item">
              <span className="foot-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </span>
              <a href="tel:+9779806461461">+977 980-6461461</a>
            </div>

            <div className="foot-contact-item">
              <span className="foot-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <a href="mailto:hello@cakenkitchen.com">hello@cakenkitchen.com</a>
            </div>

            <div className="foot-contact-item">
              <span className="foot-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </span>
              <a href="https://www.facebook.com/cakeNkitchencafeofficial" target="_blank" rel="noreferrer">facebook.com/cakeNkitchen...</a>
            </div>

            <div className="foot-contact-item align-top">
              <span className="foot-contact-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span>Dhangadhi-4, Chauraha,<br />Main Road, Nepal</span>
            </div>
          </div>

          <div className="foot-hours-mini">
            <div className="foot-hours-row">
              <span>Mon–Sat</span>
              <strong>7:00 AM – 9:30 PM</strong>
            </div>
            <div className="foot-hours-row">
              <span>Sunday</span>
              <strong>8:00 AM – 9:00 PM</strong>
            </div>
          </div>
        </div>

      </div>

      <div className="footer-bar">
        <div className="footer-bar-inner wrap">
          <div className="footer-left-links">
            <span>© {new Date().getFullYear()} Cake & Kitchen Patisserie. All rights reserved.</span>
            <span className="footer-dot-divider">·</span>
            <Link to="/">Privacy Policy</Link>
            <span className="footer-dot-divider">·</span>
            <Link to="/">Terms of Service</Link>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="back-to-top-btn"
          >
            Back to top
            <span className="up-arrow-box">↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
