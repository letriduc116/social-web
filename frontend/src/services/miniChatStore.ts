import { createContext, useContext } from 'react';
import type { ChatConversation } from '../types/chat';

export type MiniChatContextValue = {
  conversations: ChatConversation[];
  loadingConversations: boolean;
  openMiniChat: (conversationIdOrReceiverId: string) => Promise<void> | void;
  closeMiniChat: (conversationId: string) => void;
  minimizeMiniChat: (conversationId: string) => void;
  refreshConversations: () => Promise<void> | void;
};

export const MiniChatContext = createContext<MiniChatContextValue | null>(null);

export function useMiniChat() {
  const context = useContext(MiniChatContext);

  if (!context) {
    throw new Error('useMiniChat must be used inside MiniChatProvider');
  }

  return context;
}
