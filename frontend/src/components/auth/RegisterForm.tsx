'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { UserPlus } from 'lucide-react';

export const RegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.register(formData);
      // Chuyển hướng sang Verify kèm email để điền sẵn
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-border">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Tạo tài khoản mới</h1>
        <p className="text-sm text-gray-500 mt-2">Tham gia cộng đồng ngay hôm nay</p>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-destructive text-sm rounded-md border border-red-200 flex justify-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên đăng nhập"
          placeholder="user123"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 6 ký tự"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />

        <Button type="submit" isLoading={isLoading} className="w-full mt-2">
          <UserPlus className="w-4 h-4 mr-2" />
          Đăng ký tài khoản
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
};