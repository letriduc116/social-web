package com.triduc.social.dto.response.friend;

import com.triduc.social.enums.FriendRequestStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestResponse {
    private String id;

    private String requesterId;
    private String requesterUserName;
    private String requesterFullName;
    private String requesterAvatar;

    private String receiverId;
    private String receiverUserName;
    private String receiverFullName;
    private String receiverAvatar;

    private FriendRequestStatus status;
    private LocalDateTime createdAt;
}