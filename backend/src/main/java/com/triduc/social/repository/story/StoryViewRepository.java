package com.triduc.social.repository.story;

import com.triduc.social.entity.Story;
import com.triduc.social.entity.StoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, String> {
    
    // Kiểm tra xem user đã xem story chưa
    Optional<StoryView> findByStoryIdAndViewerId(String storyId, String viewerId);

    // Lấy danh sách người đã xem story
    @Query("SELECT sv FROM StoryView sv WHERE sv.story.id = :storyId ORDER BY sv.viewedAt DESC")
    List<StoryView> findByStoryId(@Param("storyId") String storyId);

    // Đếm số lượt xem của story
    long countByStoryId(String storyId);

    // Lấy danh sách stories đã xem của user
    @Query("SELECT sv.story FROM StoryView sv WHERE sv.viewer.id = :viewerId ORDER BY sv.viewedAt DESC")
    List<Story> findViewedStoriesByViewerId(@Param("viewerId") String viewerId);
}

