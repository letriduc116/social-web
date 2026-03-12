package com.triduc.social.dto.request.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTPRequest {
    private String email;
}
