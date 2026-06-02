package com.triduc.social.repository.chat;

import com.triduc.social.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    Optional<ChatMessage> findTopByConversation_IdAndDeletedFalseOrderByCreatedAtDesc(String conversationId);

    List<ChatMessage> findByConversation_IdAndDeletedFalseOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    @Query("""
        SELECT COUNT(m) FROM ChatMessage m
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :userId
          AND m.deleted = false
          AND (:lastReadAt IS NULL OR m.createdAt > :lastReadAt)
    """)
    long countUnread(
            @Param("conversationId") String conversationId,
            @Param("userId") String userId,
            @Param("lastReadAt") LocalDateTime lastReadAt
    );
}
