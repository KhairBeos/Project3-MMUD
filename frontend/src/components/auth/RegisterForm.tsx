'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/utils';

type RegisterFormProps = {
  onSuccess?: (email: string) => void;
  className?: string;
};

export const RegisterForm = ({ onSuccess, className }: RegisterFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      setError('Vui lòng điền tất cả các trường');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(registerData.email)) {
      setError('Email không hợp lệ');
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.register(registerData);
      onSuccess?.(registerData.email);
      router.push(`/verify?email=${encodeURIComponent(registerData.email)}`);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className={cn('bg-white flex flex-col items-center justify-center h-full px-8 md:px-12 text-center', className)}
    >
      <div className="w-full max-w-sm">
        <h1 className="font-bold text-4xl mb-2 text-gray-900">Tạo tài khoản</h1>
        <p className="text-sm text-gray-500 mb-8">Bắt đầu cuộc trò chuyện bảo mật ngay hôm nay</p>

        <div className="w-full space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-in fade-in">
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <Input
            placeholder="Tên người dùng"
            value={registerData.username}
            onChange={(e) => {
              setRegisterData({ ...registerData, username: e.target.value });
              setError('');
            }}
            autoFocus
          />

          <Input
            placeholder="Email"
            type="email"
            value={registerData.email}
            onChange={(e) => {
              setRegisterData({ ...registerData, email: e.target.value });
              setError('');
            }}
          />

          <Input
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            type="password"
            value={registerData.password}
            onChange={(e) => {
              setRegisterData({ ...registerData, password: e.target.value });
              setError('');
            }}
          />
        </div>

        <Button className="mt-8 w-full rounded-lg bg-blue-600 hover:bg-blue-700 h-11 shadow-md font-medium" isLoading={isLoading} type="submit">
          Tạo tài khoản
        </Button>

        <p className="mt-6 text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">Đăng nhập</a>
        </p>
      </div>
    </form>
  );
};
