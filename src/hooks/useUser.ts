import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from '@/App';
import authService from '@/lib/auth';
import { API_URL } from '@/config';

export interface User {
  uid: string;
  username: string;
  email: string;
  is_superuser: boolean;
  is_active: boolean;
  avatar?: string;
}

export const useUser = () => {
  const isAuthenticated = useContext(AuthContext);
  const [user, setUser] = useState<User | null>(null);
  const fetchingRef = useRef(false);

  const fetchUserInfo = useCallback(async () => {
    if (!isAuthenticated || fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      const { access } = authService.getTokens();
      if (!access) {
        setUser(null);
        return;
      }

      const response = await fetch(`${API_URL}/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${access}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(prev => {
          // 只有当数据真正变化时才更新状态
          if (JSON.stringify(prev) !== JSON.stringify(userData)) {
            return userData;
          }
          return prev;
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setUser(null);
    } finally {
      fetchingRef.current = false;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  return { user };
}; 