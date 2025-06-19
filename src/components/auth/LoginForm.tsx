import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import Input from '../ui/Input';
import authService from '@/lib/auth';
import { formatError } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('开始登录流程...');
      setIsLoading(true);
      setError('');
      
      console.log('调用登录 API...');
      const response = await authService.login(data);
      console.log('登录 API 响应成功:', response);
      
      console.log('设置 tokens...');
      authService.setTokens(response.access, response.refresh);
      
      // 触发认证状态更新事件
      console.log('触发认证状态更新事件...');
      window.dispatchEvent(new Event('auth-change'));
      
      console.log('导航到角色管理页面...');
      // 直接导航到角色管理页面
      navigate('/characters', { replace: true });
      
    } catch (err) {
      console.error('登录失败:', err);
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="text-gray-500">欢迎回来！请登录您的账号</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="邮箱地址"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="密码"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}

        <Button
          type="submit"
          className="w-full"
          variant="default"
          disabled={isLoading}
        >
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          登录
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-500">还没有账号？</span>
        <button
          onClick={() => navigate('/register')}
          className="ml-1 text-primary hover:underline"
        >
          立即注册
        </button>
      </div>
    </div>
  );
};

export default LoginForm; 