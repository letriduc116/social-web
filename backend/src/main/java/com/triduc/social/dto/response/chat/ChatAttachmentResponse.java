package com.triduc.social.dto.response.chat;

import com.triduc.social.enums.ChatMessageType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatAttachmentResponse {
    private String fileName;
    private String originalFileName;
    private String url;
    private ChatMessageType type;
    private String contentType;
    private long size;
}
