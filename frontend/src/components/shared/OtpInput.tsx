'use client';

import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
}

export const OtpInput = ({ length = 6, onComplete }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus ô đầu tiên khi vào trang
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return; // Chỉ cho nhập số

    const newOtp = [...otp];
    // Lấy ký tự cuối cùng nhập vào
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Gọi callback khi nhập (để cập nhật state ở form cha)
    const combinedOtp = newOtp.join('');
    onComplete(combinedOtp);

    // Tự động focus ô tiếp theo
    if (value && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Xử lý nút Xóa (Backspace)
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const data = e.clipboardData.getData('text');
    if (!/^\d+$/.test(data)) return;

    const otpData = data.split('').slice(0, length);
    const newOtp = [...otp];
    otpData.forEach((val, i) => (newOtp[i] = val));
    
    setOtp(newOtp);
    onComplete(newOtp.join(''));
    
    // Focus ô cuối hoặc ô trống tiếp theo
    const nextIndex = newOtp.findIndex(val => val === '');
    const focusIndex = nextIndex === -1 ? length - 1 : nextIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center my-6">
      {otp.map((data, index) => (
        <input
          key={index}
          type="text"
          ref={(el) => { inputRefs.current[index] = el }}
          value={data}
          maxLength={1}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-lg text-center text-xl font-bold transition-all outline-none bg-white text-black",
            data 
              ? "border-blue-600 ring-1 ring-blue-200" 
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          )}
        />
      ))}
    </div>
  );
};