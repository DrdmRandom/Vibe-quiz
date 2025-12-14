'use client';

import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/config';

export function useSocket(namespace = '', enabled = true) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const socketUrl = useMemo(() => `${API_URL}${namespace}`, [namespace]);

  useEffect(() => {
    if (!enabled) return undefined;

    const instance = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    const onError = (err: Error) => {
      toast.error(err.message || 'Connection error');
    };

    instance.on('connect_error', onError);
    instance.on('disconnect', (reason) => {
      toast((t) =>
        reason === 'io client disconnect'
          ? null
          : `Disconnected: ${reason || 'unknown'}`,
      );
    });
    instance.on('reconnect', () => toast.success('Reconnected'));

    setSocket(instance);

    return () => {
      instance.off('connect_error', onError);
      instance.disconnect();
    };
  }, [socketUrl, enabled]);

  return socket;
}
