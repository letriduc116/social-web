package com.triduc.social.repository.comment;

import com.triduc.social.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    @Query("SELECT c FROM Comment c WHERE c.post.id = :id AND c.parentComment IS NULL order by c.createAt ASC")
    List<Comment> findParentCommentsByPostId(@Param("id") String postId);

    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId ORDER BY c.createAt ASC")
    List<Comment> findRepliesByParentId(@Param("parentId") String parentId);

    @Query("""
            SELECT c FROM Comment c
            WHERE (:postId IS NULL OR :postId = '' OR c.post.id = :postId)
              AND (:keyword IS NULL OR :keyword = ''
                OR LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.sender.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.sender.userName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(c.sender.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            """)
    Page<Comment> searchForAdmin(
            @Param("postId") String postId,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}