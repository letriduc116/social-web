package com.triduc.social.dto.request.post;

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
