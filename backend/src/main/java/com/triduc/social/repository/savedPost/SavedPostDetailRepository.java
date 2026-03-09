package com.triduc.social.repository.savedPost;

import com.triduc.social.entity.Post;
import com.triduc.social.entity.SavedPost;
import com.triduc.social.entity.SavedPostDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedPostDetailRepository extends JpaRepository<SavedPostDetail, String> {
    Optional<SavedPostDetail> findBySavedPostAndPost(SavedPost savedPost , Post post);

    List<SavedPostDetail> findBySavedPost(SavedPost savedPost );

    boolean existsBySavedPost(SavedPost savedPost);

    List<SavedPostDetail> findBySavedPost_User_Id(String userId);
}