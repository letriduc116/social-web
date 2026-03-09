package com.triduc.social.repository.follow;

import com.triduc.social.entity.Follow;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {

    @Query("SELECT COUNT(f) FROM Follow f WHERE f.user.id = :userId AND f.follower.id = :followerId")
    long countByUserIdAndFollowerId(@Param("userId") String userId, @Param("followerId") String followerId);



    long countByUserId(String userId);
    long countByFollowerId(String followerId);

    List<Follow> findByUserId(String userId);
    List<Follow> findByFollowerId(String userId);

    @Transactional
    @Modifying
    @Query("DELETE FROM Follow f WHERE f.user.id = :userId AND f.follower.id = :followerId")
    void deleteByUserIdAndFollowerId(@Param("userId") String userId, @Param("followerId") String followerId);

    boolean existsByUserIdAndFollowerId(@Param("userId") String userId, @Param("followerId") String followerId);
}