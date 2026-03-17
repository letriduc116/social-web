package com.triduc.social.dto.request.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTPVerifyRequest {
    private String email;
    private String otp;
}
