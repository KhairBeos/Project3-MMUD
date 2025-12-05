import api from '../lib/api';
import { LoginResponse, RegisterDto, User } from '../types/auth.types';

export const authService = {
  // Đăng ký
  register: async (data: RegisterDto) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Đăng nhập (Local)
  login: async (loginIdentifier: string, password: string) => {
    // Backend trả về { accessToken: string }
    const response = await api.post<LoginResponse>('/auth/login', {
      loginIdentifier, // Khớp tên biến với Backend
      password,
    });
    return response.data;
  },

  // Xác thực OTP
  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  // Gửi lại OTP
  resendOtp: async (email: string) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (email: string, token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, token, newPassword });
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    // Gọi backend để báo logout (tùy chọn)
    await api.post('/auth/logout');
  },

  // Lấy thông tin User hiện tại (nếu bạn chưa có API này thì tạm thời bỏ qua)
  // Tôi khuyên nên thêm api GET /auth/profile ở backend
  getProfile: async () => {
    // Giả sử backend có endpoint này
    const response = await api.get<User>('/auth/profile'); 
    return response.data;
  },
  
  // Google Login Redirect
  loginWithGoogle: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  }
};