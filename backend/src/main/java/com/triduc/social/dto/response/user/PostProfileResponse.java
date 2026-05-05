package com.triduc.social.dto.response.user;

import com.triduc.social.entity.PostImages;
import com.triduc.social.enums.PostVisibility;
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

        /** Quyền xem của bài viết/share */
        private PostVisibility visibility;

        /** true nếu đây là bài chia sẻ */
        private boolean shared;

        /** Bài viết gốc được nhúng bên trong bài share */
        private PostProfileResponse sharedPost;
}
