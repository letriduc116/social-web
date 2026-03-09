package com.triduc.social.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "saved_post_detail")
public class SavedPostDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "saved_post_id")
    private SavedPost savedPost;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    @Column(updatable = false, name = "create_at")
    private LocalDateTime createAt;

    @PrePersist
    public void onCreate() {
        this.createAt = LocalDateTime.now();
    }
}