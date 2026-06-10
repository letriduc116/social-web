package com.triduc.social.controller.report;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.report.CreateCommentReportRequest;
import com.triduc.social.dto.request.report.CreatePostReportRequest;
import com.triduc.social.dto.request.report.CreateUserReportRequest;
import com.triduc.social.dto.response.report.ReportResponse;
import com.triduc.social.service.report.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<ReportResponse>> reportUser(
            @RequestBody CreateUserReportRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Gửi báo cáo tài khoản thành công",
                reportService.reportUser(request, jwt)
        ));
    }

    @PostMapping("/posts")
    public ResponseEntity<ApiResponse<ReportResponse>> reportPost(
            @RequestBody CreatePostReportRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Gửi báo cáo bài viết thành công",
                reportService.reportPost(request, jwt)
        ));
    }

    @PostMapping("/comments")
    public ResponseEntity<ApiResponse<ReportResponse>> reportComment(
            @RequestBody CreateCommentReportRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                HttpStatus.CREATED.value(),
                "Gửi báo cáo bình luận thành công",
                reportService.reportComment(request, jwt)
        ));
    }
}
