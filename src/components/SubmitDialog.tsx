import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Input from '@/components/ui/Input';
import api from '@/lib/api';
import { ServerSelector } from '@/components/ServerSelector';
import { toast } from 'sonner';

interface SubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubmitDialog: React.FC<SubmitDialogProps> = ({ open, onOpenChange }) => {
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gameId, setGameId] = useState('');
  const [serverId, setServerId] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 限制上传数量
    if (images.length + files.length > 3) {
      setError('最多只能上传3张图片');
      return;
    }

    // 添加新选择的图片
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    Array.from(files).forEach(file => {
      // 检查文件类型
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError(`不支持的图片格式: ${file.type}。请上传JPG、PNG、GIF或WEBP格式的图片`);
        return;
      }
      
      // 检查文件大小（限制为5MB）
      if (file.size > 5 * 1024 * 1024) {
        setError(`图片 ${file.name} 大小超过5MB，请压缩后再上传`);
        return;
      }
      
      // 检查文件名长度
      if (file.name.length > 100) {
        setError('文件名过长，请重命名后再上传');
        return;
      }
      
      newImages.push(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.onerror = () => {
        setError(`读取图片 ${file.name} 失败，请尝试其他图片`);
      };
      reader.readAsDataURL(file);
    });
    
    setImages(newImages);
    setError(null);
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

  const resetForm = () => {
    setFullName('');
    setNickname('');
    setGameId('');
    setServerId('');
    setDescription('');
    setImages([]);
    setImagePreviews([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!nickname.trim()) {
      setError('请输入昵称');
      return;
    }
    if (!gameId.trim()) {
      setError('请输入游戏ID或使用格式：玩家名#ID');
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
      
      // 准备基本数据（不包含图片）
      const playerData = {
        nickname,
        game_id: gameId,
        server: serverId
      };
      
      // 准备记录数据（包含图片）
      const formData = new FormData();
      formData.append('description', description);
      
      // 如果有图片，添加到表单数据
      images.forEach((image, index) => {
        formData.append(`image_${index + 1}`, image);
      });
      
      // 首先尝试查找玩家是否已存在
      try {
        // 构建搜索参数
        const searchParams = new URLSearchParams();
        searchParams.append('nickname', nickname);
        searchParams.append('game_id', gameId);
        searchParams.append('server', serverId);
        
        // 搜索玩家
        const searchResponse = await api.get(`/players/search/?${searchParams.toString()}`);
        const players = searchResponse.data.results || searchResponse.data;
        
        let playerId;
        
        if (players && players.length > 0) {
          // 玩家已存在，直接使用ID
          playerId = players[0].id;
          console.log(`玩家已存在，ID: ${playerId}`);
        } else {
          // 玩家不存在，创建新玩家（不包含记录和图片）
          console.log('玩家不存在，创建新玩家');
          const createResponse = await api.post('/players/', playerData);
          playerId = createResponse.data.id;
          console.log(`创建新玩家成功，ID: ${playerId}`);
        }
        
        // 无论是新玩家还是已有玩家，都使用add_record端点添加记录
        await api.post(`/players/${playerId}/add_record/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(`为玩家 ${playerId} 添加神人事迹成功`);
        
        // 显示成功消息并关闭弹窗
        toast.success('投稿成功！');
        handleClose();
        
      } catch (err: any) {
        console.error('操作失败:', err);
        
        // 检查是否是图片验证错误
        if (err.response?.data?.image_1 || err.response?.data?.image_2 || err.response?.data?.image_3) {
          const imageError = err.response.data.image_1 || err.response.data.image_2 || err.response.data.image_3;
          throw new Error(`图片验证失败: ${imageError}`);
        }
        
        throw err;
      }
      
    } catch (err: any) {
      console.error('提交失败:', err);
      
      // 处理图片相关的错误
      if (err.response?.data?.image_1) {
        setError(`图片1验证失败: ${err.response.data.image_1}`);
      } else if (err.response?.data?.image_2) {
        setError(`图片2验证失败: ${err.response.data.image_2}`);
      } else if (err.response?.data?.image_3) {
        setError(`图片3验证失败: ${err.response.data.image_3}`);
      } else {
        setError(err.message || err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || '提交失败，请稍后再试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">投稿神人</DialogTitle>
        </DialogHeader>

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
            
            {/* 隐藏字段，用于提交表单 */}
            <input type="hidden" name="nickname" value={nickname} />
            <input type="hidden" name="game_id" value={gameId} />
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

          <div className="text-sm text-gray-500">
            <p>注意事项：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>请确保提供的信息真实可靠，不得恶意诋毁他人</li>
              <li>提交后无法修改，请仔细检查信息</li>
              <li>上传的图片将公开显示，请勿上传敏感或侵权内容</li>
            </ul>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '提交中...' : '提交神人记录'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 