package com.triduc.social.dto.request.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserReportRequest {
    /** ID tài khoản bị báo cáo. FE có thể gửi reportedUserId, userId hoặc targetUserId. */
    private String reportedUserId;
    private String userId;
    private String targetUserId;

    /** FE cũ/mới có thể gửi reason hoặc reasonId. */
    private String reason;
    private String reasonId;

    private String description;

    public String resolveReportedUserId() {
        if (reportedUserId != null && !reportedUserId.isBlank()) return reportedUserId;
        if (userId != null && !userId.isBlank()) return userId;
        return targetUserId;
    }

    public String resolveReason() {
        if (reason != null && !reason.isBlank()) return reason;
        return reasonId;
    }
}
