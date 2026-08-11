import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE
});

// Interceptor to strip default Content-Type header if sending FormData,
// allowing the browser to set multipart/form-data with the correct boundary hash.
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
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
    let errorMsg = 'Failed to create cake';
    if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
    } else if (error.message) {
        errorMsg = error.message;
    }
    return { success: false, error: errorMsg };
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

export const deleteCakeAPI = async (id) => {
  try {
    const response = await api.delete(`/cakes/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting cake:', error);
    return { success: false, error: 'Failed to delete cake' };
  }
};

export const updateCakeAPI = async (id, cakeData) => {
  try {
    const response = await api.put(`/cakes/${id}`, cakeData);
    return response.data;
  } catch (error) {
    console.error('Error updating cake:', error);
    let errorMsg = 'Failed to update cake';
    if (error.response && error.response.data && error.response.data.error) {
        errorMsg = error.response.data.error;
    }
    return { success: false, error: errorMsg };
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

export const fetchUserOrders = async (userId) => {
  try {
    const response = await api.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { success: false, data: [] };
  }
};

// --- Notifications API ---
export const fetchNotifications = async (userId, role) => {
  try {
    const response = await api.get('/notifications', { params: { userId, role } });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, data: [] };
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false };
  }
};

export const markAllNotificationsAsRead = async (userId, role) => {
  try {
    const response = await api.post('/notifications/read-all', { userId, role });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false };
  }
};

// --- Order Messaging API ---
export const fetchOrderMessages = async (orderId) => {
  try {
    const response = await api.get(`/messages/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching messages for order ${orderId}:`, error);
    return { success: false, data: [] };
  }
};

export const sendOrderMessage = async (orderId, senderRole, senderName, message) => {
  try {
    const response = await api.post(`/messages/${orderId}`, {
      sender_role: senderRole,
      sender_name: senderName,
      message
    });
    return response.data;
  } catch (error) {
    console.error(`Error sending message for order ${orderId}:`, error);
    return { success: false };
  }
};

export default api;
