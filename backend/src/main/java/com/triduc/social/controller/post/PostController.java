package com.triduc.social.controller.post;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.UpPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.service.post.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
        if (postResponse == null) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Chưa có post nào"));
        }
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Danh sách gồm " + postResponse.size() + " bài post", postResponse));
    }

    @GetMapping("/minePost")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getMyPosts(@RequestParam("id") String currentUserId) {
        List<PostResponse> myPosts = postService.getPostsByUser(currentUserId);
        if (myPosts == null || myPosts.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Bạn chưa đăng bài nào"));
        }
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                "Danh sách gồm " + myPosts.size() + " bài viết của bạn", myPosts));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> upPost(@RequestBody UpPostRequest request) {
        Post post = postService.insertPost(request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Post successfully", post.getId()));
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
