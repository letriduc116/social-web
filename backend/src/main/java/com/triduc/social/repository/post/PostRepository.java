package com.triduc.social.repository.post;

import com.triduc.social.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByUser_Id(String userId);

    List<Post> findByUser_Id(String userId, Sort sort);

    List<Post> findByUser_IdNot(String userId, Sort sort);

    List<Post> findBySharedPost_Id(String sharedPostId);

    long countBySharedPost_Id(String sharedPostId);

    @Query("""
            SELECT p FROM Post p
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(p.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.user.userName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    Page<Post> searchForAdmin(@Param("keyword") String keyword, Pageable pageable);
}