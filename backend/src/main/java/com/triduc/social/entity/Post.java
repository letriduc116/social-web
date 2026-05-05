package com.triduc.social.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.triduc.social.enums.PostVisibility;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column
    private String content;

    @Column
    private LocalDateTime createAt;

    /**
     * Quyền xem bài viết:
     * EVERYONE  = Mọi người
     * FRIENDS   = Bạn bè
     * ONLY_ME   = Chỉ mình tôi
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostVisibility visibility = PostVisibility.EVERYONE;

    /**
     * Nếu bài này là bài share thì sharedPost trỏ về bài viết gốc.
     * Nếu là bài đăng bình thường thì sharedPost = null.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_post_id")
    @JsonIgnoreProperties({"sharedPost", "likes", "comments"})
    private Post sharedPost;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImages> postImages = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"post", "sender", "replies", "parentComment"})
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"post", "user"})
    private List<Like> likes = new ArrayList<>();

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Transient
    public int countLikes() {
        return this.likes == null ? 0 : this.likes.size();
    }

    @Transient
    public int countComment() {
        return this.comments == null ? 0 : this.comments.size();
    }

    @Transient
    public boolean isShared() {
        return this.sharedPost != null;
    }

    @PrePersist
    public void onCreate() {
        if (this.createAt == null) {
            this.createAt = LocalDateTime.now();
        }
        if (this.visibility == null) {
            this.visibility = PostVisibility.EVERYONE;
        }
        if (this.postImages == null) {
            this.postImages = new ArrayList<>();
        }
        if (this.comments == null) {
            this.comments = new ArrayList<>();
        }
        if (this.likes == null) {
            this.likes = new ArrayList<>();
        }
    }
}
