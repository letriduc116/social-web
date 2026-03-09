package com.triduc.social.repository.comment;

import com.triduc.social.entity.Comment;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, String> {
    @Query("SELECT c FROM Comment c WHERE c.post.id = :id AND c.parentComment IS NULL order by c.createAt ASC")
    List<Comment> findParentCommentsByPostId(@Param("id") String postId);

    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentId")
    List<Comment> findRepliesByParentId(@Param("parentId") String parentId);

    Optional<Comment> findById(@Param("id") String id);
}
