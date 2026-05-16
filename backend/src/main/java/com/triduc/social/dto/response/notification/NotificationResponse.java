package com.triduc.social.dto.response.notification;

import com.triduc.social.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private String id;
    private String receiverId;

    private String senderId;
    private String senderUserName;
    private String senderFullName;
    private String senderAvatar;

    private NotificationType type;
    private String title;
    private String message;
    private String referenceId;
    private boolean read;
    private LocalDateTime createdAt;
}