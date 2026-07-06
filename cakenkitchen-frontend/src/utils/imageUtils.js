export const getImageUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url === 'wedding_category.jpg') return 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=500&auto=format&fit=crop&q=60';
  if (url === 'chocolate_category.jpg') return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=60';
  if (url === 'fruit_category.jpg') return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format&fit=crop&q=60';
  const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  return `${backendBase}/uploads/${url}`;
};
