import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { loginUser } from './services/api';
import './App.css';

// ============ MAIN APP ============
function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

// ============ NAVBAR ============
function Navbar() {
  return (
    <nav style={{ padding: '15px 30px', background: '#2d2d2d', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0 }}>🎂 CakeNKitchen</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
      </div>
    </nav>
  );
}

// ============ HOME PAGE ============
function Home() {
  return (
    <div>
      <h1>🎂 Welcome to CakeNKitchen!</h1>
      <p>Order delicious cakes online. Freshly baked, delivered to your door.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {[
          { name: 'Chocolate Fudge', desc: 'Rich chocolate with ganache', price: 600 },
          { name: 'Black Forest', desc: 'Classic with cherries', price: 700 },
          { name: 'Strawberry Delight', desc: 'Fresh strawberries', price: 550 }
        ].map((cake, i) => (
          <div key={i} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <h3>{cake.name}</h3>
            <p>{cake.desc}</p>
            <p><strong>NPR {cake.price}</strong></p>
            <button style={{ background: '#e67e22', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ LOGIN PAGE ============
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      setMsg('✅ Login successful!');
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.error || 'Login failed'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>🔐 Login</h2>
      {msg && <p style={{ color: msg.includes('✅') ? 'green' : 'red' }}>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#2d2d2d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
      </form>
      <p style={{ textAlign: 'center' }}>Don't have an account? <a href="/register">Register</a></p>
    </div>
  );
}

// ============ REGISTER PAGE ============
function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMsg(res.ok ? '✅ Registration successful!' : '❌ ' + data.error);
      if (res.ok) setForm({ name: '', email: '', phone: '', password: '' });
    } catch {
      setMsg('❌ Server error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>📝 Register</h2>
      {msg && <p style={{ color: msg.includes('✅') ? 'green' : 'red' }}>{msg}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }} required />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ textAlign: 'center' }}>Already have an account? <a href="/login">Login</a></p>
    </div>
  );
}

export default App;