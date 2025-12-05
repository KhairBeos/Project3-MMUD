'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
    <path d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.2 36 24 36C17.373 36 12 30.627 12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107" />
    <path d="M6.306 14.691L12.877 19.511C14.655 15.108 18.961 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691Z" fill="#FF3D00" />
    <path d="M24 44C29.29 44 34.085 41.926 37.654 38.568L31.821 33.324C29.679 34.989 26.99 36 24 36C18.779 36 14.309 32.632 12.669 27.948L6.045 32.979C9.368 39.554 16.195 44 24 44Z" fill="#4CAF50" />
    <path d="M43.611 20.083H42V20H24V28H35.303C34.535 30.208 33.343 32.029 31.821 33.324L37.654 38.568C41.329 35.167 43.434 30.293 43.917 24.891C43.97 24.279 44 23.647 44 23.001C44 22.015 43.866 21.04 43.611 20.083Z" fill="#1976D2" />
  </svg>
);

const SocialButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 shadow-sm hover:bg-gray-100 hover:shadow-md active:scale-[.96] transition-all duration-200"
  >
    <GoogleIcon />
  </button>
);

type LoginFormProps = {
  onSuccess?: () => void;
  className?: string;
};

export const LoginForm = ({ onSuccess, className }: LoginFormProps) => {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!loginData.identifier || !loginData.password) {
      setError('Vui lòng điền email/username và mật khẩu');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await authService.login(loginData.identifier, loginData.password);
      setToken(data.accessToken);
      setIsRedirecting(true);
      onSuccess?.();
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/chats');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      setLoginData({ ...loginData, password: '' }); // Clear password on error
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className={cn('bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center', className)}
    >
      <div className="w-full max-w-sm">
        <h1 className="font-bold text-4xl mb-2 text-gray-900">Đăng nhập</h1>
        <p className="text-sm text-gray-500 mb-8">Chào mừng quay lại SecureChat</p>

        <div className="flex gap-3 mb-8 justify-center">
          <SocialButton onClick={authService.loginWithGoogle} />
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-500">hoặc tiếp tục bằng email</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-in fade-in">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <Input
            placeholder="Email hoặc Username"
            value={loginData.identifier}
            onChange={(e) => {
              setLoginData({ ...loginData, identifier: e.target.value });
              setError('');
            }}
            autoFocus
          />

        <Input
          placeholder="Mật khẩu"
          type="password"
          value={loginData.password}
          onChange={(e) => {
            setLoginData({ ...loginData, password: e.target.value });
            setError('');
          }}
        />
      </div>

      <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-14">Quên mật khẩu?</a>

      <Button className="mt-8 w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-11 shadow-md font-medium" type="submit" isLoading={isLoading || isRedirecting} disabled={isRedirecting}>
        {isRedirecting ? 'Đang chuyển...' : 'Đăng Nhập'}
      </Button>
      </div>
    </form>
  );
};
