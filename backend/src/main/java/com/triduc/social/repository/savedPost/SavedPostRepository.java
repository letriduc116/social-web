package com.triduc.social.repository.savedPost;

import com.triduc.social.entity.SavedPost;
import com.triduc.social.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavedPostRepository extends JpaRepository<SavedPost, String> {
    Optional<SavedPost> findByUser(User user );
}
