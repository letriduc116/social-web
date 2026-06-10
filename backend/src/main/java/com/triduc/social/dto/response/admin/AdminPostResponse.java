package com.triduc.social.dto.response.admin;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminPostResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;

    private String authorId;
    private String authorName;
    private String authorEmail;
    private String authorAvatar;

    private String visibility;
    private boolean hidden;

    private boolean shared;
    private String sharedPostId;
    private String sharedPostContent;

    private int likes;
    private int comments;

    private List<String> imageUrls;
}
