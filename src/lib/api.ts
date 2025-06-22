import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import authService from './auth';

// Create a custom event for authentication state changes
export const authChangeEvent = new Event('auth-change');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { access } = authService.getTokens();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && originalRequest) {
      const { refresh } = authService.getTokens();
      
      // If we have a refresh token, try to get a new access token
      if (refresh) {
        try {
          // Get new access token
          const { access } = await authService.refreshToken(refresh);
          
          // Update stored token
          authService.setTokens(access, refresh);
          
          // Update auth header and retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access}`;
          }
          
          return axios(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and update auth state
          console.error('Token refresh failed:', refreshError);
          authService.clearTokens();
          window.dispatchEvent(authChangeEvent);
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, clear tokens and update auth state
        authService.clearTokens();
        window.dispatchEvent(authChangeEvent);
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // 获取系统配置
  getSystemConfig: async () => {
    const url = '/users/config/';
    console.log('API请求URL:', `${api.defaults.baseURL}${url}`);
    const response = await api.get(url);
    return response.data;
  },

  // 邀请码相关接口
  // 创建邀请码
  createInvitationCode: async () => {
    const response = await api.post('/users/create_invitation/', {});
    return response.data;
  },

  // 获取邀请码列表
  getInvitationCodes: async () => {
    const response = await api.get('/users/list_invitations/');
    return response.data;
  }
};

export default api; 