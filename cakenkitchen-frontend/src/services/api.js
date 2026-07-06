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
    if (catId) {
      return { success: false, data: [] };
    }
    return { success: false, data: [] };
  }
};

export const fetchCakeById = async (id) => {
  try {
    const response = await api.get(`/cakes/${id}`);
    return response.data;
  } catch (error) {
    console.warn('API error fetching cake by ID:', error);
    return { success: false, data: null };
  }
};

// Admin Endpoints
export const fetchAdminCakes = async () => {
  try {
    const response = await api.get('/cakes/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin cakes:', error);
    return { success: false, data: [] };
  }
};

export const createCake = async (cakeData) => {
  try {
    const response = await api.post('/cakes', cakeData);
    return response.data;
  } catch (error) {
    console.error('Error creating cake:', error);
    return { success: false, error: 'Failed to create cake' };
  }
};

export const toggleCakeAvailability = async (id) => {
  try {
    const response = await api.patch(`/cakes/${id}/toggle`);
    return response.data;
  } catch (error) {
    console.error('Error toggling cake:', error);
    return { success: false };
  }
};

// Order Endpoints
export const placeOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    return { success: false, error: 'Failed to place order' };
  }
};

export const fetchAdminOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return { success: false, data: [] };
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false };
  }
};

export default api;
