import { useState } from 'react';

const SHAPES = [
  { id: 'round', label: 'Round', emoji: '⭕' },
  { id: 'square', label: 'Square', emoji: '⬜' },
  { id: 'heart', label: 'Heart', emoji: '❤️' },
  { id: 'rectangle', label: 'Rectangle', emoji: '▬' },
  { id: 'hexagon', label: 'Hexagon', emoji: '⬡' },
  { id: 'custom', label: 'Custom', emoji: '✨' },
];

const TIERS = [
  { id: 1, label: '1 Tier', price: 0 },
  { id: 2, label: '2 Tiers', price: 800 },
  { id: 3, label: '3 Tiers', price: 1800 },
];

const SIZES = [
  { id: '1 lb', serves: '4-6', multiplier: 1.0 },
  { id: '2 lbs', serves: '8-12', multiplier: 1.8 },
  { id: '3 lbs', serves: '14-18', multiplier: 2.6 },
  { id: '5 lbs', serves: '25-30', multiplier: 4.0 },
];

const BASE_PRICE = 800;

function CustomCake({ addToCart }) {
  const [added, setAdded] = useState(false);
  const [shape, setShape] = useState('round');
  const [customShape, setCustomShape] = useState('');
  const [tiers, setTiers] = useState(1);
  const [size, setSize] = useState('1 lb');
  const [eggless, setEggless] = useState(false);
  const [qty, setQty] = useState(1);
  const [cakeMessage, setCakeMessage] = useState('');
  const [instructions, setInstructions] = useState('');

  const sizeData = SIZES.find(s => s.id === size);
  const tierData = TIERS.find(t => t.id === tiers);
  const egglessCharge = eggless ? 100 : 0;
  const price = Math.round((BASE_PRICE * (sizeData?.multiplier || 1)) + (tierData?.price || 0) + egglessCharge);
  const shapeLabel = shape === 'custom' ? (customShape || 'Custom Shape') : SHAPES.find(s => s.id === shape)?.label;

  const handleAddToCart = () => {
    const msg = [
      '🎨 CUSTOM BUILD',
      `Shape: ${shapeLabel}`,
      `Tiers: ${tiers}`,
      eggless ? 'Eggless' : null,
      cakeMessage ? `Cake Text: "${cakeMessage}"` : null,
      instructions ? `Instructions: ${instructions}` : null,
    ].filter(Boolean).join(' | ');

    addToCart({
      cake_id: `custom-${Date.now()}`,
      name: `Custom ${shapeLabel} Cake`,
      base_price: price,
      image_url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500&auto=format&fit=crop&q=60',
    }, qty, size, msg, price);

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="cb-page" id="custom-cake-builder">
      <div className="cb-header">
        <span className="detail-category">✨ Build Your Own</span>
        <h1 className="cb-main-title">Custom Cake Studio</h1>
        <p className="cb-main-desc">Design your dream cake from scratch — choose shape, size, and describe exactly what you want.</p>
      </div>

      <div className="cb-body-layout">
        <div className="cb-main-panel">
          <div className="checkout-section">
            <h3 className="section-title"><span>1</span> Cake Shape</h3>
            <div className="cb-shape-grid">
              {SHAPES.map(s => (
                <button key={s.id} className={`size-btn ${shape === s.id ? 'active' : ''}`} onClick={() => setShape(s.id)}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            {shape === 'custom' && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor="custom-shape-text">Describe your shape</label>
                <input id="custom-shape-text" type="text" className="form-input" placeholder="E.g., Butterfly, Guitar, Car, Number '25'..." value={customShape} onChange={e => setCustomShape(e.target.value)} />
              </div>
            )}
          </div>

          <div className="checkout-section">
            <h3 className="section-title"><span>2</span> Tiers & Size</h3>
            <div className="option-group">
              <span className="option-label">Number of Tiers</span>
              <div className="size-select-buttons">
                {TIERS.map(t => (
                  <button key={t.id} className={`size-btn ${tiers === t.id ? 'active' : ''}`} onClick={() => setTiers(t.id)}>
                    {t.label}{t.price > 0 ? ` (+NPR ${t.price})` : ''}
                  </button>
                ))}
              </div>
            </div>
            <div className="option-group">
              <span className="option-label">Weight Per Tier</span>
              <div className="size-select-buttons" style={{ flexWrap: 'wrap' }}>
                {SIZES.map(s => (
                  <button key={s.id} className={`size-btn ${size === s.id ? 'active' : ''}`} onClick={() => setSize(s.id)}>
                    {s.id} <small style={{ fontWeight: 600 }}>(Serves {s.serves})</small>
                  </button>
                ))}
              </div>
            </div>
            <label className="eggless-toggle" style={{ marginTop: '0.5rem' }}>
              <input type="checkbox" checked={eggless} onChange={e => setEggless(e.target.checked)} />
              <span className="slider round"></span>
              <span className="toggle-label">Make it 100% Eggless (+NPR 100)</span>
            </label>
          </div>

          <div className="checkout-section">
            <h3 className="section-title"><span>3</span> Personalize</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="cb-cake-msg">Text on Cake (Optional)</label>
              <input id="cb-cake-msg" type="text" className="form-input" placeholder="E.g., Happy Birthday Sita!, Congratulations!..." value={cakeMessage} onChange={e => setCakeMessage(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cb-instructions">Instructions for Baker</label>
              <textarea
                id="cb-instructions"
                className="form-input"
                style={{ resize: 'vertical', minHeight: '120px' }}
                placeholder="Describe everything you want — flavor, frosting, toppings, color theme, decorations, allergen warnings, or any special requests. E.g., Rich chocolate sponge with white fondant coating, gold leaf on top, pink roses around the base, minimal sugar..."
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
              />
            </div>

            <div className="actions-row" style={{ alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              <div className="quantity-controller" style={{ marginRight: '1rem' }}>
                <button className="quantity-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                <span className="quantity-value">{qty}</span>
                <button className="quantity-btn" onClick={() => setQty(qty + 1)}>+</button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary" style={{ flex: 1, padding: '1.2rem' }} id="btn-custom-add-cart">
                {added ? '✓ Added to Basket!' : `Add to Basket — NPR ${price * qty}`}
              </button>
            </div>
          </div>
        </div>

        <aside className="cart-summary-panel sticky-summary">
          <h3 className="summary-title">Your Custom Cake</h3>
          <div className="cb-summary-visual">{'🎂'.repeat(tiers)}</div>
          <div className="cb-detail-row"><span>Shape</span><strong>{shapeLabel}</strong></div>
          <div className="cb-detail-row"><span>Tiers</span><strong>{tiers} Tier{tiers > 1 ? 's' : ''}</strong></div>
          <div className="cb-detail-row"><span>Weight</span><strong>{size}</strong></div>
          {eggless && <div className="cb-detail-row"><span>Diet</span><strong>🌱 Eggless</strong></div>}
          {cakeMessage && <div className="cb-detail-row"><span>Cake Text</span><strong>"{cakeMessage}"</strong></div>}
          <div className="summary-row" style={{ marginTop: '1rem' }}>
            <span>Base Price ({size})</span>
            <span>NPR {Math.round(BASE_PRICE * (sizeData?.multiplier || 1))}</span>
          </div>
          {tierData?.price > 0 && <div className="summary-row"><span>{tiers} Tiers</span><span>+NPR {tierData.price}</span></div>}
          {eggless && <div className="summary-row"><span>Eggless</span><span>+NPR 100</span></div>}
          <div className="summary-row total"><span>Estimated Total</span><span>NPR {price}</span></div>
          <small style={{ display: 'block', color: 'var(--text-light)', fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.5, marginTop: '0.8rem' }}>
            * Final price may vary for complex custom shapes. Our team will confirm before baking.
          </small>
        </aside>
      </div>
    </div>
  );
}

export default CustomCake;
