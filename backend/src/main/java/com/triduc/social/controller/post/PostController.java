package com.triduc.social.controller.post;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.post.SharePostRequest;
import com.triduc.social.dto.request.post.UpdatePostRequest;
import com.triduc.social.dto.request.post.UpPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.service.post.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/post")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostResponse>>> getAllPost(@RequestParam("id") String currentUserId) {
        List<PostResponse> postResponse = postService.getAllPosts(currentUserId);
        if (postResponse == null || postResponse.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Chưa có post nào"));
        }
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Danh sách gồm " + postResponse.size() + " bài post", postResponse));
    }

    @GetMapping("/minePost")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyPosts(@RequestParam("id") String currentUserId) {
        List<PostResponse> myPosts = postService.getPostsByUser(currentUserId, currentUserId);
        if (myPosts == null || myPosts.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Bạn chưa đăng bài nào"));
        }
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Danh sách gồm " + myPosts.size() + " bài viết của bạn", myPosts));
    }

    /**
     * Lấy bài viết trên profile của một user theo góc nhìn của viewer.
     * Ví dụ: /api/v1/post/user?userId=PROFILE_ID&viewerId=CURRENT_USER_ID
     */
    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPostsByUser(
            @RequestParam("userId") String userId,
            @RequestParam("viewerId") String viewerId) {
        List<PostResponse> posts = postService.getPostsByUser(userId, viewerId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Danh sách gồm " + posts.size() + " bài viết", posts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> upPost(@RequestBody UpPostRequest request) {
        Post post = postService.insertPost(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Post successfully", post.getId()));
    }

    /**
     * Chia sẻ bài viết của người khác về trang cá nhân.
     */
    @PostMapping("/share")
    public ResponseEntity<ApiResponse<PostResponse>> sharePost(@RequestBody SharePostRequest request) {
        PostResponse sharedPost = postService.sharePost(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Chia sẻ bài viết thành công", sharedPost));
    }


    /**
     * Chỉnh sửa bài viết của chính mình.
     * Áp dụng được cho cả bài đăng thường và bài share về trang cá nhân.
     * - Bài đăng thường: sửa content và visibility.
     * - Bài share: sửa caption share và visibility, không sửa nội dung bài gốc.
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @RequestParam("postId") String postId,
            @RequestBody UpdatePostRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Không tìm thấy thông tin xác thực"));
        }

        PostResponse updatedPost = postService.updatePost(postId, request, jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Cập nhật bài viết thành công", updatedPost));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> deletePost(@RequestParam("postId") String postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Delete post id =" + postId + " success", null));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<List<PostProfileResponse>>> getSavedPosts(@RequestParam("userId") String userId) {
        List<PostProfileResponse> savedPosts = postService.getSavedPosts(userId);
        return ResponseEntity.ok(ApiResponse.success(
                HttpStatus.OK.value(),
                "Lấy danh sách bài viết đã lưu thành công",
                savedPosts
        ));
    }
}
