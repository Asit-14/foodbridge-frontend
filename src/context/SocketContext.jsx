import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('accessToken');
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelayMax: 30000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // ── Reconnection feedback ──────────────────────
    socket.io.on('reconnect_attempt', (attempt) => {
      if (attempt >= 3) {
        toast('Reconnecting to server...', { icon: '🔄', duration: 3000 });
      }
    });
    socket.io.on('reconnect', () => {
      toast.success('Reconnected to server', { duration: 3000 });
    });
    socket.io.on('reconnect_failed', () => {
      toast.error('Unable to reconnect. Please refresh the page.', { duration: 8000 });
    });

    // ── Global real-time event handlers ──────────
    socket.on('notification', (data) => {
      toast(data.title, {
        icon: '🔔',
        duration: 5000,
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#f8fafc',
        },
      });
    });

    socket.on('new-donation', (data) => {
      if (user?.role === 'ngo') {
        toast.success(`New donation: ${data.foodType} (${data.quantity})`, { duration: 6000 });
      }
    });

    socket.on('donation-status-update', (data) => {
      toast(`Donation status: ${data.status}`, {
        icon: '📦',
        duration: 4000,
      });
    });

    // Join city room if user has one
    if (user?.address?.city) {
      socket.emit('join:city', user.address.city);
    }

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, user]);

  const joinDonationRoom = useCallback((donationId) => {
    socketRef.current?.emit('join:donation', donationId);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinDonationRoom }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
