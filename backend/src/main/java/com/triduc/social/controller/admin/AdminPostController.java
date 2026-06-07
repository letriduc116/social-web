package com.triduc.social.controller.admin;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.response.admin.AdminPostResponse;
import com.triduc.social.service.admin.AdminPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/posts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPostController {

    private final AdminPostService adminPostService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminPostResponse>>> getPosts(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        Page<AdminPostResponse> posts = adminPostService.getPosts(keyword, page, size);

        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách bài viết thành công",
                posts
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminPostResponse>> getPostDetail(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy chi tiết bài viết thành công",
                adminPostService.getPostDetail(id)
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable String id) {
        adminPostService.deletePostByAdmin(id);

        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Admin đã xoá bài viết thành công",
                null
        ));
    }
}