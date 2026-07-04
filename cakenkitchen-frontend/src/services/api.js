import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const cake = mockCakes.find(c => c.cake_id == id);
    return { success: !!cake, data: cake };
  }
};

export default api;
