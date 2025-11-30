'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { LogIn } from 'lucide-react'; // Icon

export const LoginForm = () => {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);
  
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await authService.login(formData.identifier, formData.password);
      setToken(data.accessToken);
      router.push('/chats'); // Chuyển hướng vào Chat
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-border">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Chào mừng trở lại!</h1>
        <p className="text-sm text-gray-500 mt-2">Đăng nhập để tiếp tục cuộc trò chuyện</p>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-destructive text-sm rounded-md border border-red-200 flex items-center justify-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email hoặc Username"
          placeholder="example@gmail.com"
          value={formData.identifier}
          onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          required
          autoFocus
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          <LogIn className="w-4 h-4 mr-2" />
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="px-2 bg-white text-gray-500">Hoặc</span></div>
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={authService.loginWithGoogle} type="button" className="w-full">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Tiếp tục với Google
          </Button>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
};