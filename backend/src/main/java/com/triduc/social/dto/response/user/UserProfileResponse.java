package com.triduc.social.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String userId;
    private String userName;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private boolean isFollowing;
    private boolean isMe;
    private long followersCount;
    private long followingCount;
    private long postCount;
    private List<UserResponse> followers;
    private List<UserResponse> followings;
    private List<PostProfileResponse> posts;
}
