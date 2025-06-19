import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { AuthContext } from '@/App';
import { SERVER_LIST } from '@/components/ServerSelector';

interface Record {
  id: string;
  description: string;
  evidence: string;
  created_at: string;
  status: string;
  player: {
    id: string;
    nickname: string;
    game_id: string;
    server: number;
    server_name: string;
  };
}

export const MyRecordsPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-records' } });
    }
  }, [isAuthenticated, navigate]);

  // 获取用户的投稿记录
  useEffect(() => {
    const fetchMyRecords = async () => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response = await api.get('/records/my-records/');
        setRecords(response.data.results || response.data);
        setLoading(false);
      } catch (err) {
        console.error('获取投稿记录失败:', err);
        setError('获取投稿记录失败，请稍后再试');
        setLoading(false);
      }
    };

    fetchMyRecords();
  }, [isAuthenticated]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 根据服务器ID获取服务器名称
  const getServerName = (id: number): string => {
    const server = SERVER_LIST.find(s => s.id === id);
    return server ? server.name : `未知服务器(${id})`;
  };

  // 删除神人事迹记录
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条神人事迹记录吗？此操作不可撤销。')) {
      return;
    }

    try {
      setDeleteLoading(recordId);
      await api.delete(`/records/${recordId}/`);
      
      // 更新列表，移除已删除的记录
      setRecords(records.filter(record => record.id !== recordId));
      setDeleteLoading(null);
    } catch (err) {
      console.error('删除记录失败:', err);
      alert('删除失败，请稍后再试');
      setDeleteLoading(null);
    }
  };

  // 查看玩家详情
  const handleViewPlayer = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">我的投稿管理</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate('/submit')}>
              新增投稿
            </Button>
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
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            您还没有投稿记录
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {record.player.nickname}#{record.player.game_id}
                    </h3>
                    <div className="text-sm text-gray-500">
                      服务器: {record.player.server_name || getServerName(record.player.server)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      投稿时间: {formatDate(record.created_at)}
                    </div>
                    <div className="text-sm text-gray-500">
                      状态: {record.status === 'approved' ? '已发布' : '审核中'}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">神人事迹:</h4>
                  <div className="bg-gray-50 p-3 rounded whitespace-pre-line">
                    {record.description}
                  </div>
                </div>

                {record.evidence && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">证据:</h4>
                    <div className="bg-gray-50 p-3 rounded whitespace-pre-line">
                      {record.evidence}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPlayer(record.player.id)}
                  >
                    查看玩家
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteLoading === record.id}
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    {deleteLoading === record.id ? '删除中...' : '删除记录'}
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