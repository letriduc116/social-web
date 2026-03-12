package com.triduc.social.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTPRequest {
    private String email;
}
