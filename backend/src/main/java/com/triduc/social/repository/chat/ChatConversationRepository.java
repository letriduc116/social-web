package com.triduc.social.repository.chat;

import com.triduc.social.entity.ChatConversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
    Optional<ChatConversation> findByPrivateKey(String privateKey);

    @EntityGraph(attributePaths = {"participants", "participants.user"})
    @Query("""
        SELECT DISTINCT c FROM ChatConversation c
        JOIN c.participants p
        WHERE p.user.id = :userId
        ORDER BY c.updatedAt DESC
    """)
    List<ChatConversation> findAllByParticipantUserId(@Param("userId") String userId);

    @EntityGraph(attributePaths = {"participants", "participants.user"})
    Optional<ChatConversation> findWithParticipantsById(String id);
}
