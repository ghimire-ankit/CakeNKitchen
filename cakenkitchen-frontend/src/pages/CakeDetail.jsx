import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCakeById } from '../services/api';

function CakeDetail({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cake, setCake] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customization State
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('1 lb');
  const [message, setMessage] = useState('');
  const [flavor, setFlavor] = useState('Black Forest');
  const [eggless, setEggless] = useState(false);

  // Feature State
  const [activeTab, setActiveTab] = useState('desc');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadCake = async () => {
      try {
        setLoading(true);
        const res = await fetchCakeById(id);
        if (res.success) setCake(res.data);
      } catch (err) {
        console.error('Error fetching cake detail, using local fallback:', err);
        const mockCakes = [
          { cake_id: 1, name: 'Classic Rose Anniversary', description: 'Double-tiered red velvet sponge with elegant white buttercream piping.', base_price: 1200.00, cat_id: 1, image_url: 'Anniversary.jpeg', is_available: true },
          { cake_id: 2, name: 'Luxury Golden Anniversary', description: 'Three-tier vanilla sponge accented with gold leaf sheets and white roses.', base_price: 2800.00, cat_id: 1, image_url: 'Deluxe_Anniversary.jpeg', is_available: true },
          { cake_id: 3, name: 'Elegant Floral Engagement', description: 'Delightful strawberry chiffon block garnished with delicate sugar flowers.', base_price: 1500.00, cat_id: 1, image_url: 'Engagement_cake.jpeg', is_available: true },
          { cake_id: 4, name: 'Bridal Lace White Forest', description: 'Traditional white forest base decorated with cream pearls and floral lace tiering.', base_price: 1800.00, cat_id: 1, image_url: 'White_forest_anniversary.jpeg', is_available: true },
          { cake_id: 5, name: 'Midnight Snow Birthday Cake', description: 'Rich chocolate cake with white snowflake frosting highlights.', base_price: 900.00, cat_id: 2, image_url: 'snow_birthday_cake.jpeg', is_available: true },
          { cake_id: 6, name: 'Royal Barbie Doll Birthday', description: 'Vanilla chiffon cake shaped beautifully like a barbie doll dress with pink frosting.', base_price: 1600.00, cat_id: 2, image_url: 'Barbie_birthday.jpeg', is_available: true },
          { cake_id: 7, name: 'Blueberry Cream Birthday Bliss', description: 'Zesty blueberry puree sponge layered with creamy heavy frosting toppings.', base_price: 950.00, cat_id: 2, image_url: 'Blueberry_birthday.jpeg', is_available: true },
          { cake_id: 8, name: 'Cricket Pitch Birthday Special', description: 'Green velvet grass-textured cake themed for cricket fans with fondant wickets.', base_price: 1100.00, cat_id: 2, image_url: 'Cricket_birthday_cake.jpeg', is_available: true },
          { cake_id: 9, name: 'Royal Baby Shower Dream', description: 'Light and fluffy strawberry card layers decorated with blue/pink cloud frosting.', base_price: 1350.00, cat_id: 3, image_url: 'Baby_shower.jpeg', is_available: true },
          { cake_id: 10, name: 'Artisanal Mother\'s Day Fondant', description: 'Heart-shaped strawberry cream cake dedicated with fondant calligraphy greetings.', base_price: 1000.00, cat_id: 3, image_url: 'Mothers_day.jpeg', is_available: true }
        ];
        const found = mockCakes.find(c => c.cake_id == id);
        if (found) setCake(found);
      } finally {
        setLoading(false);
      }
    };
    loadCake();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem 0', fontWeight: 800, color: 'var(--text-light)' }}>Loading artisanal profile...</div>;
  if (!cake) return <div style={{ textAlign: 'center', padding: '4rem 0' }}><h2>Cake Not Found</h2><button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1.5rem' }}>Back to Home</button></div>;

  const sizeMultiplier = size === '2 lbs' ? 1.8 : size === '3 lbs' ? 2.6 : 1.0;
  const flavorPrice = flavor === 'Red Velvet' ? 150 : flavor === 'Truffle' ? 200 : flavor === 'Butterscotch' ? 50 : 0;
  const egglessPrice = eggless ? 100 : 0;
  const currentPrice = Math.round((Number(cake.base_price) * sizeMultiplier) + flavorPrice + egglessPrice);

  const handlePincodeCheck = () => {
    if (pincode.length < 4) return setPincodeStatus('error');
    setPincodeStatus('loading');
    setTimeout(() => {
      setPincodeStatus(['44600', '44700', '44601'].includes(pincode) ? 'success' : 'error');
    }, 800);
  };

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

        {/* Quality Badges */}
        <div className="quality-badges-row">
          <span className="q-badge">✨ Freshly Baked</span>
          <span className="q-badge">🚚 Same Day Delivery</span>
          <span className="q-badge">✅ Premium Ingredients</span>
        </div>
      </div>

      <div className="detail-info">
        <div className="detail-header-row">
          <span className="detail-category">Artisanal Choice</span>
          {/* Simple toggle for eggless */}
          <label className="eggless-toggle">
            <input type="checkbox" checked={eggless} onChange={(e) => setEggless(e.target.checked)} />
            <span className="slider round"></span>
            <span className="toggle-label">Make it Eggless (+NPR 100)</span>
          </label>
        </div>

        <h1 className="detail-title">{cake.name}</h1>
        <div className="detail-price">NPR {currentPrice}</div>

        {/* Detail Tabs */}
        <div className="detail-tabs">
          <button className={`tab-btn ${activeTab === 'desc' ? 'active' : ''}`} onClick={() => setActiveTab('desc')}>Description</button>
          <button className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>Ingredients</button>
        </div>
        <div className="tab-content">
          {activeTab === 'desc' ? (
            <p className="detail-description">{cake.description}</p>
          ) : (
            <p className="detail-description">Made with pure butter, premium flour, and finest Madagascar vanilla beans. Contains dairy and gluten. {eggless ? 'Specially prepared entirely without eggs.' : 'Contains farm-fresh eggs.'}</p>
          )}
        </div>
        <div className="option-group">
          <span className="option-label">Select Sponge Flavor:</span>
          <div className="size-select-buttons" style={{ flexWrap: 'wrap' }}>
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
        <div className="pincode-checker">
          <span className="option-label" style={{ marginBottom: 0 }}>Check Delivery Availability:</span>
          <div className="pincode-input-row">
            <input type="text" className="form-input pincode-input" placeholder="Enter Pincode (e.g., 44600)" value={pincode} onChange={e => setPincode(e.target.value)} />
            <button className="btn-outline check-btn" onClick={handlePincodeCheck}>Check</button>
          </div>
          {pincodeStatus === 'loading' && <span className="pin-msg">Checking delivery network...</span>}
          {pincodeStatus === 'success' && <span className="pin-msg success">🚚 Delivery is available in your area!</span>}
          {pincodeStatus === 'error' && <span className="pin-msg error">❌ Sorry, we do not deliver to this pincode yet.</span>}
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
