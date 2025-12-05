'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { Button } from '../shared/Button';
import { OtpInput } from '../shared/OtpInput'; // Import ô nhập 6 số
import { CheckCircle, RotateCcw, Mail, Timer } from 'lucide-react';

const OTP_EXPIRE_SECONDS = 300; // 5 phút

const maskEmail = (value: string) => {
  if (!value) return '...';
  const [user, domain] = value.split('@');
  if (!domain) return value;
  if (user.length <= 2) return `***@${domain}`;
  return `${user.slice(0, 2)}***@${domain}`;
};

export const VerifyForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(''); // Chuỗi OTP ghép từ 6 ô
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [remainSeconds, setRemainSeconds] = useState(OTP_EXPIRE_SECONDS);

  // Lấy email từ URL (ví dụ: /verify?email=abc@gmail.com)
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  // Đếm lùi thời gian hiệu lực / chặn spam resend
  useEffect(() => {
    setRemainSeconds(OTP_EXPIRE_SECONDS);
    const timer = setInterval(() => {
      setRemainSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [email]);

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
      setMessage('Xác thực thành công! Đang chuyển hướng...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || remainSeconds > 0) return;
    setIsResending(true);
    setMessage('');
    setError('');
    try {
      await authService.resendOtp(email);
      setMessage('Đã gửi lại mã OTP mới vào email!');
      setRemainSeconds(OTP_EXPIRE_SECONDS); // reset đếm lùi
    } catch (err: any) {
      setError('Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Xác thực tài khoản</h1>
        <p className="text-sm text-gray-500 mt-2 px-4">
          Chúng tôi đã gửi mã xác thực 6 số đến email 
          <br />
          <span className="font-medium text-gray-800">{maskEmail(email)}</span>
        </p>
        <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${remainSeconds <= 60 ? 'bg-orange-50' : 'bg-blue-50'}`}>
          <Timer className={`w-4 h-4 ${remainSeconds <= 60 ? 'text-orange-600' : 'text-blue-600'}`} />
          <span className={`text-sm font-medium ${remainSeconds <= 60 ? 'text-orange-600' : 'text-blue-600'}`}>
            Mã còn hiệu lực: {remainSeconds}s
          </span>
        </div>
      </div>
      
      {/* Thông báo lỗi / thành công */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-lg text-center border border-red-200 animate-in fade-in">
          <p className="font-medium">{error}</p>
        </div>
      )}
      {message && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 text-sm rounded-lg text-center border border-green-200 animate-in fade-in">
          <p className="font-medium">{message}</p>
        </div>
      )}

      <form onSubmit={handleVerify}>
        {/* Component OTP 6 ô */}
        <div className="mb-8">
          <OtpInput 
            length={6} 
            onComplete={(code) => setOtp(code)}
          />
        </div>

        <Button 
          type="submit" 
          isLoading={isLoading} 
          className="w-full bg-blue-600 hover:bg-blue-700 h-11 rounded-lg font-medium shadow-md"
          disabled={otp.length < 6}
        >
          Xác nhận
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-sm mb-3">Bạn không nhận được mã?</p>
        <button 
          onClick={handleResend}
          disabled={isResending || !email || remainSeconds > 0}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center justify-center w-full gap-2 transition-colors py-2"
        >
          <RotateCcw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
          {isResending ? 'Đang gửi...' : remainSeconds > 0 ? `Gửi lại sau ${remainSeconds}s` : 'Gửi lại mã mới'}
        </button>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <button 
            type="button"
            onClick={() => router.push('/register')}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
            Quay lại trang đăng ký
        </button>
      </div>
    </div>
  );
};