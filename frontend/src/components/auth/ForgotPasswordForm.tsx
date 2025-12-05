'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Mail, ArrowLeft } from 'lucide-react';

type ForgotPasswordFormProps = {
  onSuccess?: () => void;
};

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const goLogin = () => {
    setIsRedirecting(true);
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Kiểm tra email</h1>
            <p className="text-gray-600 text-sm mb-8">
              Nếu email tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu trong vòng vài phút.
            </p>
            <button
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
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h1>
        <p className="text-sm text-gray-500 mt-2">Nhập email để nhận link đặt lại mật khẩu</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-in fade-in">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="your@email.com"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          required
          autoFocus
        />

        <Button type="submit" isLoading={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg font-medium shadow-md">
          Gửi link đặt lại
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <button
          type="button"
          onClick={goLogin}
          disabled={isRedirecting}
          className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2 w-full disabled:opacity-60 transition-colors"
        >
          <ArrowLeft className={`w-4 h-4 ${isRedirecting ? 'animate-spin' : ''}`} />
          {isRedirecting ? 'Đang chuyển...' : 'Quay lại đăng nhập'}
          </button>
        </div>
      </div>
  );
};