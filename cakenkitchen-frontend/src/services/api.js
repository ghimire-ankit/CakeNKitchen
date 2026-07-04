import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.warn('API error fetching categories, using fallback mock data:', error);
    return {
      success: true,
      data: [
        { cat_id: 1, name: 'Tiered Wedding Cakes', description: 'Multi-layered custom elegant structures for weddings.', image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60' },
        { cat_id: 2, name: 'Premium Chocolate Series', description: 'Rich, deep Dutch-process cocoa variants and ganache.', image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60' },
        { cat_id: 3, name: 'Fresh Fruit Delights', description: 'Light sponge blocks layered with organic seasonal fruits.', image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60' }
      ]
    };
  }
};

export const fetchCakes = async (catId = null) => {
  try {
    const url = catId ? `/cakes?catId=${catId}` : '/cakes';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.warn('API error fetching cakes, using fallback mock data:', error);
    const mockCakes = [
      { cake_id: 1, name: 'Midnight Chocolate Fudge', description: 'Triple-layer dark cocoa cake smothered in rich Belgian chocolate ganache.', base_price: 750.00, cat_id: 2, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 2, name: 'Classic Black Forest', description: 'Traditional German chocolate sponge layered with whipped cream and sweet cherries.', base_price: 650.00, cat_id: 2, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 3, name: 'Royal Strawberry Infusion', description: 'Vanilla chiffon cake layered with fresh local strawberries and vanilla bean cream.', base_price: 800.00, cat_id: 3, image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 4, name: 'White Orchid Elegant Tier', description: 'Three-tier vanilla sponge accented with white buttercream roses.', base_price: 2500.00, cat_id: 1, image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60', is_available: true }
    ];
    if (catId) {
      return { success: true, data: mockCakes.filter(c => c.cat_id == catId) };
    }
    return { success: true, data: mockCakes };
  }
};

export const fetchCakeById = async (id) => {
  try {
    const response = await api.get(`/cakes/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error fetching cake by ID, using fallback mock data:', error);
    const mockCakes = [
      { cake_id: 1, name: 'Midnight Chocolate Fudge', description: 'Triple-layer dark cocoa cake smothered in rich Belgian chocolate ganache.', base_price: 750.00, cat_id: 2, image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 2, name: 'Classic Black Forest', description: 'Traditional German chocolate sponge layered with whipped cream and sweet cherries.', base_price: 650.00, cat_id: 2, image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 3, name: 'Royal Strawberry Infusion', description: 'Vanilla chiffon cake layered with fresh local strawberries and vanilla bean cream.', base_price: 800.00, cat_id: 3, image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60', is_available: true },
      { cake_id: 4, name: 'White Orchid Elegant Tier', description: 'Three-tier vanilla sponge accented with white buttercream roses.', base_price: 2500.00, cat_id: 1, image_url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60', is_available: true }
    ];
    const cake = mockCakes.find(c => c.cake_id == id);
    return { success: !!cake, data: cake };
  }
};

export default api;
