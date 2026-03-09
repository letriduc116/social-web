package com.triduc.social.dto.response.user;



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
public class AuthResponse {
    private String id ;
    private String email;
    private String userName;
    private String fullName;
    private String role;
    private String accessToken;
}