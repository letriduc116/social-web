package com.triduc.social.dto.request.story;

import com.triduc.social.entity.Story;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryRequest {
    private String mediaUrl; // URL từ Cloudinary sau khi upload
    private Story.MediaType mediaType; // IMAGE hoặc VIDEO
    private String userId; // User tạo story
}

