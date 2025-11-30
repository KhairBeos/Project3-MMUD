'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/shared/Input';
import { Button } from '../../components/shared/Button';
import { cn } from '../../lib/utils';

/* --- GOOGLE ICON --- */
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none">
    <path d="M43.611 20.083H42V20H24V28H35.303C33.654 32.657 29.2 36 24 36C17.373 36 12 30.627 
    12 24C12 17.373 17.373 12 24 12C27.059 12 29.842 13.154 31.961 15.039L37.618 
    9.382C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24C4 35.045 12.955 44 24 
    44C35.045 44 44 35.045 44 24C44 22.659 43.862 21.35 43.611 20.083Z" fill="#FFC107"/>
    <path d="M6.306 14.691L12.877 19.511C14.655 15.108 18.961 12 24 12C27.059 12 29.842 
    13.154 31.961 15.039L37.618 9.382C34.046 6.053 29.268 4 24 4C16.318 4 9.656 
    8.337 6.306 14.691Z" fill="#FF3D00"/>
    <path d="M24 44C29.29 44 34.085 41.926 37.654 38.568L31.821 33.324C29.679 34.989 
    26.99 36 24 36C18.779 36 14.309 32.632 12.669 27.948L6.045 32.979C9.368 
    39.554 16.195 44 24 44Z" fill="#4CAF50"/>
    <path d="M43.611 20.083H42V20H24V28H35.303C34.535 30.208 33.343 32.029 
    31.821 33.324L37.654 38.568C41.329 35.167 43.434 30.293 43.917 
    24.891C43.97 24.279 44 23.647 44 23.001C44 22.015 43.866 21.04 
    43.611 20.083Z" fill="#1976D2"/>
  </svg>
);

const SocialButton = ({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="
      w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200
      shadow-sm hover:bg-gray-100 hover:shadow-md active:scale-[.96]
      transition-all duration-200
    "
  >
    {icon}
  </button>
);

export const AuthWrapper = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore(s => s.setToken);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ identifier: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });

  /* LOGIN */
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await authService.login(loginData.identifier, loginData.password);
      setToken(data.accessToken);
      router.push('/chats');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  /* REGISTER */
  const handleRegister = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.register(registerData);
      router.push(`/verify?email=${encodeURIComponent(registerData.email)}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden w-[900px] max-w-full min-h-[580px]",
        isSignUp ? "right-panel-active" : ""
      )}
    >

      {/* REGISTER FORM */}
      <div
        className={cn(
          "absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out opacity-0 z-10",
          isSignUp && "translate-x-full opacity-100 z-40"
        )}
      >
        <form
          onSubmit={handleRegister}
          className="bg-white flex flex-col items-center justify-center h-full px-12 text-center"
        >
          <h1 className="font-semibold text-3xl mb-4 text-gray-800">Tạo tài khoản</h1>

          <div className="w-full space-y-4 text-left">
            <Input placeholder="Tên người dùng" value={registerData.username}
              onChange={e => setRegisterData({ ...registerData, username: e.target.value })} />

            <Input placeholder="Email" type="email" value={registerData.email}
              onChange={e => setRegisterData({ ...registerData, email: e.target.value })} />

            <Input placeholder="Mật khẩu" type="password" value={registerData.password}
              onChange={e => setRegisterData({ ...registerData, password: e.target.value })} />
          </div>

          <Button
            className="mt-6 w-44 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
            isLoading={isLoading}
            type="submit"
          >
            Đăng Ký
          </Button>
        </form>
      </div>

      {/* LOGIN FORM */}
      <div
        className={cn(
          "absolute top-0 left-0 w-1/2 h-full transition-all duration-500 ease-in-out z-20",
          isSignUp && "translate-x-full opacity-0"
        )}
      >
        <form
          onSubmit={handleLogin}
          className="bg-white flex flex-col items-center justify-center h-full px-12 text-center"
        >
          <h1 className="font-semibold text-3xl mb-4 text-gray-800">Đăng nhập</h1>

          <div className="flex gap-4 mb-5">
            <SocialButton onClick={authService.loginWithGoogle} icon={<GoogleIcon />} />
          </div>

          <p className="text-xs text-gray-500 mb-6">hoặc đăng nhập bằng tài khoản của bạn</p>

          <div className="w-full space-y-4 text-left">
            <Input placeholder="Email hoặc Username" value={loginData.identifier}
              onChange={e => setLoginData({ ...loginData, identifier: e.target.value })} />

            <Input placeholder="Mật khẩu" type="password" value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
          </div>

          <a className="text-xs text-gray-500 mt-4 hover:underline cursor-pointer">Quên mật khẩu?</a>

          <Button
            className="mt-6 w-44 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md"
            type="submit"
            isLoading={isLoading}
          >
            Đăng Nhập
          </Button>
        </form>
      </div>

      {/* OVERLAY */}
      <div
        className={cn(
          "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-30",
          isSignUp && "-translate-x-full"
        )}
      >
        <div
          className={cn(
            "bg-linear-to-r from-blue-600 to-indigo-500 text-white relative -left-full h-full w-[200%] flex items-center justify-between transition-transform duration-700",
            isSignUp ? "translate-x-1/2" : "translate-x-0"
          )}
        >
          {/* WELCOME BACK (LOGIN SIDE) */}
          <div className="w-1/2 flex flex-col items-center px-10 text-center">
            <h1 className="font-bold text-3xl mb-4">Chào mừng trở lại!</h1>
            <p className="font-light text-sm mb-7">Đăng nhập để tiếp tục cuộc trò chuyện.</p>

            <button
              onClick={() => setIsSignUp(false)}
              className="border border-white px-10 py-2 rounded-full uppercase font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Đăng Nhập
            </button>
          </div>

          {/* HELLO (REGISTER SIDE) */}
          <div className="w-1/2 flex flex-col items-center px-10 text-center">
            <h1 className="font-bold text-3xl mb-4">Xin chào!</h1>
            <p className="font-light text-sm mb-7">Hãy nhập thông tin và bắt đầu hành trình.</p>

            <button
              onClick={() => setIsSignUp(true)}
              className="border border-white px-10 py-2 rounded-full uppercase font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
