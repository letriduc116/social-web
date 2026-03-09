package com.triduc.social.dto.response.story;

import com.triduc.social.dto.response.user.UserResponse;
import com.triduc.social.entity.Story;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryResponse {
    private String id;
    private String mediaUrl;
    private Story.MediaType mediaType;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private long viewCount;
    private boolean viewed; // Đã xem chưa (cho current user)
    private UserResponse user;
}

