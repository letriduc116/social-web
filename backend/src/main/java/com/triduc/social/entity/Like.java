package com.triduc.social.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "post_like", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "post_id"})
})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "email"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    @JsonIgnoreProperties("likes")
    private Post post;

    @Column(name = "create_at")
    private LocalDateTime createAt;

    @PrePersist
    public void onCreate() {
        this.createAt = LocalDateTime.now();
    }
}