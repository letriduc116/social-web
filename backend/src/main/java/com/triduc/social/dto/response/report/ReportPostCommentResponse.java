package com.triduc.social.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportPostCommentResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;
    private boolean hidden;

    private String senderId;
    private String senderName;
    private String senderEmail;
    private String senderAvatar;
    private boolean senderLocked;

    private String parentCommentId;
    private int depth;
    private long likesCount;
    private int repliesCount;
}
