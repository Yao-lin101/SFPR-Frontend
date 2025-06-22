// API configuration
// 动态获取API地址，支持局域网访问
const getApiUrl = () => {
  // 如果有环境变量配置，优先使用
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 获取当前页面的hostname
  const hostname = window.location.hostname;
  
  // 如果是localhost或127.0.0.1，使用默认配置
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }
  
  // 如果是其他IP地址（局域网访问），使用相同的IP访问后端
  return `http://${hostname}:8000`;
};

export const API_URL = getApiUrl();

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