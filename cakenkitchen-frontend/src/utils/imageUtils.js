/* Robust image resolver — serves real images even when backend is offline */
const CAKE_IMAGES = {
  'Anniversary.jpeg': 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&auto=format&fit=crop&q=80',
  'snow_birthday_cake.jpeg': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  'Baby_shower.jpeg': 'https://images.unsplash.com/photo-1559181567-c3190450d943?w=600&auto=format&fit=crop&q=80',
  'hands_holdingcake.jpg': 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&auto=format&fit=crop&q=80',
  'wedding_category.jpg': 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80',
  'chocolate_category.jpg': 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&auto=format&fit=crop&q=80',
  'fruit_category.jpg': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
};

const FALLBACK = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80';

export const getImageUrl = (url) => {
  if (!url) return FALLBACK;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Use local mapping if available
  if (CAKE_IMAGES[url]) return CAKE_IMAGES[url];
  // Try backend, but with a mapped fallback
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  return `${backendBase}/uploads/${url}`;
};
