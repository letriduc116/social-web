package com.triduc.social.controller.story;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.StoryRequest;
import com.triduc.social.dto.response.story.StoryResponse;
import com.triduc.social.dto.response.story.StoryViewResponse;
import com.triduc.social.service.story.StoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stories")
@RequiredArgsConstructor
public class StoryController {
    private final StoryService storyService;
    private final com.triduc.social.service.user.UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<StoryResponse>> createStory(
            @RequestBody StoryRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Không tìm thấy thông tin xác thực"));
            }
            
            String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
            if (!request.getUserId().equals(authenticatedUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể tạo story cho chính mình"));
            }

            StoryResponse storyResponse = storyService.createStory(request);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.CREATED.value(), "Tạo story thành công", storyResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi tạo story: " + e.getMessage()));
        }
    }

    @GetMapping("/my-stories")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getMyStories(
            @RequestParam("userId") String userId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt != null) {
                String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
                if (!userId.equals(authenticatedUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể xem story của chính mình"));
                }
            }

            List<StoryResponse> stories = storyService.getMyStories(userId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                    "Lấy danh sách story của bạn thành công", stories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi lấy stories: " + e.getMessage()));
        }
    }

    @GetMapping("/following")
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getStoriesFromFollowing(
            @RequestParam("userId") String currentUserId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt != null) {
                String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
                if (!currentUserId.equals(authenticatedUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Unauthorized"));
                }
            }

            List<StoryResponse> stories = storyService.getStoriesFromFollowing(currentUserId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                    "Lấy danh sách story từ người đang follow thành công", stories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi lấy stories: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StoryResponse>>> getAllActiveStories(
            @RequestParam("userId") String currentUserId) {
        try {
            List<StoryResponse> stories = storyService.getAllActiveStories(currentUserId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                    "Lấy danh sách tất cả stories thành công", stories));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi lấy stories: " + e.getMessage()));
        }
    }

    @PostMapping("/{storyId}/view")
    public ResponseEntity<ApiResponse<Void>> viewStory(
            @PathVariable String storyId,
            @RequestParam("viewerId") String viewerId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt != null) {
                String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
                if (!viewerId.equals(authenticatedUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Unauthorized"));
                }
            }

            storyService.viewStory(storyId, viewerId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Đã xem story", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi xem story: " + e.getMessage()));
        }
    }

    @GetMapping("/{storyId}/views")
    public ResponseEntity<ApiResponse<List<StoryViewResponse>>> getStoryViews(@PathVariable String storyId) {
        try {
            List<StoryViewResponse> views = storyService.getStoryViews(storyId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(),
                    "Lấy danh sách người xem story thành công", views));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi lấy danh sách views: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{storyId}")
    public ResponseEntity<ApiResponse<Void>> deleteStory(
            @PathVariable String storyId,
            @RequestParam("userId") String userId,
            @AuthenticationPrincipal Jwt jwt) {
        try {
            if (jwt == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Không tìm thấy thông tin xác thực"));
            }

            String authenticatedUserId = userService.getIdByEmail(jwt.getSubject());
            if (!userId.equals(authenticatedUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), "Bạn chỉ có thể xóa story của chính mình"));
            }

            storyService.deleteStory(storyId, userId);
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Xóa story thành công", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(HttpStatus.FORBIDDEN.value(), e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi khi xóa story: " + e.getMessage()));
        }
    }
}

