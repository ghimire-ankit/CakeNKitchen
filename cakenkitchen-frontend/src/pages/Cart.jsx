import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cart({ cart, updateCartQty, removeFromCart, discountPercent, couponCode, applyCoupon, removeCoupon }) {
  const navigate = useNavigate();
  const [couponFeedback, setCouponFeedback] = useState({ text: '', type: '' });
  const [orderNote, setOrderNote] = useState('');

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  
  // Production Feature: Free Shipping Threshold
  const freeShippingThreshold = 5000; // NPR 5000
  const deliveryCharge = (cartTotal > 0 && cartTotal < freeShippingThreshold) ? 150 : 0;
  const amountAway = Math.max(0, freeShippingThreshold - cartTotal);
  const progressPercent = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

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
      <h1 className="cart-header">Your Shopping Basket</h1>

      {cart.length === 0 ? (
        <div className="cart-items-panel cart-empty-message">
          <h2 style={{ fontFamily: 'var(--serif)' }}>Your basket is empty.</h2>
          <p style={{ margin: '1rem 0 2rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>Add some delicious cakes from our flavors list to get started.</p>
          <button onClick={() => navigate('/')} className="btn-primary" id="btn-back-shop">Browse Menu</button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-panel">
            
            {/* Free Shipping Progress Bar */}
            <div className="shipping-progress-container">
              {amountAway > 0 ? (
                <p className="shipping-msg">You are <strong>NPR {amountAway}</strong> away from <span>Free Delivery!</span></p>
              ) : (
                <p className="shipping-msg success">🎉 Congratulations! You qualify for <span>Free Delivery!</span></p>
              )}
              <div className="progress-bar-bg">
                <div className={`progress-bar-fill ${amountAway === 0 ? 'complete' : ''}`} style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {cart.map((item, index) => (
              <div className="cart-item" key={index} id={`cart-item-${item.cake_id}`}>
                <img src={item.image_url} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-specification">
                    <span className="spec-badge">Size: {item.size}</span>
                    {item.message && (
                      <div className="custom-details-block">
                        <strong>Customizations:</strong>
                        <p>{item.message}</p>
                      </div>
                    )}
                  </div>
                  <div className="cart-item-price">NPR {item.price} <span style={{fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600}}>/ each</span></div>
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

            {/* Order Note Feature */}
            <div className="order-note-container">
              <label htmlFor="order-note" className="option-label" style={{marginTop: '1rem'}}>Add an Order Note (Optional):</label>
              <textarea 
                id="order-note"
                placeholder="E.g., Please ring the doorbell upon arrival, or include extra napkins..."
                className="form-input"
                style={{ minHeight: '70px', resize: 'vertical' }}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
            </div>
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
              <span id="price-delivery" style={{color: deliveryCharge === 0 ? '#2e7d32' : 'inherit', fontWeight: deliveryCharge === 0 ? 800 : 600}}>
                {deliveryCharge === 0 ? 'FREE' : `NPR ${deliveryCharge}`}
              </span>
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
              style={{ marginTop: '1.5rem', padding: '1.1rem', fontSize: '0.9rem', boxShadow: '0 8px 25px rgba(229, 91, 126, 0.3)' }}
              id="btn-go-checkout"
            >
              Secure Checkout
            </button>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <span>🔒 256-bit SSL Encrypted</span>
              <span>✅ 100% Safe Payments</span>
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn-secondary btn-block"
              style={{ marginTop: '1rem', padding: '0.8rem' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
