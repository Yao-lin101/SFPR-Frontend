import axios from 'axios';
import { API_URL } from '@/config';

// 创建一个新的 axios 实例用于认证
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  verify_code: string;
  invitation_code: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    uid: string;
    username: string;
    email: string;
    is_email_verified: boolean;
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/auth/token/', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || '登录失败');
      }
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await authApi.post('/users/register_email/', credentials);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || '注册失败');
      }
      throw error;
    }
  },

  async sendVerifyCode(email: string): Promise<void> {
    try {
      await authApi.post('/users/send_verify_code/', { email });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || '验证码发送失败');
      }
      throw error;
    }
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    try {
      const response = await authApi.post('/auth/token/refresh/', { refresh });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.detail || 'Token 刷新失败');
      }
      throw error;
    }
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    // 触发认证状态变更事件
    window.dispatchEvent(new Event('auth-change'));
  },

  getTokens(): { access: string | null; refresh: string | null } {
    return {
      access: localStorage.getItem('access_token'),
      refresh: localStorage.getItem('refresh_token'),
    };
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // 触发认证状态变更事件
    window.dispatchEvent(new Event('auth-change'));
  },
};

export default authService; 