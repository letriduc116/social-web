package com.triduc.social.dto.response.chat;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversationResponse {
    private String id;
    private String name;
    private String avatarColor;
    private String avatarUrl;
    private String status;
    private String activeLabel;
    private String lastMessage;
    private String lastMessageAt;
    private long unreadCount;
    private boolean pinned;
    private boolean typing;
    private LocalDateTime updatedAt;
    private List<ChatMessageResponse> messages;
}
