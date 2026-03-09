package com.triduc.social.repository.post;

import com.triduc.social.entity.Post;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, String> {
    List<Post> findByUser_Id(String userId);
    List<Post> findByUser_IdNot(String userId, Sort sort);

}
