import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import type { ChatCallSignal, ChatConversation, ChatMessage, SendMessagePayload, TypingPayload } from '../types/chat';

const WS_URL = 'http://localhost:8080/ws';
// const WS_URL = 'http://192.168.1.200:8080/ws';
const ACCESS_TOKEN_KEY = 'accessToken';

type ChatSocketHandlers = {
  onMessage?: (message: ChatMessage) => void;
  onConversation?: (conversation: ChatConversation) => void;
  onTyping?: (payload: TypingPayload) => void;
  onCall?: (payload: ChatCallSignal) => void;
  onConnect?: () => void;
  onError?: (error: unknown) => void;
};

let stompClient: Client | null = null;
let socketToken = '';
const subscribers = new Set<ChatSocketHandlers>();

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)?.trim() || '';

const emit = (handlerName: keyof ChatSocketHandlers, payload?: unknown) => {
  subscribers.forEach((handlers) => {
    const handler = handlers[handlerName] as ((value?: unknown) => void) | undefined;
    handler?.(payload);
  });
};

const safeParse = <T>(message: IMessage): T | null => {
  try {
    return JSON.parse(message.body) as T;
  } catch (error) {
    emit('onError', error);
    return null;
  }
};

const normalizeSocketMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  sender: message.mine ? 'me' : 'them',
  type: message.type || 'TEXT',
});

const normalizeSocketConversation = (conversation: ChatConversation): ChatConversation => ({
  ...conversation,
  messages: (conversation.messages || []).map(normalizeSocketMessage),
});

const createClient = (token: string) => {
  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => undefined,
    onConnect: () => {
      emit('onConnect');

      client.subscribe('/user/queue/messages', (message) => {
        const payload = safeParse<ChatMessage>(message);
        if (payload) emit('onMessage', normalizeSocketMessage(payload));
      });

      client.subscribe('/user/queue/conversations', (message) => {
        const payload = safeParse<ChatConversation>(message);
        if (payload) emit('onConversation', normalizeSocketConversation(payload));
      });

      client.subscribe('/user/queue/typing', (message) => {
        const payload = safeParse<TypingPayload>(message);
        if (payload) emit('onTyping', payload);
      });

      client.subscribe('/user/queue/call', (message) => {
        const payload = safeParse<ChatCallSignal>(message);
        if (payload) emit('onCall', payload);
      });
    },
    onStompError: (frame) => emit('onError', frame),
    onWebSocketError: (event) => emit('onError', event),
  });

  client.activate();
  return client;
};

const ensureSocket = () => {
  const token = getAccessToken();

  if (!token) {
    emit('onError', new Error('Không tìm thấy accessToken để kết nối chat WebSocket'));
    return;
  }

  if (stompClient?.active && socketToken === token) return;

  if (stompClient?.active || stompClient?.connected) {
    void stompClient.deactivate();
    stompClient = null;
  }

  socketToken = token;
  stompClient = createClient(token);
};

export const subscribeChatSocket = (handlers: ChatSocketHandlers) => {
  subscribers.add(handlers);
  ensureSocket();

  return () => {
    subscribers.delete(handlers);

    if (subscribers.size === 0) {
      void stompClient?.deactivate();
      stompClient = null;
      socketToken = '';
    }
  };
};

export const isChatSocketConnected = () => Boolean(stompClient?.connected);

export const sendChatMessageSocket = (payload: SendMessagePayload) => {
  if (!stompClient?.connected) return false;

  stompClient.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({
      ...payload,
      type: payload.type || 'TEXT',
    }),
  });

  return true;
};

export const sendChatTypingSocket = (payload: TypingPayload) => {
  if (!stompClient?.connected) return false;

  stompClient.publish({
    destination: '/app/chat.typing',
    body: JSON.stringify(payload),
  });

  return true;
};

export const sendChatCallSignalSocket = (payload: ChatCallSignal) => {
  if (!stompClient?.connected) return false;

  stompClient.publish({
    destination: '/app/chat.call',
    body: JSON.stringify(payload),
  });

  return true;
};
