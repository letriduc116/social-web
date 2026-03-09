package com.triduc.social.dto.response.story;

import com.triduc.social.dto.response.user.UserResponse;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryViewResponse {
    private String id;
    private UserResponse viewer;
    private LocalDateTime viewedAt;
}

