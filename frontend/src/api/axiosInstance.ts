import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';
import { authApi } from './auth.api';

const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/`
  : 'http://127.0.0.1:8000/api/v1/';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshInFlight: Promise<{ accessToken: string; refreshToken: string }> | null = null;

async function performRefresh(): Promise<{ accessToken: string; refreshToken: string }> {
  if (!refreshInFlight) {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) throw new Error('no refresh token');
    refreshInFlight = authApi
      .refresh(refreshToken)
      .then((tokens) => {
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry && !original.url?.includes('auth/')) {
      original._retry = true;
      try {
        const tokens = await performRefresh();
        if (original.headers) {
          original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return api.request(original as AxiosRequestConfig);
      } catch {
        useAuthStore.getState().clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      useAuthStore.getState().clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
