import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { fetchCategories, fetchCakes } from '../services/api';
import '../styles/home.css';

const CATS = [
  { id: null, label: 'All', icon: '🎂' },
  { id: 1, label: 'Anniversary', icon: '💍' },
  { id: 2, label: 'Birthday', icon: '🎉' },
  { id: 3, label: 'Wedding', icon: '👑' },
  { id: 4, label: 'Engagement', icon: '💎' },
  { id: 5, label: 'Pastries', icon: '🥐' },
];

const FEATURES = [
  { icon: '🌿', title: 'Natural Ingredients', text: 'Locally-sourced organic produce, zero artificial colours' },
  { icon: '👨‍🍳', title: 'Master Bakers', text: 'Crafted by trained confectioners with 10+ years experience' },
  { icon: '🚀', title: 'Same-Day Delivery', text: 'Order before 11 AM for afternoon delivery in Dhangadhi' },
  { icon: '📞', title: 'Custom Orders', text: 'Bespoke tiers, corporate gifting, wedding commissions' },
];

const FALLBACK = [
  { cake_id: 1, name: 'Classic Rose Tier', description: 'Red velvet sponge with white buttercream piping and fresh rose petals.', base_price: 1200, cat_id: 1, image_url: 'Anniversary.jpeg', is_available: true },
  { cake_id: 2, name: 'Midnight Chocolate Dream', description: 'Triple-layer Dutch cocoa cake with dark ganache and gold leaf accents.', base_price: 900, cat_id: 2, image_url: 'snow_birthday_cake.jpeg', is_available: true },
  { cake_id: 3, name: 'Cloud Baby Celebration', description: 'Chiffon layers with fresh strawberry cream and pastel sugar art.', base_price: 1350, cat_id: 3, image_url: 'Baby_shower.jpeg', is_available: true },
  { cake_id: 4, name: 'White Velvet Wedding', description: 'Three-tier white velvet with pearl sugar details and fresh florals.', base_price: 3500, cat_id: 3, image_url: 'Anniversary.jpeg', is_available: true },
  { cake_id: 5, name: 'Golden Anniversary', description: 'Gold-dusted chocolate sponge with salted caramel buttercream.', base_price: 1600, cat_id: 1, image_url: 'snow_birthday_cake.jpeg', is_available: true },
  { cake_id: 6, name: 'Butter Croissant Box', description: 'Four freshly-baked croissants, flaky and golden, served warm.', base_price: 450, cat_id: 5, image_url: 'Baby_shower.jpeg', is_available: true },
];

const RATINGS = [4.9, 4.8, 5.0, 4.7, 4.9, 4.8];

function Star({ val }) {
  return <span className="star-rating">{'★'.repeat(Math.floor(val))} <em>{val.toFixed(1)}</em></span>;
}

export default function Home({ addToCart, searchQuery, setSearchQuery, selectedCat, setSelectedCat }) {
  const navigate = useNavigate();
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCakes();
        setCakes(res.success && res.data?.length ? res.data : FALLBACK);
      } catch { setCakes(FALLBACK); }
      finally { setLoading(false); }
    })();
  }, []);

<<<<<<< HEAD
  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.cat_id === catId);
    return cat ? cat.name : 'Delicious Cakes';
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
      <div className="promo-banner">
        <span>🎉 Special Offer: Use code <strong>CAKE10</strong> for 10% off your entire order!</span>
      </div>
      <section className="hero-section">
        <div className="hero-text">
          <h1>Freshly Baked for Your <span>Best Days</span></h1>
          <p>From grand milestones to unforgettable midnight surprises. We bake happiness for your happiest moments in Nepal.</p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <a href="#shop-menu" className="btn-primary" id="hero-cta-btn">View Menu</a>
            <a href="#shop-menu" className="btn-outline">Order Eggless</a>
=======
  const visible = useMemo(() => {
    let r = cakes;
    if (selectedCat !== null) r = r.filter(c => c.cat_id === Number(selectedCat));
    if (searchQuery?.trim()) { const q = searchQuery.toLowerCase(); r = r.filter(c => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)); }
    return r;
  }, [cakes, selectedCat, searchQuery]);

  const handleAdd = (cake) => {
    addToCart?.(cake, 1, '1 lb', '');
    setAddingId(cake.cake_id);
    setTimeout(() => setAddingId(null), 900);
  };

  const catName = (id) => CATS.find(c => c.id === id)?.label || 'Special';

  return (
    <div className="home">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner wrap">
          <div className="hero-copy">
            <p className="eyebrow">Artisan Bakery · Dhangadhi, Nepal</p>
            <h1 className="hero-title">
              Sweet Moments<br /><em>Start Here.</em>
            </h1>
            <p className="hero-body">
              Handcrafted cakes made fresh every morning from the finest organic ingredients. Designed to celebrate your most precious moments.
            </p>
            <div className="hero-btns">
              <button className="btn-fill" onClick={() => document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' })}>
                Order Now
              </button>
              <Link to="#about-section" className="btn-outline" onClick={e => { e.preventDefault(); document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }); }}>
                Browse Menu
              </Link>
            </div>
            <div className="hero-badges">
              <span className="badge">1,200+ reviews</span>
              <span className="badge">Locally sourced</span>
              <span className="badge">Same-day delivery</span>
            </div>
          </div>
          <div className="hero-visual">
            <img src={getImageUrl('hands_holdingcake.jpg')} alt="Artisan cake presentation" className="hero-img" />
            <div className="hero-float top-right">
              <span className="float-val">4.9★</span>
              <span className="float-lbl">Avg Rating</span>
            </div>
            <div className="hero-float bottom-left">
              <span className="float-val">2000+</span>
              <span className="float-lbl">Cakes Delivered</span>
            </div>
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
          </div>
        </div>
      </section>
<<<<<<< HEAD
      <div className="value-props-strip">
        <div className="prop-item">🚚 <span>Same Day Delivery in KTM</span></div>
        <div className="prop-item">🌱 <span>100% Eggless Options</span></div>
        <div className="prop-item">✨ <span>Premium Ingredients</span></div>
        <div className="prop-item">🎂 <span>Customized Designs</span></div>
      </div>
      <section className="catalog-toolbar-panel" id="shop-menu">
        <div className="category-title-section" style={{marginBottom: 0, textAlign: 'left'}}>
          <h2 style={{fontSize: '1.8rem'}}>Explore Menu</h2>
        </div>
        <div className="search-input-box">
          <svg className="search-icon-svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <input 
            type="text" 
            className="search-field" 
            placeholder="Search for Chocolate, Red Velvet, etc..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>
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
=======

      {/* ── FEATURES ROW ────────────────────────────────────── */}
      <section className="features-row">
        <div className="wrap features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────── */}
      <section className="about-section" id="about-section">
        <div className="about-inner wrap">
          <div className="about-img-col">
            <div className="about-img-stack">
              <img src={getImageUrl('Anniversary.jpeg')} alt="Anniversary cake" className="aimg aimg-main" />
              <img src={getImageUrl('Baby_shower.jpeg')} alt="Celebration cake" className="aimg aimg-accent" />
            </div>
          </div>
          <div className="about-copy">
            <p className="eyebrow">Our Story</p>
            <h2 className="section-title">What Makes Us<br /><em>Different?</em></h2>
            <p className="body-text">
              Founded in Dhangadhi, <strong>Cake &amp; Kitchen</strong> grew from a family passion for confectionery into Sudurpaschim's most-loved artisan bakery. Every cake leaves our kitchen the same day it is baked — no shortcuts, no refrigerated leftovers.
            </p>
            <ul className="about-checks">
              <li>✓ Morning Coffee & In-house Pastries</li>
              <li>✓ Seasonal Fresh Ingredients</li>
              <li>✓ Bespoke Custom Designs</li>
              <li>✓ No Artificial Preservatives</li>
            </ul>
            <button className="btn-fill" onClick={() => document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore Our Menu
            </button>
          </div>
        </div>
      </section>

      {/* ── MENU HIGHLIGHTS (Image Cards) ───────────────────── */}
      <section className="highlights-section">
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">Menu Highlights</h2>
            <p className="section-sub">Full menu available in-store and online.</p>
          </div>
          <div className="highlights-grid">
            <div className="highlight-card tall" onClick={() => { setSelectedCat(1); document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <img src={getImageUrl('Anniversary.jpeg')} alt="Anniversary Collection" />
              <div className="hl-overlay">
                <h3>Anniversary Collection</h3>
                <p>From rose-gold tiers to velvet hearts</p>
              </div>
            </div>
            <div className="highlight-card" onClick={() => { setSelectedCat(2); document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <img src={getImageUrl('snow_birthday_cake.jpeg')} alt="Birthday Confections" />
              <div className="hl-overlay">
                <h3>Birthday Confections</h3>
                <p>Personalised candles included</p>
              </div>
            </div>
            <div className="highlight-card" onClick={() => { setSelectedCat(3); document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <img src={getImageUrl('Baby_shower.jpeg')} alt="Wedding Tiers" />
              <div className="hl-overlay">
                <h3>Wedding Tiers</h3>
                <p>Multi-tier grandeur, fresh florals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATALOG ─────────────────────────────────────────── */}
      <section className="catalog-section" id="shop-menu">
        <div className="wrap">
          <div className="section-head">
            <h2 className="section-title">Browse By Category</h2>
          </div>

          {/* Category icons */}
          <div className="cat-icons-row">
            {CATS.map(c => (
              <button
                key={String(c.id)}
                className={`cat-icon-btn${selectedCat === c.id ? ' active' : ''}`}
                onClick={() => setSelectedCat(c.id)}
                id={`cat-${c.id ?? 'all'}`}
              >
                <span className="cat-icon-circle">{c.icon}</span>
                <span className="cat-icon-label">{c.label}</span>
              </button>
            ))}
          </div>
<<<<<<< HEAD
        )}
      </section>
      <section>
        <div className="cakes-section-header">
          <h2>{searchQuery ? `Search Results for "${searchQuery}"` : selectedCat === null ? 'Featured Collection' : getCategoryName(selectedCat)}</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {filteredCakes.length} cakes available
          </span>
=======

          {/* Popular cakes title + tab-style filter */}
          <div className="popular-head">
            <h3 className="popular-title">Popular Cakes</h3>
            <div className="filter-tabs">
              {CATS.slice(0, 4).map(c => (
                <button
                  key={String(c.id) + '-tab'}
                  className={`filter-tab${selectedCat === c.id ? ' active' : ''}`}
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="search-bar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or flavour..."
              value={searchQuery || ''}
              onChange={e => setSearchQuery(e.target.value)}
              id="catalog-search"
            />
            {searchQuery && <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="ck-grid">
              {[1, 2, 3, 4, 5, 6].map(n => <div key={n} className="skeleton" />)}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              <p>No cakes found.</p>
              <button className="btn-fill" onClick={() => { setSelectedCat(null); setSearchQuery(''); }}>Clear filters</button>
            </div>
          ) : (
            <div className="ck-grid">
              {visible.map((cake, i) => {
                const rating = RATINGS[i % RATINGS.length];
                const badges = ['', 'Best Seller', '', 'Hot', 'Best Seller', ''];
                const badge = badges[i % badges.length];
                const added = addingId === cake.cake_id;
                return (
                  <article className="ck-card" key={cake.cake_id} id={`cake-${cake.cake_id}`}>
                    <div className="ck-img-wrap">
                      <img
                        src={getImageUrl(cake.image_url)}
                        alt={cake.name}
                        loading="lazy"
                        onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80'; }}
                      />
                      {badge && <span className="ck-badge">{badge}</span>}
                      <span className="ck-cat-chip">{catName(cake.cat_id)}</span>
                    </div>
                    <div className="ck-body">
                      <h3 className="ck-name">{cake.name}</h3>
                      <div className="ck-meta-row">
                        <Star val={rating} />
                        <span className="ck-reviews">({Math.floor(40 + i * 17)} reviews)</span>
                      </div>
                      <div className="ck-footer">
                        <span className="ck-price">NPR {Number(cake.base_price).toLocaleString()}</span>
                        <div className="ck-actions">
                          <button
                            className={`btn-add-sm${added ? ' added' : ''}`}
                            onClick={() => handleAdd(cake)}
                            id={`add-${cake.cake_id}`}
                          >
                            {added ? '✓' : '+'}
                          </button>
                          <Link to={`/cake/${cake.cake_id}`} className="btn-customize-sm" id={`view-${cake.cake_id}`}>
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
        </div>
      </section>

      {/* ── HOURS / VISIT ────────────────────────────────────── */}
      <section className="hours-section" id="hours-section">
        <div className="hours-inner wrap">
          <div className="hours-img">
            <img src={getImageUrl('half.jpg')} alt="Fresh from our kitchen" />
          </div>
          <div className="hours-copy">
            <p className="eyebrow light">Come Visit Us</p>
            <h2 className="section-title light">Baked Fresh,<br />Every Day.</h2>
            <div className="hours-list">
              <div className="hours-row">
                <span>Monday – Saturday</span>
                <strong>7:00 AM – 9:30 PM</strong>
              </div>
              <div className="hours-row">
                <span>Sunday</span>
                <strong>8:00 AM – 9:00 PM</strong>
              </div>
            </div>
            <div className="hours-contact-list">
              <div className="hours-contact-item">
                <span className="hours-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>123 Main Street, Dhangadhi, Kailali</span>
              </div>
              <div className="hours-contact-item">
                <span className="hours-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <a href="tel:+977980123456">980-1234567</a>
              </div>
              <div className="hours-contact-item">
                <span className="hours-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <a href="mailto:hello@cakenkitchen.com">hello@cakenkitchen.com</a>
              </div>
              <div className="hours-contact-item">
                <span className="hours-contact-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </span>
                <a href="https://facebook.com/cakenkitchen" target="_blank" rel="noreferrer">facebook.com/cakenkitchen</a>
              </div>
            </div>
            <a href="tel:+977980123456" className="btn-fill-light">Call to Order</a>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="wrap cta-inner">
          <div>
            <h2 className="cta-title">Taste the Best, Order Now</h2>
            <p className="cta-sub">Custom wedding tiers, birthday surprises or everyday pastries — we bake for every story.</p>
          </div>
          <button className="btn-fill-outlined" onClick={() => document.getElementById('shop-menu')?.scrollIntoView({ behavior: 'smooth' })}>
            Order Online
          </button>
        </div>
      </section>

    </div>
  );
}
