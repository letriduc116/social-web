package com.triduc.social.dto.request.post;

import com.triduc.social.enums.PostVisibility;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpPostRequest {
    private String content;
    private List<String> postImages;
    private String user_Id;

    /**
     * EVERYONE  = Mọi người
     * FRIENDS   = Bạn bè
     * ONLY_ME   = Chỉ mình tôi
     */
    private PostVisibility visibility;
}
