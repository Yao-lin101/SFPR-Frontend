import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { SERVER_LIST } from '@/components/ServerSelector';
import { AuthContext } from '@/App';
import { AddRecordDialog } from '@/components/AddRecordDialog';

interface Record {
  id: string;
  description: string;
  evidence: string;
  submitter_username: string;
  created_at: string;
  status: string;
  image_1_url?: string;
  image_2_url?: string;
  image_3_url?: string;
}

interface PlayerDetail {
  id: string;
  nickname: string;
  game_id: string;
  server_name: string;
  server: number;
  created_at: string;
  updated_at: string;
  views_count: number;
  records: Record[];
}

export const PlayerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);
  const [player, setPlayer] = useState<PlayerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addRecordDialogOpen, setAddRecordDialogOpen] = useState(false);

  // 根据服务器ID获取服务器名称
  const getServerName = (id: number): string => {
    const server = SERVER_LIST.find(s => s.id === id);
    return server ? server.name : `未知服务器(${id})`;
  };

  const fetchPlayerDetail = async () => {
    if (!id) {
      setError('缺少玩家ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/players/${id}/`);
      setPlayer(response.data);
      setLoading(false);
    } catch (err) {
      console.error('获取玩家详情失败:', err);
      setError('获取玩家详情失败，请稍后再试');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerDetail();
  }, [id]);

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

  const handleAddRecordClick = () => {
    if (isAuthenticated) {
      setAddRecordDialogOpen(true);
    } else {
      navigate('/login', { state: { from: `/player/${id}` } });
    }
  };

  const handleRecordAdded = () => {
    // 重新获取玩家详情，包含新的记录
    fetchPlayerDetail();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">玩家详情</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              返回
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
        ) : player ? (
          <>
            <Card className="p-6 mb-6">
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{player.nickname}</h2>
                    <div className="text-gray-500 mt-1">
                      游戏ID: {player.game_id} | 服务器: {player.server_name || getServerName(player.server)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      查看次数: {player.views_count}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500 mt-6">
                <div>玩家记录于: {formatDate(player.created_at)}</div>
                {player.updated_at !== player.created_at && (
                  <div>最后更新: {formatDate(player.updated_at)}</div>
                )}
              </div>
            </Card>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">神人事迹记录 ({player.records.length})</h3>
              {isAuthenticated && (
                <Button onClick={handleAddRecordClick} variant="outline">
                  我要补充
                </Button>
              )}
            </div>
            
            {player.records.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
                暂无神人事迹记录
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {player.records.map((record, index) => (
                  <Card key={record.id} className="p-4">
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2">事迹 #{index + 1}</h4>
                      <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                        {record.description}
                      </div>
                    </div>

                    {record.evidence && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">补充说明</h4>
                        <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                          {record.evidence}
                        </div>
                      </div>
                    )}
                    
                    {/* 显示图片 */}
                    {(record.image_1_url || record.image_2_url || record.image_3_url) && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {record.image_1_url && (
                            <div className="relative">
                              <a href={record.image_1_url} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={record.image_1_url} 
                                  alt={`事迹 #${index + 1} 图片1`} 
                                  className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-90"
                                />
                              </a>
                            </div>
                          )}
                          {record.image_2_url && (
                            <div className="relative">
                              <a href={record.image_2_url} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={record.image_2_url} 
                                  alt={`事迹 #${index + 1} 图片2`} 
                                  className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-90"
                                />
                              </a>
                            </div>
                          )}
                          {record.image_3_url && (
                            <div className="relative">
                              <a href={record.image_3_url} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={record.image_3_url} 
                                  alt={`事迹 #${index + 1} 图片3`} 
                                  className="w-32 h-32 object-cover rounded cursor-pointer hover:opacity-90"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      <div>提交者: {record.submitter_username}</div>
                      <div>提交时间: {formatDate(record.created_at)}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            未找到玩家记录
          </div>
        )}

        {/* 添加记录弹窗 */}
        {id && (
          <AddRecordDialog 
            open={addRecordDialogOpen} 
            onOpenChange={setAddRecordDialogOpen}
            playerId={id}
            onRecordAdded={handleRecordAdded}
          />
        )}
      </div>
    </div>
  );
}; 