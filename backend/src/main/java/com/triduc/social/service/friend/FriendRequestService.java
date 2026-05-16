package com.triduc.social.service.friend;

import com.triduc.social.dto.response.friend.FriendRequestResponse;
import com.triduc.social.dto.response.friend.FriendshipStatusResponse;
import com.triduc.social.entity.FriendRequest;
import com.triduc.social.entity.User;
import com.triduc.social.enums.FriendRequestStatus;
import com.triduc.social.enums.FriendshipStatus;
import com.triduc.social.enums.NotificationType;
import com.triduc.social.repository.follow.FollowRepository;
import com.triduc.social.repository.friend.FriendRequestRepository;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.notification.NotificationService;
import com.triduc.social.service.user.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public FriendRequestResponse sendRequest(String currentUserId, String receiverId) {
        if (currentUserId.equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự kết bạn với chính mình");
        }

        if (isFriend(currentUserId, receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hai người đã là bạn bè");
        }

        boolean alreadySent = friendRequestRepository.existsByRequester_IdAndReceiver_IdAndStatus(
                currentUserId,
                receiverId,
                FriendRequestStatus.PENDING
        );

        if (alreadySent) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn đã gửi lời mời kết bạn trước đó");
        }

        boolean receiverAlreadySent = friendRequestRepository.existsByRequester_IdAndReceiver_IdAndStatus(
                receiverId,
                currentUserId,
                FriendRequestStatus.PENDING
        );

        if (receiverAlreadySent) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Người này đã gửi lời mời cho bạn, hãy chấp nhận lời mời");
        }

        User requester = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người gửi"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người nhận"));

        FriendRequest friendRequest = FriendRequest.builder()
                .requester(requester)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        FriendRequest saved = friendRequestRepository.save(friendRequest);

        notificationService.deleteOldFriendRequestNotifications(receiverId, currentUserId);

        String senderName = requester.getFullName() != null && !requester.getFullName().isBlank()
                ? requester.getFullName()
                : requester.getUserName();

        notificationService.createAndPush(
                receiverId,
                currentUserId,
                NotificationType.FRIEND_REQUEST,
                senderName + " đã gửi lời mời kết bạn",
                "Nhấn để xem hoặc phản hồi lời mời kết bạn.",
                saved.getId()
        );

        return toResponse(saved);
    }

    @Transactional
    public FriendRequestResponse acceptRequest(String currentUserId, String requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời kết bạn"));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền chấp nhận lời mời này");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời mời này không còn ở trạng thái chờ");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        FriendRequest saved = friendRequestRepository.save(request);

        notificationService.deleteFriendRequestNotification(saved.getId());

        String requesterId = request.getRequester().getId();
        String receiverId = request.getReceiver().getId();

        userService.follow(requesterId, receiverId);
        userService.follow(receiverId, requesterId);

        String receiverName = request.getReceiver().getFullName() != null && !request.getReceiver().getFullName().isBlank()
                ? request.getReceiver().getFullName()
                : request.getReceiver().getUserName();

        notificationService.createAndPush(
                requesterId,
                receiverId,
                NotificationType.FRIEND_ACCEPTED,
                receiverName + " đã chấp nhận lời mời kết bạn",
                "Hai bạn hiện đã là bạn bè.",
                saved.getId()
        );

        return toResponse(saved);
    }

    @Transactional
    public FriendRequestResponse declineRequest(String currentUserId, String requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời kết bạn"));

        if (!request.getReceiver().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền từ chối lời mời này");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời mời này không còn ở trạng thái chờ");
        }

        request.setStatus(FriendRequestStatus.DECLINED);
        FriendRequest saved = friendRequestRepository.save(request);

        notificationService.deleteFriendRequestNotification(saved.getId());

        return toResponse(saved);
    }

    @Transactional
    public FriendRequestResponse cancelRequest(String currentUserId, String requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lời mời kết bạn"));

        if (!request.getRequester().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy lời mời này");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lời mời này không còn ở trạng thái chờ");
        }

        request.setStatus(FriendRequestStatus.CANCELLED);
        FriendRequest saved = friendRequestRepository.save(request);

        notificationService.deleteFriendRequestNotification(saved.getId());

        return toResponse(saved);
    }

    public List<FriendRequestResponse> getReceivedPendingRequests(String currentUserId) {
        return friendRequestRepository
                .findByReceiver_IdAndStatusOrderByCreatedAtDesc(currentUserId, FriendRequestStatus.PENDING)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FriendshipStatusResponse getFriendshipStatus(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            return FriendshipStatusResponse.builder()
                    .targetUserId(targetUserId)
                    .status(FriendshipStatus.SELF)
                    .following(false)
                    .build();
        }

        boolean following = followRepository.countByUserIdAndFollowerId(targetUserId, currentUserId) > 0;

        Optional<FriendRequest> accepted = getAcceptedFriendRequest(currentUserId, targetUserId);

        if (accepted.isPresent()) {
            return FriendshipStatusResponse.builder()
                    .targetUserId(targetUserId)
                    .status(FriendshipStatus.FRIEND)
                    .requestId(accepted.get().getId())
                    .following(following)
                    .build();
        }

        Optional<FriendRequest> sent = friendRequestRepository
                .findFirstByRequester_IdAndReceiver_IdAndStatusOrderByCreatedAtDesc(
                        currentUserId,
                        targetUserId,
                        FriendRequestStatus.PENDING
                );

        if (sent.isPresent()) {
            return FriendshipStatusResponse.builder()
                    .targetUserId(targetUserId)
                    .status(FriendshipStatus.PENDING_SENT)
                    .requestId(sent.get().getId())
                    .following(following)
                    .build();
        }

        Optional<FriendRequest> received = friendRequestRepository
                .findFirstByRequester_IdAndReceiver_IdAndStatusOrderByCreatedAtDesc(
                        targetUserId,
                        currentUserId,
                        FriendRequestStatus.PENDING
                );

        if (received.isPresent()) {
            return FriendshipStatusResponse.builder()
                    .targetUserId(targetUserId)
                    .status(FriendshipStatus.PENDING_RECEIVED)
                    .requestId(received.get().getId())
                    .following(following)
                    .build();
        }

        return FriendshipStatusResponse.builder()
                .targetUserId(targetUserId)
                .status(FriendshipStatus.NONE)
                .following(following)
                .build();
    }

    @Transactional
    public FriendshipStatusResponse unfriend(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể hủy kết bạn với chính mình");
        }

        userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hiện tại"));

        userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng cần hủy kết bạn"));

        FriendRequest friendship = getAcceptedFriendRequest(currentUserId, targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hai người chưa phải là bạn bè"));

        friendship.setStatus(FriendRequestStatus.UNFRIENDED);
        friendRequestRepository.save(friendship);

        // Hủy kết bạn: xóa follow 2 chiều
        userService.unfollow(currentUserId, targetUserId);
        userService.unfollow(targetUserId, currentUserId);

        return FriendshipStatusResponse.builder()
                .targetUserId(targetUserId)
                .status(FriendshipStatus.NONE)
                .requestId(null)
                .following(false)
                .build();
    }

    @Transactional
    public FriendshipStatusResponse unfollowFriend(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể bỏ theo dõi chính mình");
        }

        userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hiện tại"));

        userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng cần bỏ theo dõi"));

        if (!isFriend(currentUserId, targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể bỏ theo dõi người đang là bạn bè");
        }

        // Bỏ theo dõi: chỉ xóa chiều currentUser đang follow targetUser
        userService.unfollow(currentUserId, targetUserId);

        return FriendshipStatusResponse.builder()
                .targetUserId(targetUserId)
                .status(FriendshipStatus.FRIEND)
                .requestId(null)
                .following(false)
                .build();
    }

    @Transactional
    public FriendshipStatusResponse followFriendAgain(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể theo dõi chính mình");
        }

        userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hiện tại"));

        userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng cần theo dõi"));

        if (!isFriend(currentUserId, targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ có thể theo dõi lại người đang là bạn bè");
        }

        // Theo dõi lại: tạo lại chiều currentUser follow targetUser
        userService.follow(currentUserId, targetUserId);

        return FriendshipStatusResponse.builder()
                .targetUserId(targetUserId)
                .status(FriendshipStatus.FRIEND)
                .requestId(null)
                .following(true)
                .build();
    }

    private boolean isFriend(String userAId, String userBId) {
        return getAcceptedFriendRequest(userAId, userBId).isPresent();
    }

    private Optional<FriendRequest> getAcceptedFriendRequest(String userAId, String userBId) {
        return friendRequestRepository
                .findBetweenUsersByStatus(userAId, userBId, FriendRequestStatus.ACCEPTED)
                .stream()
                .findFirst();
    }

    private FriendRequestResponse toResponse(FriendRequest request) {
        User requester = request.getRequester();
        User receiver = request.getReceiver();

        return FriendRequestResponse.builder()
                .id(request.getId())
                .requesterId(requester.getId())
                .requesterUserName(requester.getUserName())
                .requesterFullName(requester.getFullName())
                .requesterAvatar(requester.getProfileImage())
                .receiverId(receiver.getId())
                .receiverUserName(receiver.getUserName())
                .receiverFullName(receiver.getFullName())
                .receiverAvatar(receiver.getProfileImage())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .build();
    }
}