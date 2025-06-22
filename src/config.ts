// API configuration
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';


// 媒体文件URL配置
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || `${API_URL}/media/`;

// 默认头像URL
export const DEFAULT_AVATAR_URL = import.meta.env.VITE_DEFAULT_AVATAR_URL || `${MEDIA_URL}avatars/default.png`;

// 获取完整的媒体文件URL
export const getMediaUrl = (path: string): string => {
  if (!path) return DEFAULT_AVATAR_URL;
  
  // 如果路径已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 如果路径以/media/开头，从API_URL构建完整URL
  if (path.startsWith('/media/')) {
    return `${API_URL}${path}`;
  }
  
  // 否则，假设是相对于MEDIA_URL的路径
  return `${MEDIA_URL}${path}`;
};