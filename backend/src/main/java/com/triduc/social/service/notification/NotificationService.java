package com.triduc.social.service.notification;

import com.triduc.social.dto.response.notification.NotificationResponse;
import com.triduc.social.entity.Notification;
import com.triduc.social.entity.User;
import com.triduc.social.enums.NotificationType;
import com.triduc.social.repository.notification.NotificationRepository;
import com.triduc.social.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationResponse createAndPush(
            String receiverId,
            String senderId,
            NotificationType type,
            String title,
            String message,
            String referenceId
    ) {
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận thông báo"));

        User sender = null;
        if (senderId != null) {
            sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người gửi thông báo"));
        }

        Notification notification = Notification.builder()
                .receiver(receiver)
                .sender(sender)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .readStatus(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        messagingTemplate.convertAndSendToUser(
                receiverId,
                "/queue/notifications",
                response
        );

        return response;
    }

    public List<NotificationResponse> getMyNotifications(String currentUserId) {
        return notificationRepository.findTop30ByReceiver_IdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long countUnread(String currentUserId) {
        return notificationRepository.countByReceiver_IdAndReadStatusFalse(currentUserId);
    }

    @Transactional
    public NotificationResponse markAsRead(String currentUserId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo"));

        if (!notification.getReceiver().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền đọc thông báo này");
        }

        notification.setReadStatus(true);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification notification) {
        User sender = notification.getSender();

        return NotificationResponse.builder()
                .id(notification.getId())
                .receiverId(notification.getReceiver().getId())
                .senderId(sender != null ? sender.getId() : null)
                .senderUserName(sender != null ? sender.getUserName() : null)
                .senderFullName(sender != null ? sender.getFullName() : null)
                .senderAvatar(sender != null ? sender.getProfileImage() : null)
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .referenceId(notification.getReferenceId())
                .read(notification.isReadStatus())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteOldFriendRequestNotifications(String receiverId, String senderId) {
        notificationRepository.deleteByReceiverIdAndSenderIdAndType(
                receiverId,
                senderId,
                NotificationType.FRIEND_REQUEST
        );
    }

    @Transactional
    public void deleteFriendRequestNotification(String requestId) {
        notificationRepository.deleteByTypeAndReferenceId(
                NotificationType.FRIEND_REQUEST,
                requestId
        );
    }
}