import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { goLogin } from '@/utils/nav';

export function useRequireAuth() {
  const { user, isLoading } = useAuthStore(s => ({ user: s.user, isLoading: s.isLoading }));

  useEffect(() => {
    if (!isLoading && !user) {
      goLogin();
    }
  }, [user, isLoading]);

  return { user, isLoading };
}
