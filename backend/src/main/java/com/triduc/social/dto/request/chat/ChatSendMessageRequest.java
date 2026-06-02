package com.triduc.social.dto.request.chat;

import com.triduc.social.enums.ChatMessageType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSendMessageRequest {
    /** Có conversationId khi gửi trong đoạn chat đã tồn tại. */
    private String conversationId;

    /** Có receiverId khi bắt đầu đoạn chat 1-1 mới. */
    private String receiverId;

    private String content;
    private ChatMessageType type;
    private String attachmentUrl;
}
