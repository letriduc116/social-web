package com.triduc.social.dto.request.chat;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatCallSignalRequest {
    /** Conversation đang gọi. */
    private String conversationId;

    /** CALL_OFFER, CALL_ANSWER, ICE_CANDIDATE, CALL_END, CALL_REJECT, CALL_CANCEL. */
    private String signalType;

    /** true = video call, false = voice call. */
    private boolean video;

    /** WebRTC session description: offer/answer. */
    private Map<String, Object> sdp;

    /** WebRTC ICE candidate. */
    private Map<String, Object> candidate;
}
