import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Card } from '@/components/ui/card';
import { ServerSelector } from '@/components/ServerSelector';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [serverId, setServerId] = useState('');
  const [loading] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('请输入昵称');
      return;
    }

    // 构建搜索参数
    const searchParams = new URLSearchParams();
    searchParams.append('nickname', nickname);
    if (gameId) searchParams.append('game_id', gameId);
    if (serverId) searchParams.append('server', serverId);

    // 跳转到搜索结果页面
    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 w-full max-w-md">
        <SparklesText 
          text="Soul Fighter Partner Reviewers" 
          colors={{ first: "#A07CFE", second: "#FE8FB5" }}
          className="text-4xl font-bold"
        />
        <p className="text-xl text-gray-600">斗魂单排队友评鉴指南</p>

        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSearch} className="space-y-4">
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
              
              {/* 隐藏字段，用于搜索 */}
              <input type="hidden" name="nickname" value={nickname} />
              <input type="hidden" name="game_id" value={gameId} />
            </div>

            <ServerSelector 
              value={serverId}
              onChange={setServerId}
              emptyOptionText="选择服务器（选填）"
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '搜索中...' : '查看成分'}
            </Button>
          </form>
        </Card>

        <div className="flex justify-center space-x-4 mt-6">
          {isAuthenticated ? (
            <>
              <Button
                onClick={() => navigate('/submit')}
                variant="outline"
              >
                我要投稿
              </Button>
              <Button
                onClick={() => navigate('/my-records')}
                variant="outline"
              >
                投稿管理
              </Button>
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
              >
                我的资料
              </Button>
            </>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              variant="outline"
            >
              登录/注册
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 