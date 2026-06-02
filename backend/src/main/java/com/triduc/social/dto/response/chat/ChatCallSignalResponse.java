package com.triduc.social.dto.response.chat;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatCallSignalResponse {
    private String conversationId;
    private String signalType;
    private boolean video;

    private String callerId;
    private String callerName;
    private String callerAvatar;

    private Map<String, Object> sdp;
    private Map<String, Object> candidate;
}
