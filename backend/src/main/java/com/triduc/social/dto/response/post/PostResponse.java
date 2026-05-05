package com.triduc.social.dto.response.post;

import com.triduc.social.dto.response.user.UserResponse;
import com.triduc.social.entity.PostImages;
import com.triduc.social.enums.PostVisibility;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;
    private List<PostImages> images;
    private int comments;
    private int likes;
    private boolean liked;
    private boolean savedPost;
    private UserResponse user;

    /** Quyền xem của bài viết/share */
    private PostVisibility visibility;

    /** true nếu đây là bài chia sẻ */
    private boolean shared;

    /** Bài viết gốc được nhúng bên trong bài share */
    private PostResponse sharedPost;
}
