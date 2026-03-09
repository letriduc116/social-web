package com.triduc.social.dto.response.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private String id;
    private String email;
    private String userName;
    private String fullName;
    private String role;
}
