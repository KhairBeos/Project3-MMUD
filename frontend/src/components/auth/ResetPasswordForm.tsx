'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react';

export const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const goLogin = () => {
    setIsRedirecting(true);
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(email, token, newPassword);
      setIsSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thành công!</h1>
        <p className="text-gray-600 text-sm mb-8">Mật khẩu của bạn đã được đặt lại. Đang chuyển hướng về trang đăng nhập...</p>
        <button
          type="button"
          onClick={goLogin}
          disabled={isRedirecting}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center gap-2 w-full disabled:opacity-60"
        >
          <CheckCircle className={`w-4 h-4 ${isRedirecting ? 'animate-spin' : ''}`} />
          {isRedirecting ? 'Đang chuyển...' : 'Về trang đăng nhập'}
        </button>
      </div>
    );
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link không hợp lệ</h1>
        <p className="text-gray-600 text-sm mb-8">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu link mới.</p>
        <button
          type="button"
          onClick={goLogin}
          disabled={isRedirecting}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <ArrowLeft className={`w-4 h-4 ${isRedirecting ? 'animate-spin' : ''}`} />
          {isRedirecting ? 'Đang chuyển...' : 'Quay lại đăng nhập'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-gray-500 mt-2">Nhập mật khẩu mới của bạn</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-in fade-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Mật khẩu mới"
          placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-12 shadow-md">
          Đặt lại mật khẩu
        </Button>
      </form>
    </div>
  );
};
