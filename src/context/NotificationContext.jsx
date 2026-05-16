import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { getUnreadCount } from '../api/notificationApi';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { userId, token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!userId || !token) return;
    try {
      const res = await getUnreadCount(userId);
      setUnreadCount(res.data.data || 0);
    } catch {
      // silent
    }
  }, [userId, token]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  const decrementCount = () =>
    setUnreadCount((c) => Math.max(0, c - 1));

  const resetCount = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        fetchCount,
        decrementCount,
        resetCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}