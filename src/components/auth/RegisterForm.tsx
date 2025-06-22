import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import Input from '../ui/Input';
import authService from '@/lib/auth';
import { formatError } from '@/lib/utils';
import { apiService } from '@/lib/api';

// 带邀请码的注册表单数据结构
const registerSchemaWithInvitation = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  confirmPassword: z.string().min(8, '请确认密码'),
  verify_code: z.string().length(6, '验证码必须是6位数字'),
  invitation_code: z.string().min(1, '请输入邀请码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

// 不需要邀请码的注册表单数据结构
const registerSchemaWithoutInvitation = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
  confirmPassword: z.string().min(8, '请确认密码'),
  verify_code: z.string().length(6, '验证码必须是6位数字'),
  invitation_code: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

type RegisterFormDataWithInvitation = z.infer<typeof registerSchemaWithInvitation>;
type RegisterFormDataWithoutInvitation = z.infer<typeof registerSchemaWithoutInvitation>;
type RegisterFormData = RegisterFormDataWithInvitation | RegisterFormDataWithoutInvitation;

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [requireInvitationCode, setRequireInvitationCode] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);

  const formWithInvitation = useForm<RegisterFormDataWithInvitation>({
    resolver: zodResolver(registerSchemaWithInvitation),
  });

  const formWithoutInvitation = useForm<RegisterFormDataWithoutInvitation>({
    resolver: zodResolver(registerSchemaWithoutInvitation),
  });

  const currentForm = requireInvitationCode ? formWithInvitation : formWithoutInvitation;
  const { register, handleSubmit, formState: { errors }, watch } = currentForm;

  const watchedValues = watch();
  const email = watchedValues.email;

  // 获取系统配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log('正在获取系统配置...');
        const config = await apiService.getSystemConfig();
        console.log('系统配置:', config);
        setRequireInvitationCode(config.require_invitation_code);
      } catch (error) {
        console.error('获取系统配置失败:', error);
        // 默认需要邀请码
        setRequireInvitationCode(true);
      } finally {
        setConfigLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendVerifyCode = async () => {
    if (!email) {
      setError('请先输入邮箱地址');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      await authService.sendVerifyCode(email);
      setCountdown(60);
    } catch (error: any) {
      setError(formatError(error));
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const registerData = {
        email: data.email,
        password: data.password,
        verify_code: data.verify_code,
        ...(requireInvitationCode && 'invitation_code' in data && data.invitation_code ? { invitation_code: data.invitation_code } : {})
      };

      const response = await authService.register(registerData);
      
      // 注册成功后自动登录
      authService.setTokens(response.token.access, response.token.refresh);
      authService.setUser(response.user);
      
      navigate('/');
    } catch (error: any) {
      setError(formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-2">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">注册</h1>
        <p className="text-gray-500">创建您的账号</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

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

        {requireInvitationCode && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="邀请码"
              error={errors.invitation_code?.message}
              {...register('invitation_code')}
            />
          </div>
        )}

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

        <Button
          type="submit"
          className="w-full"
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
          type="button"
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:underline ml-1"
        >
          立即登录
        </button>
      </div>
    </div>
  );
};

export default RegisterForm; 