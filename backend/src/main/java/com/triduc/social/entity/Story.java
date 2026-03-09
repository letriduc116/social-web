package com.triduc.social.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stories")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "email"})
    private User user;

    @Column(nullable = false)
    private String mediaUrl; // URL của ảnh hoặc video từ Cloudinary

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MediaType mediaType; // IMAGE hoặc VIDEO

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt; // Tự động hết hạn sau 24 giờ

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        // Story hết hạn sau 24 giờ
        this.expiresAt = this.createdAt.plusHours(24);
    }

    @Transient
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    public enum MediaType {
        IMAGE, VIDEO
    }
}

