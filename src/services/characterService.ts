import axios from 'axios';
import { Character, CharacterDetail, CreateCharacterData, UpdateCharacterData, WillConfig } from '@/types/character';

import { API_URL } from '@/config';
import api from '@/lib/api';

// 创建一个新的 axios 实例

// 添加请求拦截器

export const characterService = {
  async list(): Promise<Character[]> {
    const response = await api.get('/characters/');
    return response.data.results;
  },

  async get(uid: string): Promise<CharacterDetail> {
    const response = await api.get(`/characters/${uid}/`);
    return response.data;
  },

  async create(data: CreateCharacterData): Promise<CharacterDetail> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('/characters/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async update(uid: string, data: UpdateCharacterData): Promise<Character> {
    const formData = new FormData();
    
    // 处理非文件字段
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'status_config') {
        // 确保 status_config 被正确序列化为 JSON 字符串
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const response = await api.patch(`/characters/${uid}/`, formData);
    return response.data;
  },

  async delete(uid: string): Promise<void> {
    await api.delete(`/characters/${uid}/`);
  },

  async getSecretKey(uid: string): Promise<string> {
    const response = await api.get(`/characters/${uid}/secret_key/`);
    return response.data.secret_key;
  },

  async regenerateSecretKey(uid: string): Promise<string> {
    const response = await api.post(`/characters/${uid}/regenerate_secret_key/`);
    return response.data.secret_key;
  },

  async regenerateDisplayCode(uid: string) {
    const response = await api.post(`/characters/${uid}/regenerate_display_code/`);
    return response.data;
  },

  async updateStatus(uid: string, isActive: boolean) {
    const response = await api.post(`/characters/${uid}/update_status/`, {
      is_active: isActive
    });
    return response.data;
  },

  async getPublicDisplay(code: string) {
    const response = await axios.get(`${API_URL}/d/${code}/`);
    return response.data;
  },

  async getCharacterStatus(code: string) {
    const response = await axios.get(`${API_URL}/d/${code}/status/`);
    return response.data;
  },

  // 获取遗嘱配置
  async getWillConfig(uid: string): Promise<WillConfig> {
    try {
      const response = await api.get(`/characters/${uid}/will/`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null as any; // 返回null，由调用方处理
      }
      throw error;
    }
  },

  // 创建或更新遗嘱配置
  async updateWillConfig(uid: string, data: Partial<WillConfig>): Promise<WillConfig> {
    try {
      // 如果是启用遗嘱功能，确保有目标邮箱
      if (data.is_enabled === true && !data.target_email) {
        // 获取当前配置
        const currentConfig = await this.getWillConfig(uid);
        if (!currentConfig?.target_email) {
          throw new Error('启用遗嘱功能时必须提供目标邮箱');
        }
      }
      
      // 直接使用POST请求，让后端决定是创建还是更新
      const response = await api.post(`/characters/${uid}/will/`, data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error('服务器返回的错误信息:', error.response.data);
      }
      throw error;
    }
  },
};