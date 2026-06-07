package com.triduc.social.controller.admin;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.response.admin.AdminCommentResponse;
import com.triduc.social.service.admin.AdminCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/comments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCommentController {

    private final AdminCommentService adminCommentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminCommentResponse>>> getComments(
            @RequestParam(required = false, defaultValue = "") String postId,
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        Page<AdminCommentResponse> comments =
                adminCommentService.getComments(postId, keyword, page, size);

        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách bình luận thành công",
                comments
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminCommentResponse>> getCommentDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy chi tiết bình luận thành công",
                adminCommentService.getCommentDetail(id)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable String id) {
        adminCommentService.deleteCommentByAdmin(id);

        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Admin đã xoá bình luận thành công",
                null
        ));
    }
}