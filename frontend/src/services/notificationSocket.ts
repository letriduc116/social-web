import SockJS from 'sockjs-client';
import { Client, type IMessage, type StompSubscription } from '@stomp/stompjs';
import { ApiService } from './api';
import type { NotificationResponse } from '../types/notification';

const WS_URL = 'http://localhost:8080/ws';

let stompClient: Client | null = null;
let subscription: StompSubscription | null = null;

export const connectNotificationSocket = (
  onNotification: (notification: NotificationResponse) => void,
  onError?: (message: string) => void,
) => {
  const token = ApiService.getAccessToken();

  if (!token) {
    onError?.('Không tìm thấy access token để kết nối WebSocket');
    return () => {};
  }

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    debug: () => {},

    onConnect: () => {
      subscription =
        stompClient?.subscribe('/user/queue/notifications', (message: IMessage) => {
          try {
            const notification = JSON.parse(message.body) as NotificationResponse;
            onNotification(notification);
          } catch (error) {
            console.error('Không parse được notification realtime:', error);
          }
        }) || null;
    },

    onStompError: (frame) => {
      onError?.(frame.headers.message || 'Lỗi STOMP WebSocket');
    },

    onWebSocketError: () => {
      onError?.('Không thể kết nối WebSocket');
    },
  });

  stompClient.activate();

  return () => {
    subscription?.unsubscribe();
    subscription = null;

    stompClient?.deactivate();
    stompClient = null;
  };
};
