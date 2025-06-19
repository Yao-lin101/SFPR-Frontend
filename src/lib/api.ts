import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import authService from './auth';

// Create a custom event for authentication state changes
export const authChangeEvent = new Event('auth-change');

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加调试日志
    console.log(`API请求: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    
    const { access } = authService.getTokens();
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    // 添加调试日志
    console.log(`API响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    console.error('API响应错误:', error.response?.data || error.message);
    
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

export default api; 