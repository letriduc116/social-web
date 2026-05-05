package com.triduc.social.dto.request.post;

import com.triduc.social.enums.PostVisibility;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePostRequest {
    /** Nội dung mới của bài viết hoặc caption mới của bài share */
    private String content;

    /** Quyền xem mới: EVERYONE / FRIENDS / ONLY_ME */
    private PostVisibility visibility;
}
