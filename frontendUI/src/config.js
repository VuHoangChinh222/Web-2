/* 
 * APP GLOBAL CONFIGURATION
 * Quản lý các cấu hình môi trường toàn cục (API URL, Image URL)
 * Sinh viên: Vũ Hoàng Chính - 2122110380
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export const IMAGE_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Universal Helper to resolve Image URLs (handles Base64, absolute URLs, relative URLs)
export const resolveImageUrl = (url, defaultImage = '') => {
  if (!url) return defaultImage;
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url.startsWith('/') ? `${IMAGE_BASE_URL}${url}` : `${IMAGE_BASE_URL}/${url}`;
};
