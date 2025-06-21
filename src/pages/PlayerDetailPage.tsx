import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import { SERVER_LIST } from '@/components/ServerSelector';
import { AuthContext } from '@/App';
import { SubmitDialog } from '@/components/SubmitDialog';

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
  const [newDescription, setNewDescription] = useState('');
  const [newEvidence, setNewEvidence] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // 根据服务器ID获取服务器名称
  const getServerName = (id: number): string => {
    const server = SERVER_LIST.find(s => s.id === id);
    return server ? server.name : `未知服务器(${id})`;
  };

  useEffect(() => {
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

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 限制上传数量
    if (images.length + files.length > 3) {
      setSubmitError('最多只能上传3张图片');
      return;
    }

    // 添加新选择的图片
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    Array.from(files).forEach(file => {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setSubmitError('只能上传图片文件');
        return;
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('图片大小不能超过5MB');
        return;
      }
      
      newImages.push(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    setImages(newImages);
    setSubmitError(null);
  };

  // 移除已选择的图片
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // 提交新的神人事迹
  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDescription.trim()) {
      setSubmitError('神人事迹不能为空');
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // 准备表单数据，包含图片
      const formData = new FormData();
      formData.append('description', newDescription);
      
      if (newEvidence.trim()) {
        formData.append('evidence', newEvidence);
      }
      
      // 添加图片到表单数据
      images.forEach((image, index) => {
        formData.append(`image_${index + 1}`, image);
      });
      
      await api.post(`/players/${id}/add_record/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // 重新获取玩家详情，包含新的记录
      const response = await api.get(`/players/${id}/`);
      setPlayer(response.data);
      
      // 重置表单
      setNewDescription('');
      setNewEvidence('');
      setImages([]);
      setImagePreviews([]);
      setSubmitSuccess(true);
      
      // 3秒后隐藏成功消息
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('提交神人事迹失败:', err);
      setSubmitError(err.response?.data?.detail || '提交失败，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitClick = () => {
    if (isAuthenticated) {
      setSubmitDialogOpen(true);
    } else {
      navigate('/login', { state: { from: `/player/${id}` } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">玩家详情</h1>
          <div className="space-x-2">
            {isAuthenticated && (
              <Button variant="outline" onClick={handleSubmitClick}>
                我要投稿
              </Button>
            )}
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

            <h3 className="text-xl font-bold mb-4">神人事迹记录 ({player.records.length})</h3>
            
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

            {isAuthenticated && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">添加新的神人事迹</h3>
                
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    添加成功！
                  </div>
                )}

                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {submitError}
                  </div>
                )}

                <form onSubmit={handleSubmitRecord} className="space-y-4">
                  <div>
                    <label htmlFor="newDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      神人事迹 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="newDescription"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="详细描述神人的行为..."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newEvidence" className="block text-sm font-medium text-gray-700 mb-1">
                      补充说明（可选）
                    </label>
                    <textarea
                      id="newEvidence"
                      value={newEvidence}
                      onChange={(e) => setNewEvidence(e.target.value)}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="补充说明或其他信息..."
                    />
                  </div>
                  
                  {/* 图片上传区域 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      配图（可选，最多3张）
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* 已上传图片预览 */}
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative w-24 h-24 rounded overflow-hidden">
                          <img 
                            src={preview} 
                            alt={`预览图 ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {/* 上传按钮 */}
                      {images.length < 3 && (
                        <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span className="mt-1 text-xs text-gray-500">上传图片</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            multiple
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      支持JPG、PNG格式，单张图片大小不超过5MB
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? '提交中...' : '提交神人事迹'}
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            未找到玩家记录
          </div>
        )}

        {/* 投稿弹窗 */}
        <SubmitDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen} />
      </div>
    </div>
  );
}; 