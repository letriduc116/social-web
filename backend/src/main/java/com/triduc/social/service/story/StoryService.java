package com.triduc.social.service.story;

import com.triduc.social.dto.request.StoryRequest;
import com.triduc.social.dto.response.story.StoryResponse;
import com.triduc.social.dto.response.story.StoryViewResponse;
import com.triduc.social.entity.Story;
import com.triduc.social.entity.StoryView;
import com.triduc.social.entity.User;
import com.triduc.social.mapper.StoryMapper;
import com.triduc.social.repository.story.StoryRepository;
import com.triduc.social.repository.story.StoryViewRepository;
import com.triduc.social.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final StoryViewRepository storyViewRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;

    @Transactional
    public StoryResponse createStory(StoryRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));

        Story story = new Story();
        story.setUser(user);
        story.setMediaUrl(request.getMediaUrl());
        story.setMediaType(request.getMediaType());

        Story savedStory = storyRepository.save(story);
        return storyMapper.toStoryResponse(savedStory, 0, false);
    }

    public List<StoryResponse> getMyStories(String userId) {
        List<Story> stories = storyRepository.findActiveStoriesByUserId(userId, LocalDateTime.now());
        return stories.stream()
                .map(story -> {
                    long viewCount = storyViewRepository.countByStoryId(story.getId());
                    boolean viewed = storyViewRepository.findByStoryIdAndViewerId(story.getId(), userId).isPresent();
                    return storyMapper.toStoryResponse(story, viewCount, viewed);
                })
                .collect(Collectors.toList());
    }

    public List<StoryResponse> getStoriesFromFollowing(String currentUserId) {
        List<Story> stories = storyRepository.findActiveStoriesFromFollowing(currentUserId, LocalDateTime.now());
        return stories.stream()
                .map(story -> {
                    long viewCount = storyViewRepository.countByStoryId(story.getId());
                    boolean viewed = storyViewRepository.findByStoryIdAndViewerId(story.getId(), currentUserId).isPresent();
                    return storyMapper.toStoryResponse(story, viewCount, viewed);
                })
                .collect(Collectors.toList());
    }

    public List<StoryResponse> getAllActiveStories(String currentUserId) {
        List<Story> stories = storyRepository.findAllActiveStories(LocalDateTime.now());
        return stories.stream()
                .map(story -> {
                    long viewCount = storyViewRepository.countByStoryId(story.getId());
                    boolean viewed = storyViewRepository.findByStoryIdAndViewerId(story.getId(), currentUserId).isPresent();
                    return storyMapper.toStoryResponse(story, viewCount, viewed);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void viewStory(String storyId, String viewerId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with id: " + storyId));

        // Kiểm tra xem đã xem chưa
        if (storyViewRepository.findByStoryIdAndViewerId(storyId, viewerId).isPresent()) {
            return; // Đã xem rồi, không cần lưu lại
        }

        // Không cho phép xem story của chính mình
        if (story.getUser().getId().equals(viewerId)) {
            return;
        }

        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + viewerId));

        StoryView storyView = new StoryView();
        storyView.setStory(story);
        storyView.setViewer(viewer);
        storyViewRepository.save(storyView);
    }

    public List<StoryViewResponse> getStoryViews(String storyId) {
        List<StoryView> views = storyViewRepository.findByStoryId(storyId);
        return views.stream()
                .map(storyMapper::toStoryViewResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteStory(String storyId, String userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with id: " + storyId));

        // Chỉ cho phép xóa story của chính mình
        if (!story.getUser().getId().equals(userId)) {
            throw new IllegalStateException("You can only delete your own stories");
        }

        storyRepository.delete(story);
    }

    // Tự động xóa stories đã hết hạn (chạy mỗi giờ)
    @Scheduled(fixedRate = 3600000) // 1 giờ = 3600000 milliseconds
    @Transactional
    public void deleteExpiredStories() {
        storyRepository.deleteExpiredStories(LocalDateTime.now());
    }
}

