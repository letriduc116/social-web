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

    /**
     * Dùng cho user thường: chỉ lấy bài chưa bị ẩn.
     */
    List<Post> findByUser_IdAndHiddenFalse(String userId);

    /**
     * Dùng cho user thường: chỉ lấy bài chưa bị ẩn.
     */
    List<Post> findByUser_IdAndHiddenFalse(String userId, Sort sort);

    /**
     * Dùng cho feed user thường: chỉ lấy bài của người khác và chưa bị ẩn.
     */
    List<Post> findByUser_IdNotAndHiddenFalse(String userId, Sort sort);

    /**
     * Dùng khi xóa bài gốc: vẫn cần lấy cả bài share kể cả đang ẩn.
     */
    List<Post> findBySharedPost_Id(String sharedPostId);

    long countBySharedPost_Id(String sharedPostId);

    /**
     * Dùng cho admin/manager: xem cả bài đã ẩn.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(COALESCE(p.content, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.user.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.user.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(p.user.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            """)
    Page<Post> searchForAdmin(@Param("keyword") String keyword, Pageable pageable);
}