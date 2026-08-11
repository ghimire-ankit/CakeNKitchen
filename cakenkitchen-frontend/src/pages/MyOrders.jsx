import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserOrders, updateOrderStatus } from '../services/api';
import { printInvoice } from '../utils/invoice';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const STATUS_CONFIG = {
  'Pending': { color: '#e65100', bg: '#fff3e0', border: '#ffe0b2', icon: '🔴', step: 1 },
  'Preparing': { color: '#1565c0', bg: '#e3f2fd', border: '#bbdefb', icon: '🟠', step: 2 },
  'Ready': { color: '#6a1b9a', bg: '#f3e5f5', border: '#e1bee7', icon: '🟡', step: 3 },
  'Out for Delivery': { color: '#f57f17', bg: '#fff8e1', border: '#ffecb3', icon: '🚚', step: 4 },
  'Delivered': { color: '#2e7d32', bg: '#e8f5e9', border: '#c8e6c9', icon: '🟢', step: 5 },
  'Cancelled': { color: '#c62828', bg: '#ffebee', border: '#ffcdd2', icon: '⚫', step: 0 },
};

const STEPS = ['Order Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];

function MyOrders({ user }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserOrders(user.user_id).then(res => {
      if (res.data) setOrders(res.data);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      const res = await updateOrderStatus(orderId, 'Cancelled');
      if (res && res.success) {
        setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'Cancelled' } : o));
      } else {
        alert("Failed to cancel order. Please call the bakery.");
      }
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', fontWeight: 800, color: 'var(--text-light)' }}>
        Loading your orders...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <span className="detail-category">📦 Order History</span>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.3rem' }}>My Orders</h1>
        </div>
        <Link to="/" className="btn-secondary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem', textDecoration: 'none' }}>Continue Shopping</Link>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No orders yet</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Start exploring our delicious cake collection!</p>
          <Link to="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem' }}>Browse Cakes</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
            const isExpanded = expandedOrder === order.order_id;
            const hasLocation = order.latitude && order.longitude;

            return (
              <div key={order.order_id} style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-light)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)',
              }}>
                <div
                  style={{ padding: '1.5rem 2rem', cursor: 'pointer' }}
                  onClick={() => setExpandedOrder(isExpanded ? null : order.order_id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Order #{order.order_id}</strong>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          background: config.bg,
                          color: config.color,
                          border: `1px solid ${config.border}`,
                        }}>
                          {config.icon} {order.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                        {' · '}{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                        NPR {parseFloat(order.total || 0).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', marginTop: '0.4rem' }}>
                        {order.status === 'Pending' && (
                          <button
                            onClick={(e) => handleCancelOrder(e, order.order_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--error)',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              textDecoration: 'underline',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 700 }}>
                          {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                    <div style={{ marginTop: '1.2rem' }}>
                      <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                        {STEPS.map((step, idx) => {
                          const active = idx < config.step;
                          const current = idx === config.step - 1;
                          return (
                            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div style={{
                                height: '4px',
                                width: '100%',
                                borderRadius: '2px',
                                background: active ? 'var(--accent)' : 'var(--border-light)',
                                transition: 'background 0.3s',
                              }} />
                              <span style={{
                                fontSize: '0.6rem',
                                fontWeight: current ? 900 : 700,
                                color: active ? 'var(--accent)' : 'var(--text-light)',
                                marginTop: '0.4rem',
                                textAlign: 'center',
                              }}>{step}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 2rem 2rem', borderTop: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary)', fontSize: '1rem' }}>Items Ordered</h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const invoiceData = {
                              order_id: order.order_id,
                              items: order.items,
                              total: order.total,
                              delivery_address: order.delivery_address,
                              delivery_date: order.delivery_date,
                              delivery_time: order.delivery_time,
                              delivery_type: order.delivery_type,
                              payment_method: order.payment_method || 'cod',
                              created_at: order.created_at,
                              customer_name: user?.name,
                              email: user?.email,
                              phone: user?.phone
                            };
                            printInvoice(invoiceData);
                          }}
                          className="btn-secondary"
                          style={{
                            padding: '0.4rem 1rem',
                            fontSize: '0.75rem',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer'
                          }}
                        >
                          🧾 Print Invoice / Receipt
                        </button>
                      </div>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0',
                          borderBottom: idx < order.items.length - 1 ? '1px dashed var(--border-light)' : 'none',
                          fontSize: '0.85rem',
                        }}>
                          <div>
                            <strong>{item.qty}x</strong> {item.name} <span style={{ color: 'var(--text-light)' }}>({item.size})</span>
                            {item.message && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.2rem', maxWidth: '400px', wordBreak: 'break-word' }}>
                                {item.message}
                              </div>
                            )}
                          </div>
                          <strong>NPR {parseFloat(item.price * item.qty).toLocaleString()}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                      <div>
                        <h4 style={{ marginBottom: '0.8rem', color: 'var(--primary)', fontSize: '1rem' }}>Delivery Info</h4>
                        <div style={{ fontSize: '0.85rem', lineHeight: 1.8, color: 'var(--text-dark)' }}>
                          <div><strong>Address:</strong> {order.delivery_address}</div>
                          <div><strong>Date:</strong> {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</div>
                          <div><strong>Time:</strong> {order.delivery_time}</div>
                          <div><strong>Type:</strong> {order.delivery_type === 'pickup' ? '🏪 Store Pickup' : '🚚 Standard Delivery'}</div>
                          <div><strong>Payment:</strong> {(order.payment_method || 'cod').toUpperCase()}</div>
                        </div>
                      </div>

                      {hasLocation && (
                        <div>
                          <h4 style={{ marginBottom: '0.8rem', color: 'var(--primary)', fontSize: '1rem' }}>📍 Delivery Location</h4>
                          <div style={{ height: '200px', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1.5px solid var(--border-light)' }}>
                            <MapContainer
                              center={[parseFloat(order.latitude), parseFloat(order.longitude)]}
                              zoom={15}
                              style={{ height: '100%', width: '100%' }}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                attribution='&copy; OpenStreetMap'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[parseFloat(order.latitude), parseFloat(order.longitude)]} icon={deliveryIcon}>
                                <Popup>
                                  <strong>Order #{order.order_id}</strong><br />
                                  Delivery Location
                                </Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                          <small style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700, display: 'block', marginTop: '0.4rem' }}>
                            📌 {parseFloat(order.latitude).toFixed(5)}, {parseFloat(order.longitude).toFixed(5)}
                          </small>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: '#fff8e1', borderLeft: '3px solid #ffc107', borderRadius: '4px', fontSize: '0.8rem' }}>
                        <strong>Notes:</strong> {order.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
