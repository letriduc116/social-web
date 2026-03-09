package com.triduc.social.mapper;

import com.triduc.social.dto.response.story.StoryResponse;
import com.triduc.social.dto.response.story.StoryViewResponse;
import com.triduc.social.entity.Story;
import com.triduc.social.entity.StoryView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoryMapper {
    private final UserMapper userMapper;

    public StoryResponse toStoryResponse(Story story, long viewCount, boolean viewed) {
        return StoryResponse.builder()
                .id(story.getId())
                .mediaUrl(story.getMediaUrl())
                .mediaType(story.getMediaType())
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .viewCount(viewCount)
                .viewed(viewed)
                .user(userMapper.toUserResponse(story.getUser()))
                .build();
    }

    public StoryViewResponse toStoryViewResponse(StoryView storyView) {
        return StoryViewResponse.builder()
                .id(storyView.getId())
                .viewer(userMapper.toUserResponse(storyView.getViewer()))
                .viewedAt(storyView.getViewedAt())
                .build();
    }
}

