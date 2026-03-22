import { apiClient } from './client';
import { UserRole } from '@eloktantra/types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  constituency?: string;
  is_verified: boolean;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Login failed',
    };
  }
};

export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  constituency?: string;
}): Promise<AuthResponse> => {
  try {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', userData);
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed',
    };
  }
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
