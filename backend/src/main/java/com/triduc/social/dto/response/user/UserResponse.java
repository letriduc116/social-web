package com.triduc.social.dto.response.user;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String userName;
    private String fullName;
    private String email;
    private String profileImage;
    private String bio;
    private LocalDateTime lastSeen;
    private boolean isOnline;

}