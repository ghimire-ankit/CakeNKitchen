import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

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
  const [deliveryType, setDeliveryType] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [mapPosition, setMapPosition] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (cart.length === 0 && !completed) {
      navigate('/cart');
    }
  }, [cart, completed, navigate]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(cartTotal * (discountPercent / 100));
  const baseDelivery = (cartTotal > 0 && cartTotal < 5000) ? 150 : 0;
  const deliveryCharge = deliveryType === 'pickup' ? 0 : baseDelivery;
  const grandTotal = cartTotal - discountAmount + deliveryCharge;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setMapPosition(coords);
        if (mapRef.current) {
          mapRef.current.flyTo(coords, 16);
        }
        setGpsLoading(false);
      },
      (err) => {
        alert('Could not detect your location. Please allow GPS permission or select manually on the map.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedPhone = form.phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      alert("Please enter a valid phone number (minimum 10 digits).");
      return;
    }
    if (deliveryType !== 'pickup' && form.address.trim().length < 10) {
      alert("Please provide a more detailed delivery address.");
      return;
    }
    setSubmitting(true);

    const orderRecord = {
      customer_name: form.name,
      email: form.email,
      phone: form.phone,
      address: deliveryType === 'pickup' ? 'Store Pickup' : form.address,
      delivery_date: form.deliveryDate,
      delivery_time: form.deliveryTime,
      notes: form.note,
      payment_method: paymentMethod,
      delivery_type: deliveryType,
      latitude: mapPosition ? mapPosition[0] : null,
      longitude: mapPosition ? mapPosition[1] : null,
      total: grandTotal,
      items: cart.map(item => ({
        cake_id: item.cake_id,
        name: item.name,
        qty: item.qty,
        size: item.size,
        message: item.message || '',
        price: item.price
      }))
    };

    try {
      const res = await placeOrder(orderRecord);
      if (res && res.success) {
        setOrderId(res.data.order_id || 'CKN-' + Math.floor(1000 + Math.random() * 9000));
        setCompleted(true);
        clearCart();
      } else {
        alert('Failed to place order securely. Please try again.');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('An error occurred during checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="success-card" id="checkout-success-view">
        <div className="success-icon">✓</div>
        <h2>Order Confirmed!</h2>
        <p>Thank you for your purchase. Your order reference token is <strong>{orderId}</strong>.</p>
        <div className="success-details-box">
          <p><strong>Deliver to:</strong> {deliveryType === 'pickup' ? 'Self Pickup at Store' : form.address}</p>
          <p><strong>Scheduled Date:</strong> {form.deliveryDate} at {form.deliveryTime}</p>
          <p><strong>Payment Method:</strong> {paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'esewa' ? 'eSewa Digital Wallet' : 'Credit/Debit Card'}</p>
          {mapPosition && <p><strong>GPS Location:</strong> {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}</p>}
          <p><strong>Status:</strong> Our master bakers are reviewing your order details.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/my-orders')} className="btn-primary" id="btn-success-orders">Track My Orders</button>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ padding: '0.6rem 1.5rem' }} id="btn-success-home">Browse More Cakes</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="cart-header">Secure Checkout</h1>
      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form-container" id="checkout-details-form">

          <div className="checkout-section">
            <h3 className="section-title"><span>1</span> Contact Information</h3>
            <div className="checkout-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="chk-name">Full Name</label>
                <input id="chk-name" type="text" className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-phone">Phone Number</label>
                <input id="chk-phone" type="tel" placeholder="E.g., 98XXXXXXXX" className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group span-2">
                <label className="form-label" htmlFor="chk-email">Email Address</label>
                <input id="chk-email" type="email" className="form-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3 className="section-title"><span>2</span> Delivery Details</h3>
            <div className="delivery-types-container">
              <label className={`delivery-card ${deliveryType === 'standard' ? 'active' : ''}`}>
                <input type="radio" name="deliveryType" checked={deliveryType === 'standard'} onChange={() => setDeliveryType('standard')} />
                <div className="del-info">
                  <strong>Standard Delivery 🚚</strong>
                  <span>{baseDelivery === 0 ? 'FREE' : `NPR ${baseDelivery}`}</span>
                </div>
              </label>
              <label className={`delivery-card ${deliveryType === 'pickup' ? 'active' : ''}`}>
                <input type="radio" name="deliveryType" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} />
                <div className="del-info">
                  <strong>Store Pickup 🏪</strong>
                  <span>FREE</span>
                </div>
              </label>
            </div>

            {deliveryType !== 'pickup' && (
              <>
                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="form-label" htmlFor="chk-address">Complete Shipping Address</label>
                  <input id="chk-address" type="text" placeholder="House No, Street, Ward, Area" className="form-input" required={deliveryType !== 'pickup'} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>📍 Pin Your Delivery Location</label>
                    <button type="button" onClick={detectLocation} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }} disabled={gpsLoading}>
                      {gpsLoading ? 'Detecting...' : '📡 Auto Detect GPS'}
                    </button>
                  </div>
                  <div style={{ height: '250px', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1.5px solid var(--border-light)' }}>
                    <MapContainer
                      center={mapPosition || [28.7041, 80.3595]}
                      zoom={mapPosition ? 16 : 12}
                      style={{ height: '100%', width: '100%' }}
                      ref={mapRef}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                    </MapContainer>
                  </div>
                  {mapPosition && (
                    <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-light)', fontSize: '0.75rem', fontWeight: 700 }}>
                      📌 Selected: {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                    </small>
                  )}
                  <small style={{ display: 'block', marginTop: '0.3rem', color: 'var(--text-light)', fontSize: '0.7rem' }}>
                    Click on the map to set your delivery pin, or use Auto Detect GPS.
                  </small>
                </div>
              </>
            )}

            <div className="checkout-grid" style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-date">Select Delivery Date</label>
                <input id="chk-date" type="date" className="form-input" required min={new Date().toISOString().split('T')[0]} value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="chk-time">Preferred Time Slot</label>
                <select id="chk-time" className="form-input" value={form.deliveryTime} onChange={e => setForm({ ...form, deliveryTime: e.target.value })}>
                  <option value="9:00 AM - 12:00 PM">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="12:00 PM - 3:00 PM">Midday (12:00 PM - 3:00 PM)</option>
                  <option value="3:00 PM - 6:00 PM">Afternoon (3:00 PM - 6:00 PM)</option>
                  <option value="6:00 PM - 9:00 PM">Evening (6:00 PM - 9:00 PM)</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label" htmlFor="chk-note">Special Baker Instructions (Optional)</label>
              <textarea id="chk-note" className="form-input" style={{ resize: 'vertical', minHeight: '60px' }} placeholder="E.g., Please ensure minimal sugar..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>

          <div className="checkout-section">
            <h3 className="section-title"><span>3</span> Payment Method</h3>
            <div className="payment-methods-grid">
              <label className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span className="pm-icon">💵</span>
                <strong>Cash on Delivery</strong>
              </label>
              <label className={`payment-card ${paymentMethod === 'esewa' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'esewa'} onChange={() => setPaymentMethod('esewa')} />
                <span className="pm-icon" style={{ color: '#60bb46', fontFamily: 'var(--sans)', fontWeight: 900 }}>e</span>
                <strong>eSewa Wallet</strong>
              </label>
              <label className={`payment-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                <span className="pm-icon">💳</span>
                <strong>Credit / Debit Card</strong>
              </label>
            </div>
            {paymentMethod === 'esewa' && (
              <div className="payment-alert">
                You will be redirected to the eSewa secure portal automatically after clicking "Place Order".
              </div>
            )}
            {paymentMethod === 'card' && (
              <div className="payment-alert" style={{ backgroundColor: '#e3f2fd', color: '#1565c0', borderLeftColor: '#1976d2' }}>
                You will be securely redirected to our payment gateway.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary btn-block"
            style={{ padding: '1.2rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={submitting}
            id="btn-submit-order"
          >
            {submitting ? 'Processing Securely...' : paymentMethod === 'cod' ? `Place Order (Pay NPR ${grandTotal} Later)` : `Pay NPR ${grandTotal} Now`}
          </button>
          <div className="secure-checkout-msg">🔒 Guaranteed safe & secure checkout. Powered by CakeNKitchen.</div>
        </form>

        <div className="cart-summary-panel sticky-summary">
          <h3 className="summary-title">Order Summary</h3>
          <div className="checkout-items-list">
            {cart.map((item, i) => (
              <div key={i} className="checkout-item-row">
                <div className="chk-item-info">
                  <span className="chk-qty">{item.qty}x</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong className="chk-name">{item.name}</strong>
                    <span className="chk-size">{item.size}</span>
                  </div>
                </div>
                <span className="chk-price">NPR {item.price * item.qty}</span>
              </div>
            ))}
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>NPR {cartTotal}</span>
          </div>
          {discountPercent > 0 && (
            <div className="summary-row" style={{ color: '#2e7d32', fontWeight: 700 }}>
              <span>Discount <span className="coupon-badge">{couponCode}</span></span>
              <span>- NPR {discountAmount}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Shipping ({deliveryType === 'pickup' ? 'Pickup' : 'Standard'})</span>
            <span style={{ color: deliveryCharge === 0 ? '#2e7d32' : 'inherit', fontWeight: deliveryCharge === 0 ? 800 : 600 }}>
              {deliveryCharge === 0 ? 'FREE' : `NPR ${deliveryCharge}`}
            </span>
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

export default Checkout;
