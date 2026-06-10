package com.triduc.social.dto.request.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentReportRequest {
    /** ID bình luận bị báo cáo. FE có thể gửi commentId hoặc targetCommentId. */
    private String commentId;
    private String targetCommentId;

    /** FE cũ/mới có thể gửi reason hoặc reasonId. */
    private String reason;
    private String reasonId;

    private String description;

    public String resolveCommentId() {
        if (commentId != null && !commentId.isBlank()) return commentId;
        return targetCommentId;
    }

    public String resolveReason() {
        if (reason != null && !reason.isBlank()) return reason;
        return reasonId;
    }
}
