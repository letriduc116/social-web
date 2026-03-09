package com.triduc.social.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedPostRequest {
    private String postId;
    private String userId;
}
