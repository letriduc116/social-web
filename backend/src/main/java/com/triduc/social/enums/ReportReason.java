package com.triduc.social.enums;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum ReportReason {
    SPAM("spam", "Spam, lừa đảo hoặc gian lận"),
    HARASSMENT("harassment", "Quấy rối, thù ghét hoặc gây phiền toái"),
    VIOLENCE_OR_INAPPROPRIATE("violence", "Bạo lực hoặc nội dung không phù hợp"),
    INTELLECTUAL_PROPERTY("intellectual_property", "Quyền sở hữu trí tuệ"),
    FAKE_PROFILE("fake_profile", "Trang cá nhân giả"),
    MISLEADING_OR_SCAM("misleading", "Thông tin sai sự thật, lừa đảo hoặc gian lận"),
    ABUSE_OR_HARASSMENT("abuse", "Bắt nạt, quấy rối hoặc lạm dụng"),
    OTHER("other", "Vấn đề khác");

    private final String code;
    private final String label;

    ReportReason(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    public static ReportReason fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn lý do báo cáo");
        }

        String normalized = normalize(value);
        for (ReportReason reason : values()) {
            if (normalize(reason.name()).equals(normalized)
                    || normalize(reason.code).equals(normalized)
                    || normalize(reason.label).equals(normalized)) {
                return reason;
            }
        }

        // Một số alias thường gặp từ FE hoặc text tiếng Việt trong modal.
        if (normalized.contains("spam") || normalized.contains("luadao") || normalized.contains("gianlan")) {
            return SPAM;
        }
        if (normalized.contains("quayroi") || normalized.contains("thughet") || normalized.contains("phientoai")) {
            return HARASSMENT;
        }
        if (normalized.contains("baoluc") || normalized.contains("khongphuhop")) {
            return VIOLENCE_OR_INAPPROPRIATE;
        }
        if (normalized.contains("banquyen") || normalized.contains("sohuutritue") || normalized.contains("intellectualproperty")) {
            return INTELLECTUAL_PROPERTY;
        }
        if (normalized.contains("giamao") || normalized.contains("fake")) {
            return FAKE_PROFILE;
        }
        if (normalized.contains("saisuthat") || normalized.contains("misleading")) {
            return MISLEADING_OR_SCAM;
        }
        if (normalized.contains("batnat") || normalized.contains("lamdung") || normalized.contains("abuse")) {
            return ABUSE_OR_HARASSMENT;
        }
        if (normalized.contains("other") || normalized.contains("khac")) {
            return OTHER;
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lý do báo cáo không hợp lệ");
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim()
                .toLowerCase()
                .replace("đ", "d")
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[^a-z0-9]", "");
    }
}
