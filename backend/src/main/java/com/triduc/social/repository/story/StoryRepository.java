package com.triduc.social.repository.story;

import com.triduc.social.entity.Story;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, String> {
    
    // Lấy tất cả stories của user (chưa hết hạn)
    @Query("SELECT s FROM Story s WHERE s.user.id = :userId AND s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStoriesByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);

    // Lấy stories của những người đang follow (chưa hết hạn)
    @Query("SELECT s FROM Story s WHERE s.user.id IN " +
           "(SELECT f.user.id FROM Follow f WHERE f.follower.id = :currentUserId) " +
           "AND s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findActiveStoriesFromFollowing(@Param("currentUserId") String currentUserId, @Param("now") LocalDateTime now);

    // Lấy tất cả stories active (chưa hết hạn)
    @Query("SELECT s FROM Story s WHERE s.expiresAt > :now ORDER BY s.createdAt DESC")
    List<Story> findAllActiveStories(@Param("now") LocalDateTime now);

    // Xóa stories đã hết hạn
    @Transactional
    @Modifying
    @Query("DELETE FROM Story s WHERE s.expiresAt < :now")
    void deleteExpiredStories(@Param("now") LocalDateTime now);

    // Đếm số stories active của user
    @Query("SELECT COUNT(s) FROM Story s WHERE s.user.id = :userId AND s.expiresAt > :now")
    long countActiveStoriesByUserId(@Param("userId") String userId, @Param("now") LocalDateTime now);
}

