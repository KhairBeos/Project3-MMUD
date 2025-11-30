'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Button } from '../shared/Button';
import { OtpInput } from '../shared/OtpInput'; // Import ô nhập 6 số
import { CheckCircle, RotateCcw, Mail } from 'lucide-react';

export const VerifyForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // Chuỗi OTP ghép từ 6 ô
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Lấy email từ URL (ví dụ: /verify?email=abc@gmail.com)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Vui lòng nhập đủ 6 số OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await authService.verifyEmail(email, otp);
      alert('Xác thực thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    setMessage('');
    setError('');
    try {
      await authService.resendOtp(email);
      setMessage('Đã gửi lại mã OTP mới vào email!');
    } catch (err: any) {
      setError('Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Xác thực tài khoản</h1>
        <p className="text-sm text-gray-500 mt-2 px-4">
          Chúng tôi đã gửi mã xác thực 6 số đến email 
          <br />
          <span className="font-medium text-gray-800">{email || '...'}</span>
        </p>
      </div>
      
      {/* Thông báo lỗi / thành công */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-100 animate-pulse">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-100">
          {message}
        </div>
      )}

      <form onSubmit={handleVerify}>
        {/* Component OTP 6 ô */}
        <div className="mb-6">
          <OtpInput 
            length={6} 
            onComplete={(code) => setOtp(code)} // Cập nhật state khi nhập
          />
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-md shadow-blue-200"
          disabled={otp.length < 6}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Xác nhận
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-2">Bạn không nhận được mã?</p>
        <button 
          onClick={handleResend}
          disabled={isResending || !email}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400 flex items-center justify-center w-full gap-2 transition-colors"
        >
          <RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Đang gửi...' : 'Gửi lại mã mới'}
        </button>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <button 
            type="button"
            onClick={() => router.push('/register')}
            className="text-xs text-gray-400 hover:text-gray-600"
        >
            Quay lại trang đăng ký
        </button>
      </div>
    </div>
  );
};