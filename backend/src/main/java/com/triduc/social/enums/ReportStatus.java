package com.triduc.social.enums;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ReportStatus {
    PENDING("Chờ xử lý"),
    REVIEWING("Đang xem xét"),
    RESOLVED("Đã xử lý"),
    REJECTED("Từ chối");

    private final String label;

    ReportStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ReportStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim().toUpperCase();
        for (ReportStatus status : values()) {
            if (status.name().equals(normalized)) {
                return status;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Trạng thái báo cáo không hợp lệ");
    }
}
