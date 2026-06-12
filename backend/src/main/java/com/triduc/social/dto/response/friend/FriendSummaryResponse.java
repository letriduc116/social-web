package com.triduc.social.dto.response.friend;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendSummaryResponse {
    private String id;
    private String userName;
    private String fullName;
    private String profileImage;
    private String avatarUrl;

    /**
     * true nếu current user đang follow người bạn này.
     * Dùng cho nút Bỏ theo dõi / Theo dõi lại ở FE.
     */
    private boolean following;

    /**
     * Tạm để 0. Sau này có thể tính bạn chung.
     */
    private long mutualFriendsCount;
}