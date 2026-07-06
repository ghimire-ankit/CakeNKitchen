import { useState } from 'react';
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

  const addToCart = (cake, qty, size, message, customPrice = null) => {
    const existingIndex = cart.findIndex(
      item => item.cake_id === cake.cake_id && item.size === size && item.message === message
    );

    let updatedCart = [...cart];
    // Calculate price based on weight/size or use override
    let itemPrice;
    if (customPrice !== null) {
      itemPrice = customPrice;
    } else {
      const sizeMultiplier = size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0;
      itemPrice = Math.round(Number(cake.base_price) * sizeMultiplier);
    }

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
          <Route path="/admin" element={<AdminDashboard user={user} />} />
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

export default App;
