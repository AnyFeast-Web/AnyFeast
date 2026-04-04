import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export interface NutritionistUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  created_at: string;
}

interface AuthState {
  user: NutritionistUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: NutritionistUser, token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // starts loading while firebase checks status
  setUser: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
