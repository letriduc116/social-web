package com.triduc.social.dto.response.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;

    private String targetType;

    private String reason;
    private String reasonCode;
    private String reasonLabel;

    private String description;

    private String status;
    private String statusLabel;

    private String adminNote;
    private boolean actionApplied;
    private LocalDateTime actionAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    private String reporterId;
    private String reporterName;
    private String reporterEmail;
    private String reporterAvatar;
    private boolean reporterLocked;

    private String reportedUserId;
    private String reportedUserName;
    private String reportedUserFullName;
    private String reportedUserEmail;
    private String reportedUserAvatar;
    private boolean reportedUserLocked;

    private String postId;
    private String postContent;
    private LocalDateTime postCreatedAt;
    private String postVisibility;
    private boolean postHidden;
    private boolean postShared;
    private int postLikesCount;
    private int postCommentsCount;
    private List<String> postImageUrls;

    private String postAuthorId;
    private String postAuthorName;
    private String postAuthorEmail;
    private String postAuthorAvatar;
    private boolean postAuthorLocked;

    private String commentId;
    private String commentContent;
    private LocalDateTime commentCreatedAt;
    private boolean commentHidden;
    private String commentSenderId;
    private String commentSenderName;
    private String commentSenderEmail;
    private boolean commentSenderLocked;
    private String parentCommentId;

    private List<ReportPostCommentResponse> postComments;
}
