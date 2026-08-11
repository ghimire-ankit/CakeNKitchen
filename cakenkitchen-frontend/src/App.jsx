import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CakeDetail from './pages/CakeDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import CustomCake from './pages/CustomCake';
import MyOrders from './pages/MyOrders';
import { fetchNotifications, markNotificationAsRead } from './services/api';

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    return (token && storedUser) ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem('cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', link: '' });
  const [activeNotification, setActiveNotification] = useState(null);

  // Poll for notifications
  useEffect(() => {
    let interval;
    const checkNotifications = async () => {
      if (user) {
        const res = await fetchNotifications(user.user_id || user.id, user.role);
        if (res.success && res.data) {
          const unread = res.data.find(n => !n.is_read || n.is_read === 0);
          if (unread && (!activeNotification || activeNotification.id !== unread.id)) {
            setActiveNotification(unread);
          }
        }
      }
    };
    
    checkNotifications();
    interval = setInterval(checkNotifications, 4000);
    return () => clearInterval(interval);
  }, [user, activeNotification]);

  const closeNotification = async (id) => {
    await markNotificationAsRead(id);
    setActiveNotification(null);
  };

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

  const addToCart = (cake, qty, size, message, customPrice = null) => {
    const existingIndex = cart.findIndex(
      item => item.cake_id === cake.cake_id && item.size === size && item.message === message
    );

    let updatedCart = [...cart];
    const itemPrice = customPrice !== null ? customPrice : Math.round(Number(cake.base_price) * (size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0));

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
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/custom-cake" element={<CustomCake addToCart={addToCart} />} />
          <Route path="/my-orders" element={<MyOrders user={user} />} />
          <Route path="/admin" element={<AdminDashboard user={user} />} />
        </Routes>
      </main>
      <Footer />

      {toast.visible && (
        <div className="toast-success-banner" id="toast-notify">
          <span className="toast-message">{toast.message}</span>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <Link to="/cart" className="toast-link" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>View Cart</Link>
            <button className="toast-close-btn" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>✕</button>
          </div>
        </div>
      )}

      {activeNotification && (
        <div className="notification-popup" style={{
          position: 'fixed', bottom: '24px', right: '24px', 
          backgroundColor: '#ffffff', borderLeft: '6px solid var(--accent)',
          padding: '1.2rem 1.4rem', borderRadius: '12px', 
          boxShadow: '0 10px 35px rgba(0, 0, 0, 0.18), 0 2px 10px rgba(0,0,0,0.08)',
          zIndex: 99999, minWidth: '300px', maxWidth: '380px',
          fontFamily: 'inherit'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>🔔</span>
              <h4 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1rem', fontWeight: 700 }}>{activeNotification.title}</h4>
            </div>
            <button onClick={() => closeNotification(activeNotification.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: '1.3rem', fontWeight: 'bold', lineHeight: 1 }}>&times;</button>
          </div>
          <p style={{ margin: 0, color: '#555', fontSize: '0.88rem', lineHeight: 1.4 }}>{activeNotification.message}</p>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button onClick={() => closeNotification(activeNotification.id)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', borderRadius: '6px' }}>
              Dismiss / Mark Read
            </button>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
