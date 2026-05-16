package com.triduc.social.controller.friend;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.response.friend.FriendRequestResponse;
import com.triduc.social.dto.response.friend.FriendshipStatusResponse;
import com.triduc.social.service.friend.FriendRequestService;
import com.triduc.social.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;
    private final UserService userService;

    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendRequest(
            @RequestParam String receiverId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendRequestResponse response = friendRequestService.sendRequest(currentUserId, receiverId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã gửi lời mời kết bạn", response)
        );
    }

    @PatchMapping("/requests/{requestId}/accept")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> acceptRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendRequestResponse response = friendRequestService.acceptRequest(currentUserId, requestId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã chấp nhận lời mời kết bạn", response)
        );
    }

    @PatchMapping("/requests/{requestId}/decline")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> declineRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendRequestResponse response = friendRequestService.declineRequest(currentUserId, requestId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã từ chối lời mời kết bạn", response)
        );
    }

    @PatchMapping("/requests/{requestId}/cancel")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> cancelRequest(
            @PathVariable String requestId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendRequestResponse response = friendRequestService.cancelRequest(currentUserId, requestId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã hủy lời mời kết bạn", response)
        );
    }

    @GetMapping("/requests/received")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getReceivedPendingRequests(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        List<FriendRequestResponse> response = friendRequestService.getReceivedPendingRequests(currentUserId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), null, response)
        );
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<FriendshipStatusResponse>> getFriendshipStatus(
            @RequestParam String targetUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendshipStatusResponse response = friendRequestService.getFriendshipStatus(currentUserId, targetUserId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), null, response)
        );
    }

    @DeleteMapping("/{targetUserId}")
    public ResponseEntity<ApiResponse<FriendshipStatusResponse>> unfriend(
            @PathVariable String targetUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendshipStatusResponse response = friendRequestService.unfriend(currentUserId, targetUserId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã hủy kết bạn", response)
        );
    }

    @DeleteMapping("/{targetUserId}/follow")
    public ResponseEntity<ApiResponse<FriendshipStatusResponse>> unfollowFriend(
            @PathVariable String targetUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendshipStatusResponse response = friendRequestService.unfollowFriend(currentUserId, targetUserId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã bỏ theo dõi", response)
        );
    }

    @PostMapping("/{targetUserId}/follow")
    public ResponseEntity<ApiResponse<FriendshipStatusResponse>> followFriendAgain(
            @PathVariable String targetUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);
        FriendshipStatusResponse response = friendRequestService.followFriendAgain(currentUserId, targetUserId);

        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK.value(), "Đã theo dõi lại", response)
        );
    }

    private String getCurrentUserId(Jwt jwt) {
        return userService.getIdByEmail(jwt.getSubject());
    }
}