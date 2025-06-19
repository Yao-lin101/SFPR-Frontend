import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';

interface PartnerDetail {
  id: string;
  nickname: string;
  game_id: string;
  server_name: string;
  description: string;
  evidence: string;
  submitter_username: string;
  created_at: string;
  updated_at: string;
  views_count: number;
}

export const PartnerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartnerDetail = async () => {
      if (!id) {
        setError('缺少神人ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/partners/${id}/`);
        setPartner(response.data);
        setLoading(false);
      } catch (err) {
        console.error('获取神人详情失败:', err);
        setError('获取神人详情失败，请稍后再试');
        setLoading(false);
      }
    };

    fetchPartnerDetail();
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">神人详情</h1>
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
        ) : partner ? (
          <Card className="p-6">
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{partner.nickname}</h2>
                  <div className="text-gray-500 mt-1">
                    游戏ID: {partner.game_id} | 服务器: {partner.server_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    查看次数: {partner.views_count}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">神人事迹</h3>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {partner.description}
              </div>
            </div>

            {partner.evidence && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">证据</h3>
                <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                  {partner.evidence}
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 mt-6 pt-4 border-t">
              <div>提交者: {partner.submitter_username}</div>
              <div>提交时间: {formatDate(partner.created_at)}</div>
              {partner.updated_at !== partner.created_at && (
                <div>更新时间: {formatDate(partner.updated_at)}</div>
              )}
            </div>
          </Card>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            未找到神人记录
          </div>
        )}
      </div>
    </div>
  );
}; 