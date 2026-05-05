package com.triduc.social.dto.request.post;

import com.triduc.social.enums.PostVisibility;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharePostRequest {
    /** Người thực hiện chia sẻ */
    private String userId;

    /** Bài viết gốc được chia sẻ */
    private String originalPostId;

    /** Nội dung/caption khi chia sẻ. Có thể để trống */
    private String content;

    /** Quyền xem của bài share mới */
    private PostVisibility visibility;
}
