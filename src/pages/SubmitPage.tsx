import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { AuthContext } from '@/App';

// 服务器列表
const SERVER_LIST = [
  { id: 1, name: "艾欧尼亚" },
  { id: 2, name: "祖安" },
  { id: 3, name: "诺克萨斯" },
  { id: 4, name: "班德尔城" },
  { id: 5, name: "皮尔特沃夫" },
  { id: 6, name: "战争学院" },
  { id: 7, name: "巨神峰" },
  { id: 8, name: "雷瑟守备" },
  { id: 9, name: "裁决之地" },
  { id: 10, name: "黑色玫瑰" },
  { id: 11, name: "暗影岛" },
  { id: 12, name: "钢铁烈阳" },
  { id: 13, name: "水晶之痕" },
  { id: 14, name: "均衡教派" },
  { id: 15, name: "影流" },
  { id: 16, name: "守望之海" },
  { id: 17, name: "征服之海" },
  { id: 18, name: "卡拉曼达" },
  { id: 19, name: "皮城警备" },
  { id: 20, name: "比尔吉沃特" },
  { id: 21, name: "德玛西亚" },
  { id: 22, name: "弗雷尔卓德" },
  { id: 23, name: "无畏先锋" },
  { id: 24, name: "恕瑞玛" },
  { id: 25, name: "扭曲丛林" },
  { id: 26, name: "巨龙之巢" },
  { id: 27, name: "教育网专区" },
  { id: 28, name: "男爵领域" },
  { id: 29, name: "峡谷之巅" },
  { id: 30, name: "体验服" }
];

export const SubmitPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [serverId, setServerId] = useState('');
  const [serverFilter, setServerFilter] = useState('');
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

  // 根据筛选条件过滤服务器
  const filteredServers = useMemo(() => {
    if (!serverFilter) return SERVER_LIST;
    return SERVER_LIST.filter(server => 
      server.name.toLowerCase().includes(serverFilter.toLowerCase())
    );
  }, [serverFilter]);

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
                  placeholder="昵称"
                />
              </div>

              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-1">
                  游戏ID
                </label>
                <Input
                  id="gameId"
                  value={gameId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGameId(e.target.value)}
                  placeholder="游戏ID"
                />
              </div>
            </div>

            <div>
              <label htmlFor="server" className="block text-sm font-medium text-gray-700 mb-1">
                服务器 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <Input
                  placeholder="搜索服务器..."
                  value={serverFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServerFilter(e.target.value)}
                  className="mb-1"
                />
                <select
                  id="server"
                  value={serverId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServerId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">选择服务器</option>
                  {filteredServers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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