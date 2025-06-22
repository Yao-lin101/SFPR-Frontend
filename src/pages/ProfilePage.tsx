import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/App';
import api from '@/lib/api';
import { toast } from 'sonner';
import { InvitationCodeDialog } from '@/components/InvitationCodeDialog';
import { Gift } from 'lucide-react';

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null; // 用于存储QQ号
  is_email_verified: boolean;
  is_superuser: boolean; // 是否为超级用户
}

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState('');
  const [qqNumber, setQQNumber] = useState('');

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isAuthenticated, navigate]);

  // 获取用户资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await api.get('/users/profile/');
        setProfile(response.data);
        setUsername(response.data.username || '');
        setQQNumber(response.data.bio || ''); // 使用bio字段存储QQ号
        setLoading(false);
      } catch (err) {
        console.error('获取用户资料失败:', err);
        toast.error('获取用户资料失败，请稍后再试');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated]);

  // 获取QQ头像URL
  const getQQAvatarUrl = (qqNumber: string) => {
    if (!qqNumber) return '';
    return `https://q.qlogo.cn/headimg_dl?dst_uin=${qqNumber}&spec=640&img_type=jpg`;
  };

  // 保存用户资料
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !profile) return;

    // 验证QQ号格式（纯数字）
    if (qqNumber && !/^\d+$/.test(qqNumber)) {
      toast.error('QQ号格式不正确，请输入纯数字');
      return;
    }

    try {
      setSaving(true);
      
      // 更新基本资料，使用bio字段存储QQ号
      await api.put('/users/profile/', {
        username,
        bio: qqNumber
      });
      
      toast.success('资料更新成功');
      setSaving(false);
    } catch (err) {
      console.error('更新用户资料失败:', err);
      toast.error('更新用户资料失败，请稍后再试');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
              <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">我的资料</h1>
            <div className="flex gap-2">
              {profile?.is_superuser && (
                <InvitationCodeDialog>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    邀请码管理
                  </Button>
                </InvitationCodeDialog>
              )}
              <Button variant="outline" onClick={() => navigate('/')}>
                返回首页
              </Button>
            </div>
          </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">加载中...</p>
          </div>
        ) : profile ? (
          <Card className="p-6 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
                  {qqNumber && getQQAvatarUrl(qqNumber) ? (
                    <img 
                      src={getQQAvatarUrl(qqNumber)} 
                      alt="QQ头像" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      无头像
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.is_email_verified ? '已验证' : '未验证'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="设置您的用户名"
                  />
                </div>

                <div>
                  <Label htmlFor="qqNumber">QQ号码</Label>
                  <Input
                    id="qqNumber"
                    value={qqNumber}
                    onChange={(e) => setQQNumber(e.target.value)}
                    placeholder="输入您的QQ号码，用于显示头像"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    我们将使用您的QQ号获取头像，不会用于其他用途
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? '保存中...' : '保存资料'}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            获取用户资料失败
          </div>
        )}
      </div>
    </div>
  );
}; 