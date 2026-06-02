package com.triduc.social.dto.response.chat;

import com.triduc.social.enums.ChatMessageType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private String id;
    private String conversationId;
    private String senderId;
    private String senderName;
    private String senderAvatar;
    private boolean mine;
    private ChatMessageType type;
    private String text;
    private String attachmentUrl;
    private String time;
    private String status;
    private LocalDateTime createdAt;
}
