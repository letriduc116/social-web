package com.triduc.social.dto.response.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCommentResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;
    private boolean hidden;

    private String senderId;
    private String senderName;
    private String senderEmail;
    private String senderAvatar;

    private String postId;
    private String postContent;

    private String parentCommentId;
    private String parentCommentContent;

    private long likesCount;
    private int repliesCount;
}
