import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { setUser, logout, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setUser(
          {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Nutritionist',
            email: firebaseUser.email || '',
            role: 'nutritionist',
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
          },
          token
        );
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [setUser, logout, setLoading]);
}
