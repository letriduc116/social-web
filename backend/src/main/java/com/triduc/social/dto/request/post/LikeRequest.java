package com.triduc.social.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeRequest {
    private String post_Id;
    private String user_Id;
}
