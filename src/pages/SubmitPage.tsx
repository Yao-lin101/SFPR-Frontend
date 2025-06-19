import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { AuthContext } from '@/App';
import { ServerSelector } from '@/components/ServerSelector';

export const SubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [serverId, setServerId] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/submit' } });
    }
  }, [isAuthenticated, navigate]);

  // 处理昵称输入，自动解析 xxx#1234 格式，只分隔最后一个#
  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    
    // 检查是否包含 # 符号
    const lastHashIndex = value.lastIndexOf('#');
    if (lastHashIndex !== -1 && lastHashIndex < value.length - 1) {
      const name = value.substring(0, lastHashIndex);
      const id = value.substring(lastHashIndex + 1);
      setNickname(name);
      setGameId(id);
    } else {
      setNickname(value);
      setGameId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    if (!gameId.trim()) {
      setError('请输入游戏ID');
      return;
    }
    if (!serverId) {
      setError('请选择服务器');
      return;
    }
    if (!description.trim()) {
      setError('请输入神人事迹');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await api.post('/partners/', {
        nickname,
        game_id: gameId,
        server: serverId,
        description,
        evidence
      });
      
      setSubmitSuccess(true);
      setLoading(false);
      
      // 重置表单
      setFullName('');
      setNickname('');
      setGameId('');
      setServerId('');
      setDescription('');
      setEvidence('');
      
      // 3秒后自动隐藏成功消息
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('提交失败:', err);
      setError(err.response?.data?.detail || '提交失败，请稍后再试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">投稿神人</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>

        <Card className="p-6">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              投稿成功！您的投稿将在审核后发布。
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                玩家昵称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="fullName"
                value={fullName}
                onChange={handleFullNameChange}
                placeholder="输入玩家昵称，例如: 玩家名#1234"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                支持格式: 玩家名#1234，会自动分离昵称和ID（以最后一个#为分隔）
              </p>
            </div>

            <ServerSelector 
              value={serverId}
              onChange={setServerId}
              required={true}
              label="服务器"
              emptyOptionText="选择服务器"
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                神人事迹 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="详细描述神人的行为..."
                required
              />
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-medium text-gray-700 mb-1">
                证据（可选）
              </label>
              <textarea
                id="evidence"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="可以是图片链接或详细描述..."
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '提交中...' : '提交神人记录'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-sm text-gray-500">
            <p>注意事项：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>请确保提供的信息真实可靠，不得恶意诋毁他人</li>
              <li>您的投稿将在审核后发布</li>
              <li>提交后无法修改，请仔细检查信息</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}; 