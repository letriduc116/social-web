package com.triduc.social.controller.admin;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.report.UpdateReportStatusRequest;
import com.triduc.social.dto.response.report.AdminReportStatsResponse;
import com.triduc.social.dto.response.report.ReportResponse;
import com.triduc.social.enums.ReportTargetType;
import com.triduc.social.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
public class AdminReportController {
    private final ReportService reportService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminReportStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy thống kê báo cáo thành công",
                reportService.getStats()
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getUserReports(
            @RequestParam(required = false, defaultValue = "") String status,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách báo cáo tài khoản thành công",
                reportService.getReports(ReportTargetType.USER, status, keyword, page, size)
        ));
    }

    @GetMapping("/posts")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getPostReports(
            @RequestParam(required = false, defaultValue = "") String status,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách báo cáo bài viết thành công",
                reportService.getReports(ReportTargetType.POST, status, keyword, page, size)
        ));
    }

    @GetMapping("/comments")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getCommentReports(
            @RequestParam(required = false, defaultValue = "") String status,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách báo cáo bình luận thành công",
                reportService.getReports(ReportTargetType.COMMENT, status, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy chi tiết báo cáo thành công",
                reportService.getReportDetail(id)
        ));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ReportResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody UpdateReportStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Cập nhật trạng thái báo cáo thành công",
                reportService.updateStatus(id, request, jwt)
        ));
    }

    /**
     * Duyệt báo cáo là vi phạm và tự áp dụng hành động:
     * USER -> khóa tài khoản, POST -> ẩn bài viết, COMMENT -> ẩn bình luận.
     */
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveAndApplyAction(
            @PathVariable String id,
            @RequestBody(required = false) UpdateReportStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String note = request == null ? "" : request.getAdminNote();
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã phê duyệt vi phạm và áp dụng xử lý",
                reportService.resolveAndApplyAction(id, note, jwt)
        ));
    }

    @PatchMapping("/{id}/lock-user")
    public ResponseEntity<ApiResponse<ReportResponse>> lockReportedUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã khóa tài khoản bị báo cáo",
                reportService.lockReportedUserByReport(id)
        ));
    }

    @PatchMapping("/{id}/unlock-user")
    public ResponseEntity<ApiResponse<ReportResponse>> unlockReportedUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã mở khóa tài khoản bị báo cáo",
                reportService.unlockReportedUserByReport(id)
        ));
    }

    @PatchMapping("/{id}/hide-post")
    public ResponseEntity<ApiResponse<ReportResponse>> hidePost(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã ẩn bài viết bị báo cáo",
                reportService.hidePostByReport(id)
        ));
    }

    @PatchMapping("/{id}/unhide-post")
    public ResponseEntity<ApiResponse<ReportResponse>> unhidePost(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã mở hiển thị bài viết bị báo cáo",
                reportService.unhidePostByReport(id)
        ));
    }

    @PatchMapping("/{id}/hide-comment")
    public ResponseEntity<ApiResponse<ReportResponse>> hideComment(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã ẩn bình luận bị báo cáo",
                reportService.hideCommentByReport(id)
        ));
    }

    @PatchMapping("/{id}/unhide-comment")
    public ResponseEntity<ApiResponse<ReportResponse>> unhideComment(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Đã mở hiển thị bình luận bị báo cáo",
                reportService.unhideCommentByReport(id)
        ));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable String id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Xóa báo cáo thành công",
                null
        ));
    }
}
