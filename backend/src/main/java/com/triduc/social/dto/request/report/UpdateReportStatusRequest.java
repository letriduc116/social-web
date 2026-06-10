package com.triduc.social.dto.request.report;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateReportStatusRequest {
    private String status;
    private String adminNote;

    /**
     * Khi status = RESOLVED:
     * - null hoặc true: tự áp dụng hành động xử lý theo loại báo cáo.
     * - false: chỉ đổi trạng thái báo cáo, không khóa/ẩn nội dung.
     */
    private Boolean applyAction;
}
