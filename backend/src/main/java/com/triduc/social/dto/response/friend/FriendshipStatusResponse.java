package com.triduc.social.dto.response.friend;

import com.triduc.social.enums.FriendshipStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendshipStatusResponse {
    private String targetUserId;
    private FriendshipStatus status;
    private String requestId;

    /**
     * true nếu current user đang follow target user.
     * Dùng cho nút Bỏ theo dõi / Theo dõi lại.
     */
    private boolean following;
}