package com.triduc.social.dto.response.user;

import com.triduc.social.entity.PostImages;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostProfileResponse {
        private String id;
        private String content;
        private LocalDateTime createdAt;
        private int likeCount;
        private int commentCount;
        private List<PostImages> imageUrls;
        private String userId;
        private String userName;
        private String avatarUrl;
}
