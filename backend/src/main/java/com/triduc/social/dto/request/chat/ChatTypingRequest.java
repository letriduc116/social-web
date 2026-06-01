package com.triduc.social.dto.request.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatTypingRequest {
    private String conversationId;
    private boolean typing;
}
