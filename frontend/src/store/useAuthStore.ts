import { create } from 'zustand';
import { User } from '../types/auth.types';

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Lấy token từ localStorage nếu có (cần kiểm tra window để tránh lỗi SSR)
  token: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  user: null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
    set({ token });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null });
  },
}));