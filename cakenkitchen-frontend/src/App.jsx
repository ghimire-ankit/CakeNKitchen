import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loginUser, registerUser, fetchCategories, fetchCakes, fetchCakeById } from './services/api';
import './App.css';

// Helper to resolve absolute or relative image paths (WhatsApp/Admin/Unsplash)
const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Map category baseline relative names to illustrative Unsplash pictures
  if (url === 'wedding_category.jpg') return 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60';
  if (url === 'chocolate_category.jpg') return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
  if (url === 'fruit_category.jpg') return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60';

  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  return `${backendBase}/uploads/${url}`;
};

// ============ MAIN APP ============
function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', link: '' });

  // Load user token and cart from local storage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Update local storage whenever cart changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleLogin = (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
    setCart([]);
    setDiscountPercent(0);
    setCouponCode('');
  };

  const addToCart = (cake, qty, size, message) => {
    const existingIndex = cart.findIndex(
      item => item.cake_id === cake.cake_id && item.size === size && item.message === message
    );

    let updatedCart = [...cart];
    // Calculate price based on weight/size
    const sizeMultiplier = size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0;
    const itemPrice = Math.round(Number(cake.base_price) * sizeMultiplier);

    if (existingIndex > -1) {
      updatedCart[existingIndex].qty += qty;
    } else {
      updatedCart.push({
        cake_id: cake.cake_id,
        name: cake.name,
        price: itemPrice,
        base_price: Number(cake.base_price),
        image_url: cake.image_url,
        qty,
        size,
        message
      });
    }
    saveCart(updatedCart);

    // Trigger toast notification
    setToast({
      visible: true,
      message: `${cake.name} (${size}) added to Cart`,
      link: '/cart'
    });
    setTimeout(() => {
      setToast(prev => {
        if (prev.message === `${cake.name} (${size}) added to Cart`) {
          return { ...prev, visible: false };
        }
        return prev;
      });
    }, 4000);
  };

  const applyCoupon = (code) => {
    if (code.toUpperCase() === 'CAKE10') {
      setDiscountPercent(10);
      setCouponCode('CAKE10');
      return { success: true, message: 'CAKE10 coupon applied (10% discount)' };
    }
    return { success: false, message: 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setCouponCode('');
  };

  const updateCartQty = (cake_id, size, message, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cake_id, size, message);
      return;
    }
    const updatedCart = cart.map(item => {
      if (item.cake_id === cake_id && item.size === size && item.message === message) {
        return { ...item, qty: newQty };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const removeFromCart = (cake_id, size, message) => {
    const updatedCart = cart.filter(
      item => !(item.cake_id === cake_id && item.size === size && item.message === message)
    );
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
    setDiscountPercent(0);
    setCouponCode('');
  };

  // Cart total items helper
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <Navbar user={user} logout={handleLogout} cartCount={cartCount} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cake/:id" element={<CakeDetail addToCart={addToCart} />} />
          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                updateCartQty={updateCartQty}
                removeFromCart={removeFromCart}
                discountPercent={discountPercent}
                couponCode={couponCode}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <Checkout
                cart={cart}
                clearCart={clearCart}
                user={user}
                discountPercent={discountPercent}
                couponCode={couponCode}
              />
            }
          />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />

      {/* Floating Toast Notification */}
      {toast.visible && (
        <div className="toast-success-banner" id="toast-notify">
          <span className="toast-message">{toast.message}</span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Link to="/cart" className="toast-link" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>View Cart</Link>
            <button className="toast-close-btn" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>✕</button>
          </div>
        </div>
      )}
    </Router>
  );
}

// ============ NAVBAR ============
function Navbar({ user, logout, cartCount }) {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link to="/" className="brand-logo" id="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
          {!logoFailed ? (
            <img
              src="/logo.png"
              alt="Logo"
              className="brand-logo-img"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span>Cake & Kitchen</span>
          )}
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link" id="nav-home">Home</Link>
          <Link to="/admin" className="nav-link" id="nav-admin">Admin Portal</Link>
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
        </nav>
      </div>
    </header>
  );
}

// ============ FOOTER ============
function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Cake & Kitchen</h3>
          <p style={{ marginTop: '0.5rem' }}>Indulge in artisanal cakes crafted with fresh gourmet ingredients. Add sweetness to your celebrations.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul style={{ marginTop: '0.5rem' }}>
            <li><Link to="/">Browse Shop</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/login">Account Login</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p style={{ marginTop: '0.5rem' }}>Dhangadhi, Kailali, Sudurpaschim</p>
          <p>Phone: +977 980-6461461</p>
          <p>Email: support@cakenkitchen.com</p>
          <div style={{ marginTop: '1.2rem', display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
            <a
              href="https://wa.me/9779806461461"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#a3a19d', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
              title="Chat on WhatsApp"
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.querySelector('svg').style.fill = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#a3a19d'; e.currentTarget.querySelector('svg').style.fill = '#a3a19d'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#a3a19d" style={{ transition: 'fill 0.2s' }}>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.727-1.458L0 24zm6.59-4.846c1.6.95 3.1 1.455 4.7 1.456 5.487 0 9.954-4.466 9.957-9.95.002-2.658-1.03-5.155-2.9-7.03-1.87-1.872-4.364-2.903-7.027-2.904-5.49 0-9.96 4.467-9.963 9.956-.001 2.015.497 3.992 1.442 5.71L1.1 21.13l5.548-1.452l-.001-.225zm9.956-6.177c-.297-.15-1.758-.868-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="https://www.facebook.com/razan.dhanusha"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#a3a19d', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
              title="Visit Instagram"
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.querySelector('svg').style.fill = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#a3a19d'; e.currentTarget.querySelector('svg').style.fill = '#a3a19d'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#a3a19d" style={{ transition: 'fill 0.2s' }}>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              </svg>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/razan.dhanusha"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#a3a19d', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}
              title="Visit Facebook"
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.querySelector('svg').style.fill = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#a3a19d'; e.currentTarget.querySelector('svg').style.fill = '#a3a19d'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#a3a19d" style={{ transition: 'fill 0.2s' }}>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Cake & Kitchen. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

// ============ HOME ============
function Home() {
  const [categories, setCategories] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const catRes = await fetchCategories();
        if (catRes.success) setCategories(catRes.data);

        const cakeRes = await fetchCakes();
        if (cakeRes.success) {
          const apiCakes = cakeRes.data || [];
          const customCakes = JSON.parse(localStorage.getItem('cakenk_custom_cakes') || '[]');
          setCakes([...customCakes, ...apiCakes]);
        }
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const selectCategory = async (catId) => {
    setSelectedCat(catId);
    try {
      const response = await fetchCakes(catId);
      if (response.success) {
        const apiCakes = response.data || [];
        const customCakes = JSON.parse(localStorage.getItem('cakenk_custom_cakes') || '[]');
        const filteredCustom = catId ? customCakes.filter(c => c.cat_id === catId) : customCakes;
        setCakes([...filteredCustom, ...apiCakes]);
      }
    } catch (err) {
      console.error('Error filtering cakes:', err);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.cat_id === catId);
    return cat ? cat.name : 'Delicious Cakes';
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Express Yourself in <span>Sweetness</span></h1>
          <p>We craft stunning, delicious customized cakes ready for your special occasions and midnight surprises. Baked freshly on order.</p>
          <a href="#shop-menu" className="btn-primary" id="hero-cta-btn">Order Online</a>
        </div>
        <div className="hero-image-wrapper">
          <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80" alt="Special Chocolate Fudge Cake decoration" />
        </div>
      </section>

      {/* Category Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="category-title-section">
          <h2>Select Cake Category</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>
        ) : (
          <div className="category-grid">
            <div
              className={`category-card ${selectedCat === null ? 'active' : ''}`}
              onClick={() => selectCategory(null)}
              id="cat-filter-all"
            >
              <img src="https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=150&auto=format&fit=crop&q=60" alt="All categories" />
              <h3>All Flavors</h3>
              <p>Explore our entire handcrafted catalogue</p>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.cat_id}
                className={`category-card ${selectedCat === cat.cat_id ? 'active' : ''}`}
                onClick={() => selectCategory(cat.cat_id)}
                id={`cat-filter-${cat.cat_id}`}
              >
                <img src={getImageUrl(cat.image_url)} alt={cat.name} />
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products Cake Grid */}
      <section id="shop-menu">
        <div className="cakes-section-header">
          <h2>{selectedCat === null ? 'Featured Collection' : getCategoryName(selectedCat)}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cakes.length} cakes available
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Fetching cakes...</div>
        ) : cakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-light)' }}>
            No cakes found in this category.
          </div>
        ) : (
          <div className="cakes-grid">
            {cakes.map((cake) => (
              <div className="cake-card" key={cake.cake_id} id={`cake-card-${cake.cake_id}`}>
                <div className="cake-image-container">
                  <img src={getImageUrl(cake.image_url)} alt={cake.name} />
                  <span className="cake-badge">Premium</span>
                </div>
                <div className="cake-card-body">
                  <h3 className="cake-title">{cake.name}</h3>
                  <p className="cake-desc">{cake.description}</p>
                  <div className="cake-footer">
                    <span className="cake-price">NPR {cake.base_price}</span>
                    <Link to={`/cake/${cake.cake_id}`} className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }} id={`btn-view-${cake.cake_id}`}>
                      Customize
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ============ CAKE DETAIL ============
function CakeDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('1 lb'); // Options: 1 lb, 2 lbs, 3 lbs
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadCake = async () => {
      try {
        setLoading(true);
        const res = await fetchCakeById(id);
        if (res.success) {
          setCake(res.data);
        }
      } catch (err) {
        console.error('Error fetching cake detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCake();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading cake profile...</div>;
  }

  if (!cake) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Cake Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1.5rem' }}>Back to Home</button>
      </div>
    );
  }

  // Calculate pricing based on sizes
  const sizeMultiplier = size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0;
  const currentPrice = Math.round(Number(cake.base_price) * sizeMultiplier);

  const handleAddToCart = () => {
    addToCart(cake, qty, size, message);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="detail-container" id="cake-detail-view">
      <div className="detail-gallery">
        <div className="cake-preview-container">
          <img src={getImageUrl(cake.image_url)} alt={cake.name} className="cake-preview-image" />
          {message.trim() && (
            <svg viewBox="0 0 400 400" className="cake-text-overlay-svg" id="cake-preview-text-svg">
              <defs>
                <path id="cakeTextArc" d="M 60,220 A 140,140 0 0,1 340,220" />
              </defs>
              <text>
                <textPath href="#cakeTextArc" startOffset="50%" textAnchor="middle">
                  {message}
                </textPath>
              </text>
            </svg>
          )}
        </div>
      </div>
      <div className="detail-info">
        <span className="detail-category">Artisanal Choice</span>
        <h1 className="detail-title">{cake.name}</h1>
        <div className="detail-price" id="detail-price-display">NPR {currentPrice}</div>
        <p className="detail-description">{cake.description}</p>

        {/* Custom size weight customization */}
        <div className="option-group">
          <span className="option-label">Weight Size:</span>
          <div className="size-select-buttons">
            {['1 lb', '2 lbs', '3 lbs'].map((s) => (
              <button
                key={s}
                className={`size-btn ${size === s ? 'active' : ''}`}
                onClick={() => setSize(s)}
                id={`size-opt-${s.replace(' ', '')}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Message on Cake customization */}
        <div className="option-group">
          <label className="option-label" htmlFor="cake-text-msg">Cake Custom Text Message:</label>
          <input
            type="text"
            id="cake-text-msg"
            placeholder="E.g., Happy Birthday Ankit"
            className="form-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <small style={{ color: 'var(--text-light)', marginTop: '0.35rem', display: 'block', fontSize: '0.78rem' }}>Max 35 characters written in chocolate cream.</small>
        </div>

        {/* Quantity Selection */}
        <div className="option-group">
          <span className="option-label">Quantity:</span>
          <div className="quantity-controller">
            <button className="quantity-btn" onClick={() => setQty(Math.max(1, qty - 1))} id="btn-qty-dec">-</button>
            <span className="quantity-value" id="qty-val">{qty}</span>
            <button className="quantity-btn" onClick={() => setQty(qty + 1)} id="btn-qty-inc">+</button>
          </div>
        </div>

        <div className="actions-row">
          <button
            onClick={handleAddToCart}
            className="btn-primary"
            style={{ flex: 1, padding: '1rem' }}
            id="btn-add-to-cart"
          >
            {added ? 'Added to Cart' : 'Add to Basket'}
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '1rem' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ============ CART ============
function Cart({ cart, updateCartQty, removeFromCart, discountPercent, couponCode, applyCoupon, removeCoupon }) {
  const navigate = useNavigate();
  const [couponFeedback, setCouponFeedback] = useState({ text: '', type: '' });

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const deliveryCharge = cartTotal > 0 ? 100 : 0;
  const grandTotal = cartTotal - discountAmount + deliveryCharge;

  const handleApplyCouponSubmit = (e) => {
    e.preventDefault();
    const val = e.target.coupon.value;
    if (!val) return;
    const res = applyCoupon(val);
    if (res.success) {
      setCouponFeedback({ text: res.message, type: 'success' });
      e.target.reset();
    } else {
      setCouponFeedback({ text: res.message, type: 'error' });
    }
  };

  return (
    <div>
      <h1 className="cart-header">Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="cart-items-panel cart-empty-message">
          <h2 style={{ fontFamily: 'var(--serif)' }}>Your basket is empty.</h2>
          <p style={{ margin: '1rem 0 2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>Add some delicious cakes from our flavors list to get started.</p>
          <button onClick={() => navigate('/')} className="btn-primary" id="btn-back-shop">Browse Menu</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-panel">
            {cart.map((item, index) => (
              <div className="cart-item" key={index} id={`cart-item-${item.cake_id}`}>
                <img src={item.image_url} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-specification">
                    <span>Size: <strong>{item.size}</strong></span>
                    {item.message && <span style={{ marginLeft: '1.5rem' }}>Cream Text: <em>"{item.message}"</em></span>}
                  </div>
                  <div className="cart-item-price">NPR {item.price} each</div>
                </div>
                <div className="cart-item-right">
                  <div className="quantity-controller">
                    <button className="quantity-btn" onClick={() => updateCartQty(item.cake_id, item.size, item.message, item.qty - 1)}>-</button>
                    <span className="quantity-value">{item.qty}</span>
                    <button className="quantity-btn" onClick={() => updateCartQty(item.cake_id, item.size, item.message, item.qty + 1)}>+</button>
                  </div>
                  <button
                    className="cart-item-remove-btn"
                    onClick={() => removeFromCart(item.cake_id, item.size, item.message)}
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary-panel">
            <h3 className="summary-title">Order Pricing</h3>
            <div className="summary-row">
              <span>Cart Subtotal</span>
              <span id="price-subtotal">NPR {cartTotal}</span>
            </div>

            {discountPercent > 0 && (
              <div className="summary-row" style={{ color: '#2e7d32', fontWeight: 700 }}>
                <span>Discount ({discountPercent}%) <span className="coupon-badge">{couponCode}</span></span>
                <span>- NPR {discountAmount}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Standard Delivery</span>
              <span id="price-delivery">NPR {deliveryCharge}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span id="price-grandtotal">NPR {grandTotal}</span>
            </div>

            {/* Promo Code Fields */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.2rem' }}>
              <span className="option-label">Have a Promo Code?</span>
              {couponCode ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 700 }}>Coupon CAKE10 Active</span>
                  <button
                    onClick={() => { removeCoupon(); setCouponFeedback({ text: '', type: '' }); }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="coupon-input-group">
                  <input
                    type="text"
                    name="coupon"
                    placeholder="Enter coupon (e.g. CAKE10)"
                    className="coupon-field"
                    id="coupon-field-input"
                  />
                  <button type="submit" className="coupon-btn" id="btn-coupon-apply">Apply</button>
                </form>
              )}
              {couponFeedback.text && (
                <div
                  className="coupon-feedback-msg"
                  style={{ color: couponFeedback.type === 'success' ? '#2e7d32' : 'var(--error)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.4rem' }}
                >
                  {couponFeedback.text}
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary btn-block"
              style={{ marginTop: '1.5rem', padding: '1rem' }}
              id="btn-go-checkout"
            >
              Confirm & Checkout
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary btn-block"
              style={{ marginTop: '0.8rem', padding: '0.8rem' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ CHECKOUT ============
function Checkout({ cart, clearCart, user, discountPercent, couponCode }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '12:00 PM',
    note: ''
  });
  const [completed, setCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if cart is empty and not finished checkout
    if (cart.length === 0 && !completed) {
      navigate('/cart');
    }
  }, [cart, completed, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate placing order
    setTimeout(() => {
      const generatedId = 'CKN-' + Math.floor(1000 + Math.random() * 9000);

      // Save order to Local Storage for Admin Dashboard
      const orderRecord = {
        order_id: generatedId,
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        delivery_date: form.deliveryDate,
        delivery_time: form.deliveryTime,
        notes: form.note,
        total: grandTotal,
        status: 'Pending',
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        items: cart.map(item => ({
          name: item.name,
          qty: item.qty,
          size: item.size,
          message: item.message || '',
          price: item.price
        }))
      };

      try {
        const existingOrders = JSON.parse(localStorage.getItem('cakenk_orders') || '[]');
        existingOrders.unshift(orderRecord);
        localStorage.setItem('cakenk_orders', JSON.stringify(existingOrders));
      } catch (err) {
        console.error('Failed to save order to localStorage:', err);
      }

      setOrderId(generatedId);
      setCompleted(true);
      clearCart();
      setSubmitting(false);
    }, 1500);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const deliveryCharge = 100;
  const grandTotal = cartTotal - discountAmount + deliveryCharge;

  if (completed) {
    return (
      <div className="success-card" id="checkout-success-view">
        <div className="success-icon">✓</div>
        <h2>Order Confirmed</h2>
        <p>Thank you for shopping. Your order reference token is <strong>{orderId}</strong>.</p>
        <div style={{ textAlign: 'left', background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '0', marginBottom: '2rem', border: '1px solid var(--primary)' }}>
          <p style={{ marginBottom: '0.5rem' }}><strong>Deliver to:</strong> {form.address}</p>
          <p style={{ marginBottom: '0.5rem' }}><strong>Scheduled Date:</strong> {form.deliveryDate} at {form.deliveryTime}</p>
          <p><strong>Status:</strong> Baker is preparing details.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary" id="btn-success-home">Browse More Cakes</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cart-header">Schedule Delivery & Checkout</h1>
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="cart-items-panel" id="checkout-details-form">
          <h3 className="summary-title" style={{ borderBottom: 'none', marginBottom: '1.2rem' }}>Delivery Information</h3>

          <div className="checkout-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="chk-name">Your Full Name</label>
              <input
                id="chk-name"
                name="name"
                type="text"
                className="form-input"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-email">Email Address</label>
              <input
                id="chk-email"
                name="email"
                type="email"
                className="form-input"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-phone">Phone Number</label>
              <input
                id="chk-phone"
                name="phone"
                type="tel"
                placeholder="E.g., 98XXXXXXXX"
                className="form-input"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-address">Detailed Shipping Address</label>
              <input
                id="chk-address"
                name="address"
                type="text"
                placeholder="House No, Street, Ward, Area"
                className="form-input"
                required
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-date">Select Delivery Date</label>
              <input
                id="chk-date"
                name="deliveryDate"
                type="date"
                className="form-input"
                required
                min={new Date().toISOString().split('T')[0]}
                value={form.deliveryDate}
                onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-time">Preferred Time Slot</label>
              <select
                id="chk-time"
                className="form-input"
                value={form.deliveryTime}
                onChange={e => setForm({ ...form, deliveryTime: e.target.value })}
              >
                <option value="9:00 AM - 12:00 PM">Morning (9:00 AM - 12:00 PM)</option>
                <option value="12:00 PM - 3:00 PM">Midday (12:00 PM - 3:00 PM)</option>
                <option value="3:00 PM - 6:00 PM">Afternoon (3:00 PM - 6:00 PM)</option>
                <option value="6:00 PM - 9:00 PM">Evening (6:00 PM - 9:00 PM)</option>
              </select>
            </div>
            <div className="form-group span-2">
              <label className="form-label" htmlFor="chk-note">Special Baker Customization Notes</label>
              <textarea
                id="chk-note"
                className="form-input"
                style={{ resize: 'vertical', minHeight: '80px' }}
                placeholder="E.g., eggless, less sweet, message card info..."
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            style={{ padding: '1rem', marginTop: '1rem' }}
            disabled={submitting}
            id="btn-submit-order"
          >
            {submitting ? 'Placing Order...' : `Confirm Order (Pay NPR ${grandTotal} on Delivery)`}
          </button>
        </form>

        <div className="cart-summary-panel">
          <h3 className="summary-title">Summary Review</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {cart.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-light)' }}>
                <span><strong>{item.qty}x</strong> {item.name} ({item.size})</span>
                <span>NPR {item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>NPR {cartTotal}</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row" style={{ color: '#2e7d32', fontWeight: 700 }}>
              <span>Coupon Discount <span className="coupon-badge">{couponCode}</span></span>
              <span>- NPR {discountAmount}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping</span>
            <span>NPR {deliveryCharge}</span>
          </div>
          <div className="summary-row total">
            <span>Amount Due</span>
            <span>NPR {grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ LOGIN ============
function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

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
      setMsg({
        text: err.response?.data?.error || 'Invalid credentials. Please attempt again.',
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

// ============ REGISTER ============
function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await registerUser(form);
      setMsg({ text: 'Account registered successfully. Proceeding to login...', type: 'success' });
      setForm({ name: '', email: '', phone: '', password: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg({
        text: err.response?.data?.error || 'Registration failed. Check parameters and try again.',
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
      <div className="form-link-row">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Tab control
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'cakes'

  // Add cake form state
  const [cakeForm, setCakeForm] = useState({
    name: '',
    description: '',
    base_price: '',
    cat_id: 1,
    image_url: '',
    is_available: true
  });

  const [feedback, setFeedback] = useState('');

  // Initial load
  useEffect(() => {
    // 1. Load orders (localStorage fallback to defaultMockOrders)
    const localOrders = localStorage.getItem('cakenk_orders');
    if (localOrders) {
      setOrders(JSON.parse(localOrders));
    } else {
      const defaultMockOrders = [
        {
          order_id: 'CKN-8451',
          customer_name: 'Ankit Ghimire',
          email: 'ankit@domain.com',
          phone: '9841234567',
          address: 'Dhangadhi Main Road, Ward 4',
          delivery_date: '2026-07-06',
          delivery_time: '12:00 PM - 3:00 PM',
          notes: 'Eggless, write "Happy Birthday Ankit" on top.',
          total: 850,
          status: 'Pending',
          created_at: '2026-07-04 18:30:15',
          items: [{ name: 'Midnight Chocolate Fudge', qty: 1, size: '1 lb', price: 750 }]
        },
        {
          order_id: 'CKN-3214',
          customer_name: 'Jeevan Joshi',
          email: 'jeevan@domain.com',
          phone: '9807654321',
          address: 'Hasanpur, Dhangadhi',
          delivery_date: '2026-07-07',
          delivery_time: '3:00 PM - 6:00 PM',
          notes: 'Less sweet.',
          total: 2600,
          status: 'Preparing',
          created_at: '2026-07-04 15:45:00',
          items: [{ name: 'White Orchid Elegant Tier', qty: 1, size: '3 lbs', price: 2500 }]
        }
      ];
      localStorage.setItem('cakenk_orders', JSON.stringify(defaultMockOrders));
      setOrders(defaultMockOrders);
    }

    // 2. Load Categories
    fetchCategories().then(res => {
      if (res.data) setCategories(res.data);
    });

    // 3. Load Cakes (fetch API first, merge with custom ones from localStorage)
    fetchCakes().then(res => {
      const apiCakes = res.data || [];
      const customCakes = JSON.parse(localStorage.getItem('cakenk_custom_cakes') || '[]');
      setCakes([...customCakes, ...apiCakes]);
    });
  }, []);

  // Update order status
  const handleUpdateStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(o => {
      if (o.order_id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem('cakenk_orders', JSON.stringify(updatedOrders));
  };

  // Add new cake
  const handleAddCake = (e) => {
    e.preventDefault();
    if (!cakeForm.name || !cakeForm.base_price) return;

    const newCake = {
      cake_id: 'CUST-' + Math.floor(100 + Math.random() * 900),
      name: cakeForm.name,
      description: cakeForm.description,
      base_price: parseFloat(cakeForm.base_price),
      cat_id: parseInt(cakeForm.cat_id),
      image_url: cakeForm.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      is_available: cakeForm.is_available
    };

    const customCakes = JSON.parse(localStorage.getItem('cakenk_custom_cakes') || '[]');
    customCakes.unshift(newCake);
    localStorage.setItem('cakenk_custom_cakes', JSON.stringify(customCakes));

    setCakes([newCake, ...cakes]);
    setFeedback('Cake item successfully added to catalog.');
    setCakeForm({
      name: '',
      description: '',
      base_price: '',
      cat_id: 1,
      image_url: '',
      is_available: true
    });
    setTimeout(() => setFeedback(''), 3000);
  };

  // Toggle availability of local cake list
  const toggleAvailability = (cakeId) => {
    const updatedCakes = cakes.map(c => {
      if (c.cake_id === cakeId) {
        return { ...c, is_available: !c.is_available };
      }
      return c;
    });
    setCakes(updatedCakes);

    // Save to custom ones if it is custom
    if (typeof cakeId === 'string' && cakeId.startsWith('CUST-')) {
      const customCakes = JSON.parse(localStorage.getItem('cakenk_custom_cakes') || '[]');
      const updatedCustom = customCakes.map(c => {
        if (c.cake_id === cakeId) {
          return { ...c, is_available: !c.is_available };
        }
        return c;
      });
      localStorage.setItem('cakenk_custom_cakes', JSON.stringify(updatedCustom));
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="admin-container" style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 className="cart-header" style={{ marginBottom: '0.5rem' }}>Bakery Control Center</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Manage orders, monitor metrics, and add catalog items for presentation.</p>

      {/* Analytics Dashboard Grid */}
      <div className="checkout-grid" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>Total Orders</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', fontFamily: 'var(--serif)' }}>{orders.length}</h2>
        </div>
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>Completed Sales</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', fontFamily: 'var(--serif)', color: 'var(--success)' }}>
            NPR {totalRevenue}
          </h2>
        </div>
        <div style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'var(--bg-card)' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-light)' }}>Active Catalog</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', fontFamily: 'var(--serif)' }}>{cakes.length} Cakes</h2>
        </div>
      </div>

      {/* Tab Switchers */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '2px solid var(--accent)' : '2px solid transparent',
            padding: '0.8rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 700,
            color: activeTab === 'orders' ? 'var(--text-dark)' : 'var(--text-light)',
            fontSize: '0.9rem',
            letterSpacing: '0.5px'
          }}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('cakes')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'cakes' ? '2px solid var(--accent)' : '2px solid transparent',
            padding: '0.8rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 700,
            color: activeTab === 'cakes' ? 'var(--text-dark)' : 'var(--text-light)',
            fontSize: '0.9rem',
            letterSpacing: '0.5px'
          }}
        >
          Manage Catalog Items ({cakes.length})
        </button>
      </div>

      {/* Tab Panel 1: Orders list */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <p>No customer orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((order, i) => (
                <div key={order.order_id} style={{ border: '1px solid var(--border)', padding: '1.5rem', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase' }}>Reference:</span>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{order.order_id}</h3>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', textTransform: 'uppercase', display: 'block', textAlign: 'right' }}>Order Date:</span>
                      <span style={{ fontSize: '0.85rem' }}>{order.created_at}</span>
                    </div>
                  </div>

                  <div className="checkout-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Customer Info */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Delivery Info</h4>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Name:</strong> {order.customer_name}</p>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {order.phone}</p>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Address:</strong> {order.address}</p>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Schedule:</strong> {order.delivery_date} ({order.delivery_time})</p>
                      {order.notes && <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: 'var(--accent)', fontStyle: 'italic' }}><strong>Notes:</strong> {order.notes}</p>}
                    </div>

                    {/* Ordered Items */}
                    <div>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Products</h4>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ padding: '0.4rem 0', borderBottom: '1px dashed var(--border-light)', fontSize: '0.85rem' }}>
                          <span><strong>{item.qty}x</strong> {item.name} ({item.size})</span>
                          {item.message && <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginLeft: '1.5rem' }}>Piping message: "{item.message}"</div>}
                        </div>
                      ))}
                      <div style={{ marginTop: '0.8rem', fontWeight: 800, fontSize: '0.9rem' }}>
                        Total Paid: NPR {order.total}
                      </div>
                    </div>

                    {/* Status Controller */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-light)' }}>Update Fulfillment Status</h4>

                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                        {['Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(order.order_id, st)}
                            style={{
                              padding: '0.4rem 0.6rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              border: '1px solid var(--border)',
                              borderRadius: '0',
                              background: order.status === st ? 'var(--primary)' : 'var(--bg-card)',
                              color: order.status === st ? 'var(--text-white)' : 'var(--text-dark)'
                            }}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel 2: Cakes list + Add Cake Form */}
      {activeTab === 'cakes' && (
        <div className="checkout-layout">
          {/* Add Cake Form */}
          <form onSubmit={handleAddCake} className="cart-items-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <h3 className="summary-title" style={{ borderBottom: 'none', marginBottom: '1rem' }}>Introduce New Cake Option</h3>

            {feedback && <div style={{ background: 'var(--bg-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>{feedback}</div>}

            <div className="form-group">
              <label className="form-label">Cake Name</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="E.g., Sweet Vanilla Dream"
                value={cakeForm.name}
                onChange={e => setCakeForm({ ...cakeForm, name: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: '0.8rem' }}>
              <label className="form-label">Base Price (NPR)</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="E.g., 900"
                value={cakeForm.base_price}
                onChange={e => setCakeForm({ ...cakeForm, base_price: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: '0.8rem' }}>
              <label className="form-label">Category Group</label>
              <select
                className="form-input"
                value={cakeForm.cat_id}
                onChange={e => setCakeForm({ ...cakeForm, cat_id: parseInt(e.target.value) })}
              >
                {categories.map((c) => (
                  <option key={c.cat_id} value={c.cat_id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginTop: '0.8rem' }}>
              <label className="form-label">Image URL (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Unsplash pattern URL"
                value={cakeForm.image_url}
                onChange={e => setCakeForm({ ...cakeForm, image_url: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginTop: '0.8rem' }}>
              <label className="form-label">Description Details</label>
              <textarea
                className="form-input"
                style={{ minHeight: '60px' }}
                placeholder="Detail ingredients..."
                value={cakeForm.description}
                onChange={e => setCakeForm({ ...cakeForm, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary btn-block" style={{ padding: '0.8rem', marginTop: '1.2rem' }}>
              Add to Catalog List
            </button>
          </form>

          {/* Active Catalog List */}
          <div className="cart-summary-panel" style={{ border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <h3 className="summary-title" style={{ marginBottom: '1rem' }}>Active Menu List</h3>
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '0.3rem' }}>
              {cakes.map((cake) => (
                <div key={cake.cake_id} style={{ display: 'flex', gap: '0.8rem', padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
                  <img src={getImageUrl(cake.image_url)} alt={cake.name} style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>{cake.name}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>NPR {cake.base_price}</span>
                  </div>
                  <button
                    onClick={() => toggleAvailability(cake.cake_id)}
                    style={{
                      padding: '0.3rem 0.5rem',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: cake.is_available ? 'var(--success)' : 'var(--error)',
                      color: '#ffffff'
                    }}
                  >
                    {cake.is_available ? 'IN STOCK' : 'OUT'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;