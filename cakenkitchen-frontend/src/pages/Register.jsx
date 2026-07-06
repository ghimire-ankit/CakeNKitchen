import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

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
      await registerUser(form);
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

export default Register;
