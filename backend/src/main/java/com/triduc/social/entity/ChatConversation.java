package com.triduc.social.entity;

import com.triduc.social.enums.ChatConversationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "chat_conversations",
        indexes = {
                @Index(name = "idx_chat_conversation_updated_at", columnList = "updated_at"),
                @Index(name = "idx_chat_conversation_private_key", columnList = "private_key")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_chat_conversation_private_key", columnNames = "private_key")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatConversationType type;

    /**
     * Dùng để chống tạo trùng đoạn chat 1-1.
     * Format: smallerUserId:largerUserId
     */
    @Column(name = "private_key", unique = true)
    private String privateKey;

    private String title;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatParticipant> participants = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
        if (type == null) type = ChatConversationType.PRIVATE;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
