package com.triduc.social.controller.chat;

import com.triduc.social.dto.ApiResponse;
import com.triduc.social.dto.request.chat.ChatSendMessageRequest;
import com.triduc.social.dto.response.chat.ChatConversationResponse;
import com.triduc.social.dto.response.chat.ChatMessageResponse;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.chat.ChatService;
import com.triduc.social.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/conversations")
    public ResponseEntity<ApiResponse<List<ChatConversationResponse>>> getMyConversations() {
        String currentUserId = getCurrentUserId();
        List<ChatConversationResponse> data = chatService.getMyConversations(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Lấy danh sách đoạn chat thành công", data));
    }

    @PostMapping("/conversations/private/{receiverId}")
    public ResponseEntity<ApiResponse<ChatConversationResponse>> openPrivateConversation(@PathVariable String receiverId) {
        String currentUserId = getCurrentUserId();
        ChatConversationResponse data = chatService.getOrCreatePrivateConversation(currentUserId, receiverId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Mở đoạn chat thành công", data));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMessages(
            @PathVariable String conversationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        String currentUserId = getCurrentUserId();
        List<ChatMessageResponse> data = chatService.getMessages(currentUserId, conversationId, page, size);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Lấy tin nhắn thành công", data));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(@RequestBody ChatSendMessageRequest request) {
        String currentUserId = getCurrentUserId();
        ChatMessageResponse data = chatService.sendMessage(currentUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Gửi tin nhắn thành công", data));
    }

    @PatchMapping("/conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable String conversationId) {
        String currentUserId = getCurrentUserId();
        chatService.markConversationAsRead(currentUserId, conversationId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Đã đánh dấu đã đọc", null));
    }

    private String getCurrentUserId() {
        String email = JwtUtil.getCurrentUserEmail();
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng đăng nhập"))
                .getId();
    }
}
