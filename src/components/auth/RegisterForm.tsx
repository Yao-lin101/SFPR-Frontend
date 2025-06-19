import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import Input from '../ui/Input';
import authService from '@/lib/auth';
import { formatError } from '@/lib/utils';

const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  confirmPassword: z.string().min(8, '请确认密码'),
  verify_code: z.string().length(6, '验证码必须是6位数字'),
  invitation_code: z.string().min(1, '请输入邀请码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [countdown, setCountdown] = React.useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const email = watch('email');

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendVerifyCode = async () => {
    try {
      setIsSendingCode(true);
      setError('');
      await authService.sendVerifyCode(email);
      setCountdown(60);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError('');
      const { confirmPassword, ...registerData } = data;
      const response = await authService.register(registerData);
      authService.setTokens(response.access, response.refresh);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/characters', { replace: true });
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">注册</h1>
        <p className="text-gray-500">创建您的账号</p>
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
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="验证码"
              error={errors.verify_code?.message}
              {...register('verify_code')}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendVerifyCode}
              disabled={!email || countdown > 0 || isSendingCode}
              className="whitespace-nowrap"
            >
              {isSendingCode && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="邀请码"
            error={errors.invitation_code?.message}
            {...register('invitation_code')}
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

        <div className="space-y-2">
          <Input
            type="password"
            placeholder="确认密码"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
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
          注册
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-500">已有账号？</span>
        <button
          onClick={() => navigate('/login')}
          className="ml-1 text-primary hover:underline"
        >
          立即登录
        </button>
      </div>
    </div>
  );
};

export default RegisterForm; 