package com.triduc.social.repository.chat;

import com.triduc.social.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, String> {
    boolean existsByConversation_IdAndUser_Id(String conversationId, String userId);
    Optional<ChatParticipant> findByConversation_IdAndUser_Id(String conversationId, String userId);
    List<ChatParticipant> findByConversation_Id(String conversationId);
}
