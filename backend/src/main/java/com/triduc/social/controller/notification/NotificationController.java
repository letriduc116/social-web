package com.triduc.social.controller.notification;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.response.notification.NotificationResponse;
import com.triduc.social.service.notification.NotificationService;
import com.triduc.social.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        null,
                        notificationService.getMyNotifications(currentUserId)
                )
        );
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countUnread(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        null,
                        Map.of("count", notificationService.countUnread(currentUserId))
                )
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable String notificationId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String currentUserId = getCurrentUserId(jwt);

        return ResponseEntity.ok(
                ApiResponse.success(
                        HttpStatus.OK.value(),
                        "Đã đánh dấu thông báo là đã đọc",
                        notificationService.markAsRead(currentUserId, notificationId)
                )
        );
    }

    private String getCurrentUserId(Jwt jwt) {
        return userService.getIdByEmail(jwt.getSubject());
    }
}