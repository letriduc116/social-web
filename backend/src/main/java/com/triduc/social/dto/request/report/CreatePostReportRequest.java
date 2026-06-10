package com.triduc.social.dto.request.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreatePostReportRequest {
    /** ID bài viết bị báo cáo. FE có thể gửi postId hoặc targetPostId. */
    private String postId;
    private String targetPostId;

    /** FE cũ/mới có thể gửi reason hoặc reasonId. */
    private String reason;
    private String reasonId;

    private String description;

    public String resolvePostId() {
        if (postId != null && !postId.isBlank()) return postId;
        return targetPostId;
    }

    public String resolveReason() {
        if (reason != null && !reason.isBlank()) return reason;
        return reasonId;
    }
}
