/* Resolver — serves real images directly from the local public directory */
const FALLBACK = '/cake_demo.jpeg';

export const getImageUrl = (url) => {
  if (!url) return FALLBACK;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  // Strip any leading slashes or upload prefix so it resolves cleanly from public root
  const filename = url.replace(/^\//, '').replace(/^uploads\//, '');
  return `/${filename}`;
};
