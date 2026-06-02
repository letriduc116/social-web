package com.triduc.social.service.chat;

import com.triduc.social.dto.request.chat.ChatSendMessageRequest;
import com.triduc.social.dto.request.chat.ChatCallSignalRequest;
import com.triduc.social.dto.request.chat.ChatTypingRequest;
import com.triduc.social.dto.response.chat.ChatConversationResponse;
import com.triduc.social.dto.response.chat.ChatMessageResponse;
import com.triduc.social.dto.response.chat.ChatCallSignalResponse;
import com.triduc.social.entity.User;
import com.triduc.social.entity.ChatConversation;
import com.triduc.social.entity.ChatMessage;
import com.triduc.social.entity.ChatParticipant;
import com.triduc.social.enums.ChatConversationType;
import com.triduc.social.enums.ChatMessageType;
import com.triduc.social.repository.chat.ChatConversationRepository;
import com.triduc.social.repository.chat.ChatMessageRepository;
import com.triduc.social.repository.chat.ChatParticipantRepository;
import com.triduc.social.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] AVATAR_COLORS = {
            "#e53935", "#1976d2", "#43a047", "#7b1fa2", "#fb8c00", "#00897b", "#5e35b1"
    };

    @Transactional
    public List<ChatConversationResponse> getMyConversations(String currentUserId) {
        return conversationRepository.findAllByParticipantUserId(currentUserId)
                .stream()
                .map(conversation -> toConversationResponse(conversation, currentUserId, false))
                .toList();
    }

    @Transactional
    public ChatConversationResponse getOrCreatePrivateConversation(String currentUserId, String receiverId) {
        ChatConversation conversation = getOrCreatePrivateConversationEntity(currentUserId, receiverId);
        return toConversationResponse(conversation, currentUserId, true);
    }

    @Transactional
    public List<ChatMessageResponse> getMessages(String currentUserId, String conversationId, int page, int size) {
        ensureParticipant(conversationId, currentUserId);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        List<ChatMessage> descMessages = messageRepository.findByConversation_IdAndDeletedFalseOrderByCreatedAtDesc(
                conversationId,
                PageRequest.of(safePage, safeSize)
        );

        return descMessages.stream()
                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                .map(message -> toMessageResponse(message, currentUserId))
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(String currentUserId, ChatSendMessageRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu tin nhắn không hợp lệ");
        }

        ChatMessageType type = request.getType() == null ? ChatMessageType.TEXT : request.getType();
        String content = request.getContent() == null ? "" : request.getContent().trim();
        String attachmentUrl = request.getAttachmentUrl();

        if (type == ChatMessageType.TEXT && content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung tin nhắn không được trống");
        }
        if (type != ChatMessageType.TEXT && (attachmentUrl == null || attachmentUrl.isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tin nhắn tệp cần có attachmentUrl");
        }

        User sender = getUser(currentUserId);
        ChatConversation conversation;

        if (request.getConversationId() != null && !request.getConversationId().isBlank()) {
            conversation = conversationRepository.findWithParticipantsById(request.getConversationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đoạn chat"));
            ensureParticipant(conversation.getId(), currentUserId);
        } else if (request.getReceiverId() != null && !request.getReceiverId().isBlank()) {
            conversation = getOrCreatePrivateConversationEntity(currentUserId, request.getReceiverId());
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần conversationId hoặc receiverId");
        }

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .type(type)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .build();

        ChatMessage saved = messageRepository.save(message);
        conversation.setUpdatedAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        List<ChatParticipant> participants = participantRepository.findByConversation_Id(conversation.getId());
        for (ChatParticipant participant : participants) {
            String receiverUserId = participant.getUser().getId();
            ChatMessageResponse responseForReceiver = toMessageResponse(saved, receiverUserId);
            messagingTemplate.convertAndSendToUser(receiverUserId, "/queue/messages", responseForReceiver);

            ChatConversationResponse conversationResponse = toConversationResponse(conversation, receiverUserId, false);
            messagingTemplate.convertAndSendToUser(receiverUserId, "/queue/conversations", conversationResponse);
        }

        return toMessageResponse(saved, currentUserId);
    }

    @Transactional
    public void pushCallSignal(String currentUserId, ChatCallSignalRequest request) {
        if (request == null || request.getConversationId() == null || request.getConversationId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "conversationId không hợp lệ");
        }

        if (request.getSignalType() == null || request.getSignalType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "signalType không hợp lệ");
        }

        ensureParticipant(request.getConversationId(), currentUserId);

        User caller = getUser(currentUserId);
        List<ChatParticipant> participants = participantRepository.findByConversation_Id(request.getConversationId());

        ChatCallSignalResponse response = ChatCallSignalResponse.builder()
                .conversationId(request.getConversationId())
                .signalType(request.getSignalType())
                .video(request.isVideo())
                .callerId(caller.getId())
                .callerName(getDisplayName(caller))
                .callerAvatar(caller.getProfileImage())
                .sdp(request.getSdp())
                .candidate(request.getCandidate())
                .build();

        for (ChatParticipant participant : participants) {
            String receiverUserId = participant.getUser().getId();
            if (!receiverUserId.equals(currentUserId)) {
                messagingTemplate.convertAndSendToUser(receiverUserId, "/queue/call", response);
            }
        }
    }

    @Transactional
    public void markConversationAsRead(String currentUserId, String conversationId) {
        ChatParticipant participant = participantRepository.findByConversation_IdAndUser_Id(conversationId, currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không thuộc đoạn chat này"));

        participant.setLastReadAt(LocalDateTime.now());
        participantRepository.save(participant);
    }

    @Transactional
    public void pushTyping(String currentUserId, ChatTypingRequest request) {
        if (request == null || request.getConversationId() == null || request.getConversationId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "conversationId không hợp lệ");
        }

        ensureParticipant(request.getConversationId(), currentUserId);
        List<ChatParticipant> participants = participantRepository.findByConversation_Id(request.getConversationId());

        for (ChatParticipant participant : participants) {
            String receiverUserId = participant.getUser().getId();
            if (!receiverUserId.equals(currentUserId)) {
                messagingTemplate.convertAndSendToUser(receiverUserId, "/queue/typing", request);
            }
        }
    }

    private ChatConversation getOrCreatePrivateConversationEntity(String currentUserId, String receiverId) {
        if (currentUserId.equals(receiverId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự nhắn tin cho chính mình");
        }

        User currentUser = getUser(currentUserId);
        User receiver = getUser(receiverId);
        String privateKey = buildPrivateKey(currentUserId, receiverId);

        return conversationRepository.findByPrivateKey(privateKey)
                .orElseGet(() -> {
                    ChatConversation conversation = ChatConversation.builder()
                            .type(ChatConversationType.PRIVATE)
                            .privateKey(privateKey)
                            .build();

                    ChatConversation savedConversation = conversationRepository.save(conversation);

                    ChatParticipant p1 = ChatParticipant.builder()
                            .conversation(savedConversation)
                            .user(currentUser)
                            .lastReadAt(LocalDateTime.now())
                            .build();
                    ChatParticipant p2 = ChatParticipant.builder()
                            .conversation(savedConversation)
                            .user(receiver)
                            .lastReadAt(null)
                            .build();

                    participantRepository.saveAll(List.of(p1, p2));
                    savedConversation.setParticipants(List.of(p1, p2));
                    return savedConversation;
                });
    }

    private void ensureParticipant(String conversationId, String userId) {
        if (!participantRepository.existsByConversation_IdAndUser_Id(conversationId, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập đoạn chat này");
        }
    }

    private User getUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
    }

    private String buildPrivateKey(String userAId, String userBId) {
        return userAId.compareTo(userBId) < 0 ? userAId + ":" + userBId : userBId + ":" + userAId;
    }

    private ChatConversationResponse toConversationResponse(ChatConversation conversation, String currentUserId, boolean includeMessages) {
        List<ChatParticipant> participants = conversation.getParticipants();
        if (participants == null || participants.isEmpty()) {
            participants = participantRepository.findByConversation_Id(conversation.getId());
        }

        // Java không cho dùng biến đã bị gán lại trong lambda.
        // Tạo biến final để dùng an toàn trong stream/orElseGet.
        final List<ChatParticipant> finalParticipants = participants;

        ChatParticipant currentParticipant = finalParticipants.stream()
                .filter(p -> p.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        User displayUser = finalParticipants.stream()
                .map(ChatParticipant::getUser)
                .filter(user -> !user.getId().equals(currentUserId))
                .findFirst()
                .orElseGet(() -> finalParticipants.isEmpty() ? null : finalParticipants.get(0).getUser());

        ChatMessage lastMessage = messageRepository
                .findTopByConversation_IdAndDeletedFalseOrderByCreatedAtDesc(conversation.getId())
                .orElse(null);

        long unreadCount = currentParticipant == null ? 0 : messageRepository.countUnread(
                conversation.getId(),
                currentUserId,
                currentParticipant.getLastReadAt()
        );

        List<ChatMessageResponse> messages = includeMessages
                ? getMessages(currentUserId, conversation.getId(), 0, 30)
                : List.of();

        String title = conversation.getType() == ChatConversationType.GROUP && conversation.getTitle() != null
                ? conversation.getTitle()
                : getDisplayName(displayUser);

        return ChatConversationResponse.builder()
                .id(conversation.getId())
                .name(title)
                .avatarUrl(displayUser != null ? displayUser.getProfileImage() : null)
                .avatarColor(generateAvatarColor(displayUser != null ? displayUser.getId() : conversation.getId()))
                .status("offline")
                .activeLabel("Hoạt động gần đây")
                .lastMessage(lastMessage != null ? buildLastMessage(lastMessage, currentUserId) : "Chưa có tin nhắn")
                .lastMessageAt(lastMessage != null ? formatRelative(lastMessage.getCreatedAt()) : "")
                .unreadCount(unreadCount)
                .pinned(false)
                .typing(false)
                .updatedAt(conversation.getUpdatedAt())
                .messages(messages)
                .build();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message, String viewerUserId) {
        boolean mine = message.getSender().getId().equals(viewerUserId);

        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(getDisplayName(message.getSender()))
                .senderAvatar(message.getSender().getProfileImage())
                .mine(mine)
                .type(message.getType())
                .text(message.getContent())
                .attachmentUrl(message.getAttachmentUrl())
                .time(message.getCreatedAt().format(TIME_FORMATTER))
                .status(mine ? "sent" : null)
                .createdAt(message.getCreatedAt())
                .build();
    }

    private String getDisplayName(User user) {
        if (user == null) return "Người dùng";
        if (user.getFullName() != null && !user.getFullName().isBlank()) return user.getFullName();
        if (user.getUserName() != null && !user.getUserName().isBlank()) return user.getUserName();
        return user.getEmail();
    }

    private String buildLastMessage(ChatMessage message, String currentUserId) {
        String prefix = message.getSender().getId().equals(currentUserId) ? "Bạn: " : "";
        if (message.getType() == ChatMessageType.IMAGE) return prefix + "Đã gửi một ảnh";
        if (message.getType() == ChatMessageType.FILE) return prefix + "Đã gửi một tệp";
        return prefix + (message.getContent() == null ? "" : message.getContent());
    }

    private String formatRelative(LocalDateTime time) {
        if (time == null) return "";
        Duration duration = Duration.between(time, LocalDateTime.now());
        long minutes = duration.toMinutes();
        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return minutes + " phút";
        long hours = duration.toHours();
        if (hours < 24) return hours + " giờ";
        long days = duration.toDays();
        if (days == 1) return "Hôm qua";
        return days + " ngày";
    }

    private String generateAvatarColor(String seed) {
        int index = Math.abs(seed == null ? 0 : seed.hashCode()) % AVATAR_COLORS.length;
        return AVATAR_COLORS[index];
    }
}
