import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCategories, fetchCakes } from '../services/api';

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

  // Filter cakes by category AND search query
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
      {/* Promo Announcement Banner */}
      <div className="promo-banner">
        <span>🎉 Special Offer: Use code <strong>CAKE10</strong> for 10% off your entire order!</span>
      </div>

      {/* Scalloped Confectionery Hero Section */}
      <div className="hero-scalloped-divider">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,48 C15,48 30,36 45,36 C60,36 75,48 90,48 C105,48 120,36 135,36 C150,36 165,48 180,48 C195,48 210,36 225,36 C240,36 255,48 270,48 C285,48 300,36 315,36 C330,36 345,48 360,48 C375,48 390,36 405,36 C420,36 435,48 450,48 C465,48 480,36 495,36 C510,36 525,48 540,48 C555,48 570,36 585,36 C600,36 615,48 630,48 C645,48 660,36 675,36 C690,36 705,48 720,48 C735,48 750,36 765,36 C780,36 795,48 810,48 C825,48 840,36 855,36 C870,36 885,48 900,48 C915,48 930,36 945,36 C960,36 975,48 990,48 C1005,48 1020,36 1035,36 C1050,36 1065,48 1080,48 C1095,48 1110,36 1125,36 C1140,36 1155,48 1170,48 C1185,48 1200,36 1215,36 C1230,36 1245,48 1260,48 C1275,48 1290,36 1305,36 C1320,36 1335,48 1350,48 C1365,48 1380,36 1395,36 C1410,36 1425,48 1440,48 L1440,0 L0,0 Z" fill="#ffffff" />
        </svg>
      </div>

      <section className="confectionery-hero-section">
        {/* Left visually rich side */}
        <div className="confectionery-visual">
          <div className="floating-price-tag">
            <span>NPR</span>
            <strong>250</strong>
          </div>
          <div className="cutout-image-wrapper">
            <img src="https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=600&auto=format&fit=crop&q=80" alt="Gourmet Confectionery Pink Rose Cupcake" className="confectionery-cupcake" />
          </div>
        </div>

        {/* Right content side */}
        <div className="confectionery-content">
          <h1>Dessert Shop with Quality Cakes ...</h1>
          <p>Affordable and delicious treats by CakeNKitchen is a family-owned dessert shop in Dhangadhi. We are passionate about creating delicious and affordable desserts that will make your taste buds sing.</p>
          <a href="#shop-menu" className="btn-confectionery-purchase" id="hero-cta-btn">Purchase now</a>
        </div>
      </section>

      {/* Value Propositions Strip */}
      <div className="value-props-strip">
        <div className="prop-item">🚚 <span>Instant Delivery within Hour inside Dhangadhi</span></div>
        <div className="prop-item">🌱 <span>100% Eggless Options</span></div>
        <div className="prop-item">✨ <span>Premium Ingredients</span></div>
        <div className="prop-item">🎂 <span>Customized Designs</span></div>
      </div>

      {/* Toolbar / Search */}
      <section className="catalog-toolbar-panel" id="shop-menu">
        <div className="category-title-section" style={{ marginBottom: 0, textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.8rem' }}>Explore Menu</h2>
        </div>
        <div className="search-input-box">
          <svg className="search-icon-svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
          <input
            type="text"
            className="search-field"
            placeholder="Search for Chocolate, Red Velvet, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Category Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading menu...</div>
        ) : (
          <div className="category-grid">
            <div
              className={`category-card ${selectedCat === null ? 'active' : ''}`}
              onClick={() => setSelectedCat(null)}
              id="cat-filter-all"
            >
              <img src="https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=150&auto=format&fit=crop&q=60" alt="All categories" />
              <h3>All Flavors</h3>
            </div>
            {categories.map((cat) => (
              <div
                key={cat.cat_id}
                className={`category-card ${selectedCat === cat.cat_id ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.cat_id)}
                id={`cat-filter-${cat.cat_id}`}
              >
                <img src={getImageUrl(cat.image_url)} alt={cat.name} />
                <h3>{cat.name}</h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Products Cake Grid */}
      <section>
        <div className="cakes-section-header">
          <h2>{searchQuery ? `Search Results for "${searchQuery}"` : selectedCat === null ? 'Featured Collection' : getCategoryName(selectedCat)}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {filteredCakes.length} cakes available
          </span>
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
              // Assign a dynamic badge for variety
              let badge = 'Premium';
              if (index === 0 || index === 4) badge = 'Bestseller 🔥';
              if (index === 2) badge = 'Chef Special ⭐';

              return (
                <div className="cake-card" key={cake.cake_id} id={`cake-card-${cake.cake_id}`}>
                  <div className="cake-image-container">
                    <img src={getImageUrl(cake.image_url)} alt={cake.name} />
                    <span className={`cake-badge ${badge.includes('Bestseller') ? 'badge-hot' : ''}`}>{badge}</span>
                  </div>
                  <div className="cake-card-body">
                    <h3 className="cake-title">{cake.name}</h3>
                    <p className="cake-desc">{cake.description}</p>
                    <div className="cake-footer">
                      <span className="cake-price">NPR {cake.base_price}</span>
                      <Link to={`/cake/${cake.cake_id}`} className="btn-primary" style={{ padding: '0.6rem 1.4rem', fontSize: '0.75rem' }} id={`btn-view-${cake.cake_id}`}>
                        Customize
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
