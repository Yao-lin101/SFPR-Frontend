import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiService } from '@/lib/api';
import { toast } from 'sonner';
import { Copy, Plus, Gift } from 'lucide-react';

interface InvitationCode {
  id: number;
  code: string;
  created_by: {
    uid: string;
    username: string;
  };
  used_by?: {
    uid: string;
    username: string;
  };
  is_used: boolean;
  created_at: string;
  used_at?: string;
  note?: string;
}

interface InvitationCodeDialogProps {
  children: React.ReactNode;
}

export const InvitationCodeDialog: React.FC<InvitationCodeDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);


  // 获取邀请码列表
  const fetchInvitationCodes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInvitationCodes();
      setInvitationCodes(response.results || response);
    } catch (error) {
      console.error('获取邀请码列表失败:', error);
      toast.error('获取邀请码列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建邀请码
  const handleCreateInvitationCode = async () => {
    try {
      setCreating(true);
      const newCode = await apiService.createInvitationCode();
      toast.success('邀请码创建成功');
      
      // 直接将新邀请码添加到列表顶部，避免重新加载整个列表
      setInvitationCodes(prev => [newCode, ...prev]);
    } catch (error) {
      console.error('创建邀请码失败:', error);
      toast.error('创建邀请码失败，请检查权限');
    } finally {
      setCreating(false);
    }
  };

  // 复制邀请码到剪贴板
  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('邀请码已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 对话框打开时获取数据
  useEffect(() => {
    if (open) {
      fetchInvitationCodes();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            邀请码管理
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 创建邀请码区域 */}
          <div className="border-b pb-4">
            <Button
              onClick={handleCreateInvitationCode}
              disabled={creating}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {creating ? '创建中...' : '创建新邀请码'}
            </Button>
          </div>

          {/* 邀请码列表 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">邀请码列表</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2">加载中...</p>
              </div>
            ) : invitationCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                暂无邀请码
              </div>
            ) : (
              <div className="space-y-3">
                {invitationCodes.map((code) => (
                  <Card key={code.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-lg font-semibold bg-gray-100 px-3 py-1 rounded">
                            {code.code}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(code.code)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            复制
                          </Button>
                          <span className={`px-2 py-1 rounded text-xs ${
                            code.is_used 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {code.is_used ? '已使用' : '未使用'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>创建时间: {formatDate(code.created_at)}</div>
                          {code.is_used && code.used_by && (
                            <div>
                              使用者: {code.used_by.username} ({code.used_by.uid})
                              {code.used_at && ` - ${formatDate(code.used_at)}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 