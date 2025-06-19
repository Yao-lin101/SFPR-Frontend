import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { SERVER_LIST } from '@/components/ServerSelector';

interface Player {
  id: string;
  nickname: string;
  game_id: string;
  server_name: string;
  server: number;
  created_at: string;
  views_count: number;
  records_count: number;
}

export const SearchPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从URL获取搜索参数
  const searchParams = new URLSearchParams(location.search);
  const nickname = searchParams.get('nickname');
  const gameId = searchParams.get('game_id');
  const serverId = searchParams.get('server');

  // 根据服务器ID获取服务器名称
  const getServerName = (id: number): string => {
    const server = SERVER_LIST.find(s => s.id === id);
    return server ? server.name : `未知服务器(${id})`;
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!nickname) {
        setError('缺少必要的搜索参数');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 构建API请求URL
        const url = '/players/search/';
        const params = new URLSearchParams();
        params.append('nickname', nickname);
        if (gameId) params.append('game_id', gameId);
        if (serverId) params.append('server', serverId);

        const response = await api.get(`${url}?${params.toString()}`);
        setPlayers(response.data.results || response.data);
        setLoading(false);
      } catch (err) {
        console.error('搜索失败:', err);
        setError('搜索失败，请稍后再试');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [nickname, gameId, serverId]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewDetail = (id: string) => {
    navigate(`/player/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">搜索结果</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>

        <div className="bg-white p-4 rounded-md shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">搜索条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-500">昵称:</span> {nickname}
            </div>
            {gameId && (
              <div>
                <span className="text-gray-500">游戏ID:</span> {gameId}
              </div>
            )}
            {serverId && (
              <div>
                <span className="text-gray-500">服务器:</span> {getServerName(Number(serverId))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2">正在搜索中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : players.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            未找到符合条件的玩家记录
          </div>
        ) : (
          <div className="grid gap-4">
            {players.map((player) => (
              <Card key={player.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{player.nickname}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      ID: {player.game_id} | 服务器: {player.server_name || getServerName(player.server)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      记录于 {formatDate(player.created_at)}
                    </div>
                    <div className="text-sm text-gray-500">
                      神人事迹: {player.records_count} | 查看次数: {player.views_count}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetail(player.id)}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 