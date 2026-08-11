import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCategories, fetchCakes } from '../services/api';

const getCategoryIcon = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('anniversary')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="14" r="6"/><path d="M12 4l2 3h-4z"/></svg>;
  if (n.includes('birth')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M12 8v13M3 13h18M12 8c-2-2-5-2-5 0s5 2 5 2 5-2 5 0-3 2-5 0z"/></svg>;
  if (n.includes('wedding')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 20h20M3 17l3-10 4 4 2-7 2 7 4-4 3 10z"/></svg>;
  if (n.includes('engage')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 3h12l4 6-10 12L2 9l4-6z"/><path d="M2 9h20M12 21V9M6 3l6 6M18 3l-6 6"/></svg>;
  if (n.includes('pastries') || n.includes('pastry')) return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 16v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3M18 16H6c-2 0-3-1-3-3s2-5 5-5c1 0 1-2 2-2h4c1 0 1 2 2 2 3 0 5 3 5 5s-1 3-3 3z"/></svg>;
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v4M8 2v4M16 2v4M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"/><path d="M4 10c0-2 16-2 16 0"/></svg>;
};

function Home() {
  const [categories, setCategories] = useState([]);
  const [cakes, setCakes] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setLoading(true);
        const catRes = await fetchCategories();
        if (catRes.success) setCategories(catRes.data);

        const cakeRes = await fetchCakes();
        if (cakeRes.success) {
          setCakes(cakeRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching catalog data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.cat_id === catId);
    return cat ? cat.name : 'Delicious Cakes';
  };

  const handleHighlightClick = (catNameFragment) => {
    const match = categories.find(c => c.name.toLowerCase().includes(catNameFragment.toLowerCase()));
    if (match) {
      setSelectedCat(match.cat_id);
    }
    const el = document.getElementById('shop-menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredCakes = useMemo(() => {
    let result = cakes;
    if (selectedCat !== null) {
      result = result.filter(cake => cake.cat_id === selectedCat);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(cake => cake.name.toLowerCase().includes(q) || cake.description.toLowerCase().includes(q));
    }
    return result;
  }, [cakes, selectedCat, searchQuery]);

  return (
    <div>
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-kicker">FRESH DAILY • DHANGADHI</span>
            <h1 className="hero-title-main">
              Fresh cakes,<br />
              <span>baked daily.</span>
            </h1>
            <p>We make everything from scratch every morning in Dhangadhi, using real ingredients you can recognize.</p>
            <div className="hero-buttons">
              <a href="#shop-menu" className="btn-primary" id="hero-cta-btn">Order Now</a>
              <a href="#shop-menu" className="btn-outline-light">BROWSE MENU</a>
            </div>
            <div className="hero-tags">
              <span className="hero-tag">5★ Reviews</span>
              <span className="hero-tag">Local Ingredients</span>
              <span className="hero-tag">Same-Day Delivery</span>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="rating-badge">
              <strong>4.9★</strong>
              <br />
              AVG RATING
            </div>
            <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80" alt="Special Cake" />
            <div className="delivery-badge">
              <strong>2000+</strong>
              <br />
              CAKES DELIVERED
            </div>
          </div>
        </div>
      </section>

      <div className="value-props-strip">
        <div className="value-props-content">
          <div className="prop-item">
            <span className="prop-icon">🌿</span>
            <div className="prop-text">
              <h4>Real Ingredients</h4>
              <p>We bake with fresh, local produce and no artificial dyes.</p>
            </div>
          </div>
          <div className="prop-item">
            <span className="prop-icon">👨‍🍳</span>
            <div className="prop-text">
              <h4>Baked from Scratch</h4>
              <p>Every recipe is made by hand in our kitchen, daily.</p>
            </div>
          </div>
          <div className="prop-item">
            <span className="prop-icon">🚀</span>
            <div className="prop-text">
              <h4>Same-Day Delivery</h4>
              <p>Order by 11:00 AM for fresh delivery in Dhangadhi.</p>
            </div>
          </div>
          <div className="prop-item">
            <span className="prop-icon">📞</span>
            <div className="prop-text">
              <h4>Custom Cakes</h4>
              <p>Need a custom design? Just call us to discuss your ideas.</p>
            </div>
          </div>
        </div>
      </div>

      <section className="our-story-section">
        <div className="our-story-content">
          <div className="story-images">
            <div className="story-images-inner">
              <img src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&auto=format&fit=crop&q=60" className="story-img-1" alt="Cake 1" />
              <img src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&auto=format&fit=crop&q=60" className="story-img-2" alt="Cake 2" />
            </div>
          </div>
          <div className="story-text">
            <span className="section-label">OUR STORY</span>
            <h2>What Makes Us <span>Different?</span></h2>
            <p>Founded in Dhangadhi, <strong>Cake & Kitchen</strong> grew from a family passion for confectionery into Sudurpaschim's most-loved artisan bakery. Every cake leaves our kitchen the same day it is baked – no shortcuts, no refrigerated leftovers.</p>
            <ul className="story-list">
              <li>✓ Morning Coffee & In-house Pastries</li>
              <li>✓ Seasonal Fresh Ingredients</li>
              <li>✓ Bespoke Custom Designs</li>
              <li>✓ No Artificial Preservatives</li>
            </ul>
            <a href="#shop-menu" className="btn-primary" style={{marginTop: '1rem'}}>Explore Our Menu</a>
          </div>
        </div>
      </section>
      <section className="menu-highlights-section">
        <div className="menu-highlights-content">
          <div className="highlights-header">
            <h2>Menu Highlights</h2>
            <p>Full menu available in-store and online.</p>
          </div>
          <div className="highlights-grid">
            <div className="highlight-card" onClick={() => handleHighlightClick('Anniversary')}>
              <img src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=600&auto=format&fit=crop&q=60" alt="Anniversary Collection" />
              <div className="highlight-overlay">
                <h3>Anniversary Collection</h3>
                <p>From rose-gold tiers to velvet hearts</p>
              </div>
            </div>
            <div className="highlight-card" onClick={() => handleHighlightClick('Birth')}>
              <img src="https://images.unsplash.com/photo-1557308536-ee471ef2c390?w=600&auto=format&fit=crop&q=60" alt="Birthday Confections" />
              <div className="highlight-overlay">
                <h3>Birthday Confections</h3>
                <p>Personalised candles included</p>
              </div>
            </div>
            <div className="highlight-card" onClick={() => handleHighlightClick('Wedding')}>
              <img src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=60" alt="Wedding Tiers" />
              <div className="highlight-overlay">
                <h3>Wedding Tiers</h3>
                <p>Multi-tier grandeur, fresh florals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="browse-category-section" style={{ padding: '4rem 0', background: 'var(--bg-main)' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '3rem' }}>Browse By Category</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>
        ) : (
          <div className="circular-category-container">
            <div
              className={`circular-cat-item ${selectedCat === null ? 'active' : ''}`}
              onClick={() => setSelectedCat(null)}
            >
              <div className="icon-circle">{getCategoryIcon('All')}</div>
              <span>All</span>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.cat_id}
                className={`circular-cat-item ${selectedCat === cat.cat_id ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.cat_id)}
              >
                <div className="icon-circle">{getCategoryIcon(cat.name)}</div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="popular-cakes-section" id="shop-menu" style={{ maxWidth: '1150px', margin: '0 auto', padding: '4rem 2rem 0' }}>
        <div className="popular-cakes-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--primary)', margin: 0 }}>Popular Cakes</h2>
          <div className="pill-filters">
             <button className={selectedCat === null ? 'active' : ''} onClick={() => setSelectedCat(null)}>All</button>
             {categories.map((cat) => (
                <button key={cat.cat_id} className={selectedCat === cat.cat_id ? 'active' : ''} onClick={() => setSelectedCat(cat.cat_id)}>{cat.name}</button>
             ))}
          </div>
        </div>
        
        <div className="search-bar-full" style={{ marginBottom: '3rem' }}>
          <svg className="search-icon-svg" viewBox="0 0 24 24" width="20" height="20" fill="#999"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input 
            type="text" 
            placeholder="Search by name or flavour..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '600px', padding: '1rem 1rem 1rem 3rem', borderRadius: '30px', border: '1px solid #f1ece4', background: '#fdfbf7', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Fetching cakes...</div>
        ) : filteredCakes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-light)' }}>
            No cakes found matching your selection.
          </div>
        ) : (
          <div className="cakes-grid">
            {filteredCakes.map((cake, index) => {
              let topBadge = '';
              if (index === 0) topBadge = 'Best Seller';
              else if (index === 3) topBadge = 'Hot';
              
              return (
              <Link className="cake-card-new" key={cake.cake_id} to={`/cake/${cake.cake_id}`}>
                <div className="cake-img-wrapper">
                  {topBadge && <span className="top-badge">{topBadge}</span>}
                  <img src={getImageUrl(cake.image_url)} alt={cake.name} />
                  <span className="bottom-badge">{getCategoryName(cake.cat_id)}</span>
                </div>
                <div className="cake-info">
                  <h3>{cake.name}</h3>
                  <div className="cake-rating">
                    <span className="stars">★★★★★</span> 4.9 <span className="reviews">({Math.floor(Math.random() * 100 + 20)} reviews)</span>
                  </div>
                  <div className="cake-bottom-row">
                    <span className="price">NPR {cake.base_price.toLocaleString()}</span>
                    <div className="actions">
                      <span className="view-btn">View</span>
                    </div>
                  </div>
                </div>
              </Link>
            )})}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
