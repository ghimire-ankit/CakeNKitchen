import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCategories, fetchAdminCakes, createCake as apiCreateCake, toggleCakeAvailability, deleteCakeAPI, updateCakeAPI, fetchAdminOrders, updateOrderStatus as apiUpdateOrderStatus } from '../services/api';
import '../styles/admin.css';

function AdminDashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [cakeForm, setCakeForm] = useState({
    name: '',
    description: '',
    base_price: '',
    cat_id: 1,
    is_available: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCake, setEditingCake] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', base_price: '', cat_id: 1 });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState('');

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setSelectedFile(file);
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
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem', border: '1.5px solid var(--border)', background: 'var(--bg-card)', borderRadius: 'var(--radius-card)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--error)', fontWeight: 400 }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>You must be logged in as an Administrator to view the Bakery Control Center.</p>
        <Link to="/login" className="btn-primary" style={{ padding: '0.6rem 1.5rem', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 800 }}>Return to Login</Link>
      </div>
    );
  }

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
    setIsSubmitting(true);
    setFeedback('');
    const formData = new FormData();
    formData.append('name', cakeForm.name);
    formData.append('description', cakeForm.description || '');
    formData.append('base_price', cakeForm.base_price);
    formData.append('cat_id', cakeForm.cat_id);
    formData.append('is_available', cakeForm.is_available);
    
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    const res = await apiCreateCake(formData);
    setIsSubmitting(false);
    if (res.success) {
      fetchAdminCakes().then(r => { if (r.data) setCakes(r.data); });
      setFeedback('✅ Cake successfully launched to catalog!');
      setCakeForm({ name: '', description: '', base_price: '', cat_id: 1, is_available: true });
      setImagePreview('');
      setSelectedFile(null);
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback('❌ Error: ' + (res.error || 'Failed to create cake.'));
    }
  };

  const handleDeleteCake = async (cakeId, cakeName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${cakeName}"? This will also remove its image from disk.`)) return;
    const res = await deleteCakeAPI(cakeId);
    if (res.success) {
      setCakes(cakes.filter(c => c.cake_id !== cakeId));
      setFeedback('🗑️ "' + cakeName + '" has been deleted.');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback('❌ Failed to delete cake.');
    }
  };

  const openEditModal = (cake) => {
    setEditingCake(cake);
    setEditForm({ name: cake.name, description: cake.description || '', base_price: cake.base_price, cat_id: cake.cat_id });
    setEditFile(null);
    setEditPreview('');
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditCake = async (e) => {
    e.preventDefault();
    if (!editingCake) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('description', editForm.description);
    formData.append('base_price', editForm.base_price);
    formData.append('cat_id', editForm.cat_id);
    if (editFile) formData.append('image', editFile);

    const res = await updateCakeAPI(editingCake.cake_id, formData);
    setIsSubmitting(false);
    if (res.success) {
      fetchAdminCakes().then(r => { if (r.data) setCakes(r.data); });
      setEditingCake(null);
      setFeedback('✏️ "' + editForm.name + '" updated successfully!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback('❌ Error: ' + (res.error || 'Failed to update cake.'));
    }
  };

  const handlePrintInvoice = (order) => {
    const win = window.open('', '_blank', 'width=420,height=600');
    const itemsHtml = order.items.map(item =>
      `<tr><td>${item.qty}x ${item.name} (${item.size})</td><td style="text-align:right">NPR ${parseFloat(item.price || 0).toLocaleString()}</td></tr>`
    ).join('');
    win.document.write(`
      <html><head><title>Invoice #${order.order_id}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 1.5rem; color: #333; }
        h2 { text-align: center; margin-bottom: 0.2rem; }
        .sub { text-align: center; color: #888; font-size: 0.8rem; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        td, th { padding: 0.4rem 0; border-bottom: 1px dashed #ddd; font-size: 0.85rem; }
        .total { font-size: 1.1rem; font-weight: 800; text-align: right; margin-top: 0.5rem; }
        .meta { font-size: 0.78rem; color: #555; margin-bottom: 0.3rem; }
        .footer { text-align: center; margin-top: 2rem; font-size: 0.7rem; color: #aaa; }
        @media print { button { display: none; } }
      </style></head><body>
      <h2>🎂 Cake & Kitchen</h2>
      <div class="sub">Tax Invoice / Receipt</div>
      <div class="meta"><strong>Invoice:</strong> #${order.order_id}</div>
      <div class="meta"><strong>Date:</strong> ${order.created_at ? order.created_at.split('T')[0] : 'N/A'}</div>
      <div class="meta"><strong>Customer:</strong> ${order.customer_name}</div>
      <div class="meta"><strong>Phone:</strong> ${order.phone}</div>
      <div class="meta"><strong>Delivery:</strong> ${order.delivery_date ? order.delivery_date.split('T')[0] : 'N/A'} (${order.delivery_time || 'N/A'})</div>
      <hr/>
      <table><thead><tr><th style="text-align:left">Item</th><th style="text-align:right">Price</th></tr></thead>
      <tbody>${itemsHtml}</tbody></table>
      <div class="total">Grand Total: NPR ${parseFloat(order.total || 0).toLocaleString()}</div>
      ${order.notes ? '<div class="meta" style="margin-top:1rem"><strong>Notes:</strong> ' + order.notes + '</div>' : ''}
      <div class="footer">Thank you for choosing Cake & Kitchen!<br/>This is a computer-generated invoice.</div>
      <br/><button onclick="window.print()" style="width:100%;padding:0.7rem;font-size:0.9rem;cursor:pointer;background:#8B4513;color:#fff;border:none;border-radius:6px;">🖨️ Print</button>
      </body></html>
    `);
    win.document.close();
  };

  const toggleAvailability = async (cakeId) => {
    const res = await toggleCakeAvailability(cakeId);
    if (res.success) {
      setCakes(cakes.map(c => c.cake_id === cakeId ? { ...c, is_available: !c.is_available } : c));
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (o.order_id?.toString() || '').includes(q) || (o.customer_name || '').toLowerCase().includes(q);
  });

  const getDeliveryTypeLabel = (o) => {
    const dt = o.delivery_type || '';
    if (dt === 'pickup') return '🏪 Pickup';
    return '🚚 Standard';
  };

  const getPaymentLabel = (o) => {
    const pm = o.payment_method || 'cod';
    if (pm === 'esewa') return 'eSewa';
    if (pm === 'card') return 'Card';
    return 'COD';
  };

  return (
    <div style={{ padding: '0 1rem' }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            <h2>Bakery OS</h2>
            <span>ENTERPRISE EDITION</span>
          </div>
          <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Dashboard</button>
          <button className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Orders</button>
          <button className={`sidebar-link ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => setActiveTab('catalog')}>🎂 Products</button>
          <button className={`sidebar-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>👥 Customers</button>
        </aside>

        <main className="admin-main">

          {activeTab === 'overview' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Business Overview</h2>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)' }}>Last updated: Just now</div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-title">Total Revenue</div>
                  <div className="stat-card-value">NPR {totalRevenue.toLocaleString()}</div>
                  <span className="stat-trend">↑ +14.2% from last month</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Active Orders</div>
                  <div className="stat-card-value">{pendingCount}</div>
                  <span className="stat-trend" style={{ color: 'var(--error)' }}>Requires action</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Total Customers</div>
                  <div className="stat-card-value">{uniqueCustomers.length}</div>
                  <span className="stat-trend">↑ +3 new this week</span>
                </div>
                <div className="stat-card">
                  <div className="stat-card-title">Catalog Items</div>
                  <div className="stat-card-value">{cakes.length}</div>
                  <span className="stat-trend" style={{ color: 'var(--text-light)' }}>Across {categories.length} categories</span>
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Recent Activity</h3>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Status</th><th>Total</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.order_id}>
                        <td><strong>{o.order_id}</strong></td>
                        <td>{o.customer_name}</td>
                        <td>{o.created_at ? o.created_at.split('T')[0] : 'N/A'}</td>
                        <td><span className={`status-badge status-${o.status?.replace(/\s/g, '')}`}>{o.status}</span></td>
                        <td><strong>NPR {parseFloat(o.total || 0).toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Order Management</h2>
                <div className="admin-search-box">
                  <input type="text" placeholder="Search by ID or Customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="admin-orders-list">
                {filteredOrders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)', fontWeight: 700 }}>No orders found.</div>
                )}
                {filteredOrders.map(o => (
                  <div key={o.order_id} className="admin-order-card">
                    <div className="admin-order-header">
                      <div className="order-meta">
                        <span className="order-id">#{o.order_id}</span>
                        <span className="order-date">{o.created_at ? o.created_at.split('T')[0] : 'N/A'}</span>
                        <span className="order-customer">{o.customer_name}</span>
                        <span className="order-phone">{o.phone}</span>
                      </div>
                      <div className="order-items-col">
                        {o.items.map((item, idx) => (
                          <div key={idx}>
                            <div className="order-item-line">
                              <strong>{item.qty}x</strong> {item.name} ({item.size})
                            </div>
                            {item.message && <div className="order-item-msg">{item.message}</div>}
                          </div>
                        ))}
                        <div className="order-total-line">Total: NPR {parseFloat(o.total || 0).toLocaleString()}</div>
                      </div>
                      <div className="order-delivery-col">
                        <div><strong>Type:</strong> {getDeliveryTypeLabel(o)}</div>
                        <div><strong>Date:</strong> {o.delivery_date ? o.delivery_date.split('T')[0] : 'N/A'}</div>
                        <div><strong>Slot:</strong> {o.delivery_time}</div>
                        <div><strong>Payment:</strong> {getPaymentLabel(o)}</div>
                        {o.latitude && o.longitude && (
                          <div style={{ marginTop: '0.3rem' }}>
                            <strong>GPS:</strong>{' '}
                            <a
                              href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.78rem' }}
                            >
                              📍 View on Map
                            </a>
                          </div>
                        )}
                        {o.notes && <div className="order-note-strip">📝 {o.notes}</div>}
                      </div>
                      <div className="order-actions-col">
                        <select
                          className="action-select"
                          value={o.status}
                          onChange={(e) => handleUpdateStatus(o.order_id, e.target.value)}
                          style={{ width: '100%' }}
                        >
                          <option value="Pending">🔴 Pending</option>
                          <option value="Preparing">🟠 Preparing</option>
                          <option value="Ready">🟡 Ready</option>
                          <option value="Out for Delivery">🚚 Out for Delivery</option>
                          <option value="Delivered">🟢 Delivered</option>
                          <option value="Cancelled">⚫ Cancelled</option>
                        </select>
                        <button className="btn-outline" onClick={() => handlePrintInvoice(o)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem' }}>Print Invoice</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'catalog' && (
            <div className="fade-in">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Product Catalog</h2>
              </div>

              <div className="admin-catalog-grid">
                <form onSubmit={handleAddCake} className="admin-table-container" style={{ padding: '2rem', height: 'fit-content' }}>
                  <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--primary)' }}>Create New Product</h3>
                  {feedback && <div style={{ background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '0.8rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 800, borderRadius: '4px' }}>{feedback}</div>}

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Cake Name</label>
                    <input type="text" className="form-input" required value={cakeForm.name} onChange={e => setCakeForm({ ...cakeForm, name: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Base Price (NPR)</label>
                    <input type="number" className="form-input" required value={cakeForm.base_price} onChange={e => setCakeForm({ ...cakeForm, base_price: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Category Group</label>
                    <select className="form-input" value={cakeForm.cat_id} onChange={e => setCakeForm({ ...cakeForm, cat_id: parseInt(e.target.value) })}>
                      {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Upload Product Image</label>
                    <input type="file" accept="image/*" className="form-input" onChange={handleImageUpload} style={{ padding: '0.5rem' }} />
                    {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', marginTop: '0.8rem', borderRadius: '4px', border: '1px solid var(--border)' }} />}
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Description</label>
                    <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={cakeForm.description} onChange={e => setCakeForm({ ...cakeForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary btn-block" disabled={isSubmitting} style={{ padding: '1rem', opacity: isSubmitting ? 0.6 : 1, position: 'relative' }}>
                    {isSubmitting ? '⏳ Uploading...' : '🚀 Launch Product'}
                  </button>
                </form>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead><tr><th>Product Name</th><th>Price</th><th>Category</th><th>Availability</th><th>Actions</th></tr></thead>
                    <tbody>
                      {cakes.map(cake => (
                        <tr key={cake.cake_id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img src={getImageUrl(cake.image_url)} alt="cake" style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }} />
                              <strong style={{ fontSize: '0.85rem' }}>{cake.name}</strong>
                            </div>
                          </td>
                          <td><strong>NPR {cake.base_price}</strong></td>
                          <td><span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)' }}>{categories.find(c => c.cat_id === cake.cat_id)?.name || 'Misc'}</span></td>
                          <td>
                            <button
                              onClick={() => toggleAvailability(cake.cake_id)}
                              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: '20px', border: 'none', background: cake.is_available ? '#e8f5e9' : '#ffebee', color: cake.is_available ? '#2e7d32' : '#c62828' }}
                            >
                              {cake.is_available ? '✅ In Stock' : '❌ Out of Stock'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => openEditModal(cake)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', borderRadius: '6px', border: '1px solid #1565c0', background: '#fff', color: '#1565c0', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = '#1565c0'; e.target.style.color = '#fff'; }}
                                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#1565c0'; }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCake(cake.cake_id, cake.name)}
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', borderRadius: '6px', border: '1px solid #c62828', background: '#fff', color: '#c62828', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.target.style.background = '#c62828'; e.target.style.color = '#fff'; }}
                                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#c62828'; }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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
                        <td><span style={{ background: 'var(--bg-light)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>{c.ordersCount}</span></td>
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

      {/* Edit Cake Modal */}
      {editingCake && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingCake(null)}>
          <form onSubmit={handleEditCake} onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', width: '420px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>✏️ Edit Product</h3>
              <button type="button" onClick={() => setEditingCake(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Cake Name</label>
              <input type="text" className="form-input" required value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Base Price (NPR)</label>
              <input type="number" className="form-input" required value={editForm.base_price} onChange={e => setEditForm({ ...editForm, base_price: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Category</label>
              <select className="form-input" value={editForm.cat_id} onChange={e => setEditForm({ ...editForm, cat_id: parseInt(e.target.value) })}>
                {categories.map(c => <option key={c.cat_id} value={c.cat_id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Replace Image (optional)</label>
              <input type="file" accept="image/*" className="form-input" onChange={handleEditImageChange} style={{ padding: '0.5rem' }} />
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {editPreview ? (
                  <img src={editPreview} alt="New" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '2px solid var(--accent)' }} />
                ) : (
                  <img src={getImageUrl(editingCake.image_url)} alt="Current" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                )}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{editPreview ? 'New image selected' : 'Current image'}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" style={{ minHeight: '80px', resize: 'vertical' }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button type="button" onClick={() => setEditingCake(null)} className="btn-outline" style={{ flex: 1, padding: '0.8rem' }}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1, padding: '0.8rem', opacity: isSubmitting ? 0.6 : 1 }}>
                {isSubmitting ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
