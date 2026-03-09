package com.triduc.social.repository.comment;

import com.triduc.social.entity.CommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, String> {
    
    @Query("SELECT cl FROM CommentLike cl WHERE cl.comment.id = :commentId AND cl.user.id = :userId")
    Optional<CommentLike> findByCommentIdAndUserId(@Param("commentId") String commentId, @Param("userId") String userId);
    
    @Query("SELECT COUNT(cl) FROM CommentLike cl WHERE cl.comment.id = :commentId")
    Long countLikesByCommentId(@Param("commentId") String commentId);
    
    @Query("SELECT CASE WHEN COUNT(cl) > 0 THEN true ELSE false END FROM CommentLike cl WHERE cl.comment.id = :commentId AND cl.user.id = :userId")
    boolean existsByCommentIdAndUserId(@Param("commentId") String commentId, @Param("userId") String userId);
}