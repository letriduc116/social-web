package com.triduc.social.entity;

import com.triduc.social.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User  {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userName;
    private String fullName;

    @Column(nullable = false, unique = true)
    @Email
    private String email;

    private String password;
    private String profileImage;

    /** Ảnh bìa trang cá nhân */
    @Column(name = "cover_image")
    private String coverImage;

    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * true = tài khoản bị khoá do vi phạm / bị xử lý bởi admin/manager.
     * Khi locked = true, user không đăng nhập được và token hiện tại cũng bị chặn bởi LockedUserFilter.
     */
    @Column(nullable = false)
    private boolean locked = false;

    //Thêm mặc định USER (để user cũ không bị null)
    @PrePersist
    public void prePersist() {
        if (role == null) role = Role.USER;
    }
}
