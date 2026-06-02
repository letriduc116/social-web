import { createContext, useContext } from 'react';
import type { ChatConversation } from '../types/chat';

export type ChatCallContextValue = {
  startCall: (conversation: ChatConversation, video: boolean) => Promise<void>;
  isInCall: boolean;
};

export const ChatCallContext = createContext<ChatCallContextValue>({
  startCall: async () => {
    console.warn('ChatCallProvider chưa được gắn quanh ứng dụng.');
  },
  isInCall: false,
});

export const useChatCall = () => useContext(ChatCallContext);
