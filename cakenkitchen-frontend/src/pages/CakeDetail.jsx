import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCakeById, fetchCategories } from '../services/api';

function CakeDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cake, setCake] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('1 lb');
  const [message, setMessage] = useState('');
  const [flavor, setFlavor] = useState('Black Forest');
  const [eggless, setEggless] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cakeRes, catRes] = await Promise.all([fetchCakeById(id), fetchCategories()]);
        if (cakeRes.success) setCake(cakeRes.data);
        if (catRes.data) setCategories(catRes.data);
      } catch (err) {
        console.error('Error fetching cake detail:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0', fontWeight: 800, color: 'var(--text-light)' }}>Loading product details...</div>;
  if (!cake) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><h2>Cake Not Found</h2><button onClick={() => navigate('/')} className="btn-primary" style={{marginTop: '1.5rem'}}>Back to Home</button></div>;

  const categoryName = categories.find(c => c.cat_id === cake.cat_id)?.name || '';
  const sizeMultiplier = size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0;
  const flavorPrice = flavor === 'Red Velvet' ? 150 : flavor === 'Truffle' ? 200 : flavor === 'Butterscotch' ? 50 : 0;
  const egglessPrice = eggless ? 100 : 0;
  const currentPrice = Math.round((Number(cake.base_price) * sizeMultiplier) + flavorPrice + egglessPrice);

  const handleAddToCart = () => {
    const fullMessage = `[${flavor}${eggless ? ' | Eggless' : ''}] ${message.trim() || 'No Text'}`;
    addToCart(cake, qty, size, fullMessage, currentPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="detail-container" id="cake-detail-view">
      <div className="detail-gallery">
        <div className="cake-preview-container">
          {eggless && <div className="veg-badge">🌱 100% Eggless</div>}
          <img src={getImageUrl(cake.image_url)} alt={cake.name} className="cake-preview-image" />
        </div>
        <div className="quality-badges-row">
           <span className="q-badge">✨ Freshly Baked</span>
           <span className="q-badge">🚚 Same Day Delivery</span>
           <span className="q-badge">✅ Premium Ingredients</span>
        </div>
      </div>

      <div className="detail-info">
        <div className="detail-header-row">
           {categoryName && <span className="detail-category">{categoryName}</span>}
           <label className="eggless-toggle">
              <input type="checkbox" checked={eggless} onChange={(e) => setEggless(e.target.checked)} />
              <span className="slider round"></span>
              <span className="toggle-label">Make it Eggless (+NPR 100)</span>
           </label>
        </div>
        <h1 className="detail-title">{cake.name}</h1>
        <div className="detail-price">NPR {currentPrice}</div>

        {/* Description from database */}
        {cake.description && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>About This Cake</h3>
            <p className="detail-description">{cake.description}</p>
          </div>
        )}

        <div className="option-group">
          <span className="option-label">Select Sponge Flavor:</span>
          <div className="size-select-buttons" style={{flexWrap: 'wrap'}}>
            {['Black Forest', 'White Forest', 'Butterscotch', 'Pineapple', 'Red Velvet'].map((f) => (
              <button
                key={f}
                className={`size-btn flavor-btn ${flavor === f ? 'active' : ''}`}
                onClick={() => setFlavor(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="option-group">
          <span className="option-label">Weight Size:</span>
          <div className="size-select-buttons">
            {['1 lb', '2 lbs', '3 lbs', 'Custom'].map((s) => (
              <button key={s} className={`size-btn ${size === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
          {size === 'Custom' && (
            <small style={{ color: 'var(--accent)', marginTop: '0.6rem', display: 'block', fontSize: '0.8rem', fontWeight: 800 }}>
              * Please write your desired weight (e.g., 5 lbs, 2-tier) in the Customize Cake box below. Final price will be adjusted upon confirmation.
            </small>
          )}
        </div>
        <div className="option-group">
          <label className="option-label" htmlFor="cake-text-msg">Customize Cake:</label>
          <textarea
            id="cake-text-msg"
            placeholder="E.g., Write 'Happy Birthday Ankit', or 'Please use less sugar'..."
            className="form-input"
            style={{ resize: 'vertical', minHeight: '80px' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <small style={{ color: 'var(--text-light)', marginTop: '0.4rem', display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Add any special instructions or text to write on the cake.</small>
        </div>
        <div className="actions-row" style={{ alignItems: 'center' }}>
          <div className="quantity-controller" style={{ marginRight: '1rem' }}>
            <button className="quantity-btn" onClick={() => setQty(Math.max(1, qty - 1))} id="btn-qty-dec">-</button>
            <span className="quantity-value" id="qty-val">{qty}</span>
            <button className="quantity-btn" onClick={() => setQty(qty + 1)} id="btn-qty-inc">+</button>
          </div>
          <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, padding: '1.2rem' }} id="btn-add-to-cart">
            {added ? '✓ Added to Basket' : `Add to Basket - NPR ${currentPrice * qty}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CakeDetail;
