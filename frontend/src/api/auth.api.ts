import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/`
  : 'http://127.0.0.1:8000/api/v1/';

const raw = axios.create({ baseURL });

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'nutritionist' | 'admin';
  status: 'active' | 'pending' | 'disabled';
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await raw.post<LoginResponse>('auth/login', { email, password });
    return data;
  },

  async register(email: string, password: string, name: string) {
    const { data } = await raw.post('auth/register', { email, password, name });
    return data as { user: AuthUser; verificationToken: string };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { data } = await raw.post('auth/refresh', { refreshToken });
    return data;
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await raw.post('auth/logout', { refreshToken });
    } catch {
      // ignore — server is already in unknown state for this token
    }
  },

  async me(accessToken: string): Promise<AuthUser> {
    const { data } = await raw.get<{ user: AuthUser }>('auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data.user;
  },

  async forgotPassword(email: string): Promise<void> {
    await raw.post('auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await raw.post('auth/reset-password', { token, password });
  },

  async changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
    await raw.post(
      'auth/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  },
};
