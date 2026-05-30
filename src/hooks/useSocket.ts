import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Connects to the Socket.io server.
 *
 * On Replit dev: relative path /ws — proxied by the platform to port 8080.
 * On Vercel:     VITE_SOCKET_URL = your deployed Replit backend URL
 *                e.g. https://your-app-name.replit.app
 */
export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const externalUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;

    socketRef.current = externalUrl
      ? io(externalUrl, { path: '/ws/socket.io' })
      : io({ path: '/ws/socket.io' });

    socketRef.current.on('connect', () => setConnected(true));
    socketRef.current.on('disconnect', () => setConnected(false));

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connected };
};
