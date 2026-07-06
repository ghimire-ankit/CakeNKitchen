import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCategories, fetchAdminCakes, createCake as apiCreateCake, toggleCakeAvailability, fetchAdminOrders, updateOrderStatus as apiUpdateOrderStatus } from '../services/api';
import '../styles/admin.css';

function AdminDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'catalog' | 'customers'
  const [searchQuery, setSearchQuery] = useState('');

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
  const [imagePreview, setImagePreview] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCakeForm(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchCategories().then(res => { if (res.data) setCategories(res.data); });
    fetchAdminCakes().then(res => { if (res.data) setCakes(res.data); });
    fetchAdminOrders().then(res => { if (res.data) setOrders(res.data); });
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', marginBottom: '1rem', color: 'var(--error)', fontWeight: 400 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>You must be logged in as an Administrator to view the Bakery Control Center.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800 }}>Return to Login</Link>
      </div>
    );
  }

  // Derived Analytics
  const totalRevenue = orders.reduce((acc, o) => acc + parseFloat(o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const uniqueCustomers = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (!map.has(o.email)) map.set(o.email, { name: o.customer_name, email: o.email, phone: o.phone, ordersCount: 0, totalSpent: 0 });
      const c = map.get(o.email);
      c.ordersCount += 1;
      c.totalSpent += parseFloat(o.total || 0);
    });
    return Array.from(map.values());
  }, [orders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const res = await apiUpdateOrderStatus(orderId, newStatus);
    if (res.success) {
      setOrders(orders.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleAddCake = async (e) => {
    e.preventDefault();
    if (!cakeForm.name || !cakeForm.base_price) return;
    const newCake = {
      name: cakeForm.name,
      description: cakeForm.description,
      base_price: parseFloat(cakeForm.base_price),
      cat_id: parseInt(cakeForm.cat_id),
      image_url: cakeForm.image_url || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      is_available: cakeForm.is_available
    };
    
    const res = await apiCreateCake(newCake);
    if (res.success) {
      fetchAdminCakes().then(r => { if (r.data) setCakes(r.data); });
      setFeedback('Cake successfully launched to catalog.');
      setCakeForm({ name: '', description: '', base_price: '', cat_id: 1, image_url: '', is_available: true });
      setImagePreview('');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const toggleAvailability = async (cakeId) => {
    const res = await toggleCakeAvailability(cakeId);
    if (res.success) {
      setCakes(cakes.map(c => c.cake_id === cakeId ? { ...c, is_available: !c.is_available } : c));
    }
  };

  const filteredOrders = orders.filter(o => {
    const orderIdStr = o.order_id ? o.order_id.toString().toLowerCase() : '';
    const customerNameStr = o.customer_name ? o.customer_name.toString().toLowerCase() : '';
    const query = searchQuery.toLowerCase();
    return orderIdStr.includes(query) || customerNameStr.includes(query);
  });

  return (
    <div style={{ padding: '0 2rem' }}>
      <div className="admin-layout">
        
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <h2>Bakery OS</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 800 }}>ENTERPRISE EDITION</span>
          </div>
          <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Dashboard Overview</button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Order Management</button>
          <button className={`sidebar-link ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>🎂 Product Catalog</button>
          <button className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>👥 Customer CRM</button>
        </aside>

        {/* Main Workspace */}
        <main className="admin-main">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Business Overview</h2>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-light)' }}>Last updated: Just now</div>
              </div>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-title">Total Gross Revenue</div>
                  <div className="stat-card-value">NPR {totalRevenue.toLocaleString()}</div>
                  <span className="stat-trend">↑ +14.2% from last month</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Active Orders</div>
                  <div className="stat-card-value">{pendingCount}</div>
                  <span className="stat-trend" style={{color: 'var(--error)'}}>Requires baking</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Total Customers</div>
                  <div className="stat-card-value">{uniqueCustomers.length}</div>
                  <span className="stat-trend">↑ +3 new this week</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Catalog Items</div>
                  <div className="stat-card-value">{cakes.length}</div>
                  <span className="stat-trend" style={{color: 'var(--text-light)'}}>Across {categories.length} categories</span>
                </div>
              </div>

              <h3 className="summary-title" style={{marginBottom: '1rem'}}>Recent Activity</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.order_id}>
                        <td><strong>{o.order_id}</strong></td>
                        <td>{o.customer_name}</td>
                        <td>{o.created_at ? o.created_at.split('T')[0] : 'N/A'}</td>
                        <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                        <td><strong>NPR {parseFloat(o.total || 0).toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Order Management</h2>
                <div className="admin-search-box">
                  <input type="text" placeholder="Search by ID or Customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order Details</th>
                      <th>Items Ordered</th>
                      <th>Delivery / Payment</th>
                      <th>Status Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '3rem'}}>No orders found.</td></tr>}
                    {filteredOrders.map(o => (
                      <tr key={o.order_id}>
                        <td style={{verticalAlign: 'top'}}>
                          <strong style={{fontSize: '1rem', color: 'var(--primary)', display: 'block'}}>{o.order_id}</strong>
                          <span style={{fontSize: '0.8rem', color: 'var(--text-light)'}}>{o.created_at ? o.created_at.split('T')[0] : 'N/A'}</span>
                          <div style={{marginTop: '0.8rem'}}>
                            <strong>{o.customer_name}</strong><br/>
                            <span style={{fontSize: '0.8rem'}}>{o.phone}</span>
                          </div>
                        </td>
                        <td style={{verticalAlign: 'top'}}>
                          {o.items.map((item, idx) => (
                            <div key={idx} style={{marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                              <strong>{item.qty}x</strong> {item.name} ({item.size})
                              {item.message && <div style={{color: 'var(--accent)', fontSize: '0.75rem', marginTop: '0.2rem'}}>Msg: {item.message}</div>}
                            </div>
                          ))}
                          <strong style={{display: 'block', marginTop: '1rem', color: 'var(--primary)'}}>Total: NPR {parseFloat(o.total || 0).toLocaleString()}</strong>
                        </td>
                        <td style={{verticalAlign: 'top'}}>
                          <div style={{marginBottom: '0.5rem', fontSize: '0.85rem'}}>
                            <strong>Type:</strong> {o.delivery_type === 'express' ? '⚡ Express' : o.delivery_type === 'pickup' ? '🏪 Pickup' : '🚚 Standard'}<br/>
                            <strong>Slot:</strong> {o.delivery_date ? o.delivery_date.split('T')[0] : 'N/A'} ({o.delivery_time})<br/>
                            <strong>Method:</strong> {o.payment_method ? o.payment_method.toUpperCase() : 'COD'}
                          </div>
                          {o.notes && <div style={{fontSize: '0.8rem', backgroundColor: '#fff8e1', padding: '0.5rem', borderLeft: '3px solid #ffc107', borderRadius: '4px'}}>Note: {o.notes}</div>}
                        </td>
                        <td style={{verticalAlign: 'top'}}>
                          <select 
                            className="action-select" 
                            value={o.status} 
                            onChange={(e) => handleUpdateStatus(o.order_id, e.target.value)}
                            style={{width: '100%', marginBottom: '1rem'}}
                          >
                            <option value="Pending">🔴 Pending</option>
                            <option value="Preparing">🟠 Preparing</option>
                            <option value="Ready">🟡 Ready</option>
                            <option value="Delivered">🟢 Delivered</option>
                            <option value="Cancelled">⚫ Cancelled</option>
                          </select>
                          <button className="btn-outline" style={{width: '100%', padding: '0.4rem', fontSize: '0.75rem'}}>Print Invoice</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATALOG TAB */}
          {activeTab === 'catalog' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Product Catalog</h2>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem'}}>
                {/* Form Column */}
                <form onSubmit={handleAddCake} className="admin-table-container" style={{ padding: '2rem', height: 'fit-content' }}>
                  <h3 className="summary-title" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Create New Product</h3>
                  {feedback && <div style={{ background: 'var(--bg-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '4px' }}>{feedback}</div>}
                  
                  <div className="form-group" style={{marginBottom: '1rem'}}>
                    <label className="form-label">Cake Name</label>
                    <input type="text" className="form-input" required value={cakeForm.name} onChange={e => setCakeForm({ ...cakeForm, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{marginBottom: '1rem'}}>
                    <label className="form-label">Base Price (NPR)</label>
                    <input type="number" className="form-input" required value={cakeForm.base_price} onChange={e => setCakeForm({ ...cakeForm, base_price: e.target.value })} />
                  </div>
                  <div className="form-group" style={{marginBottom: '1rem'}}>
                    <label className="form-label">Category Group</label>
                    <select className="form-input" value={cakeForm.cat_id} onChange={e => setCakeForm({ ...cakeForm, cat_id: parseInt(e.target.value) })}>
                      {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{marginBottom: '1rem'}}>
                    <label className="form-label">Upload Product Image</label>
                    <input type="file" accept="image/*" className="form-input" onChange={handleImageUpload} style={{padding: '0.5rem'}} />
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{width: '100%', height: '150px', objectFit: 'cover', marginTop: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)'}} />}
                  </div>
                  <div className="form-group" style={{marginBottom: '1rem'}}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={cakeForm.description} onChange={e => setCakeForm({ ...cakeForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary btn-block" style={{ padding: '1rem' }}>Launch Product</button>
                </form>

                {/* List Column */}
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Product Name</th><th>Price</th><th>Category</th><th>Availability</th></tr></thead>
                    <tbody>
                      {cakes.map(cake => (
                        <tr key={cake.cake_id}>
                          <td>
                            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                              <img src={getImageUrl(cake.image_url)} alt="cake" style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} />
                              <strong style={{fontSize: '0.85rem'}}>{cake.name}</strong>
                            </div>
                          </td>
                          <td><strong>NPR {cake.base_price}</strong></td>
                          <td><span className="spec-badge">{categories.find(c => c.cat_id === cake.cat_id)?.name || 'Misc'}</span></td>
                          <td>
                            <button
                              onClick={() => toggleAvailability(cake.cake_id)}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: '20px', border: 'none', background: cake.is_available ? '#e8f5e9' : '#ffebee', color: cake.is_available ? '#2e7d32' : '#c62828' }}
                            >
                              {cake.is_available ? 'In Stock' : 'Out of Stock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Customer CRM</h2>
              </div>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead><tr><th>Customer Name</th><th>Email</th><th>Phone</th><th>Total Orders</th><th>Lifetime Value</th></tr></thead>
                  <tbody>
                    {uniqueCustomers.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone}</td>
                        <td><span className="spec-badge">{c.ordersCount}</span></td>
                        <td><strong>NPR {c.totalSpent.toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
