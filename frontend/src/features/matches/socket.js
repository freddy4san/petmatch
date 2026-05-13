import { io } from 'socket.io-client';

import { getRealtimeUrl } from '../../shared/lib/apiClient';

export function createChatSocket(token) {
  return io(getRealtimeUrl(), {
    auth: {
      token
    },
    autoConnect: false,
    transports: ['websocket', 'polling']
  });
}
