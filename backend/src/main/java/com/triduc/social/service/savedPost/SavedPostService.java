package com.triduc.social.service.savedPost;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.SavedPost;
import com.triduc.social.entity.SavedPostDetail;
import com.triduc.social.entity.User;
import com.triduc.social.mapper.PostMapper;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.repository.savedPost.SavedPostDetailRepository;
import com.triduc.social.repository.savedPost.SavedPostRepository;
import com.triduc.social.repository.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;



import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SavedPostService {
    private final SavedPostDetailRepository savedPostDetailRepository;
    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;

    public SavedPost getUserSavedPost(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found by id: " + userId));
        return savedPostRepository.findByUser(user).orElse(null);
    }

    public List<PostResponse> getSavedPost(String userId) {
        SavedPost savedPost = getUserSavedPost(userId);
        if (savedPost == null) {
            return Collections.emptyList();
        }
        List<SavedPostDetail> savedPostDetails = savedPostDetailRepository.findBySavedPost(savedPost);
        return savedPostDetails.stream()
                .map(savedPostDetail -> postMapper.toPostResponse(savedPostDetail.getPost(), userId))
                .toList();

    }

    public boolean isSavedPost(Post post, String userId) {
        SavedPost savedPost = getUserSavedPost(userId);
        if (savedPost == null) {
            return false;
        }
        SavedPostDetail savedPostDetail = savedPostDetailRepository.findBySavedPostAndPost(savedPost, post)
                .orElse(null);
        return savedPostDetail != null;
    }


    @Transactional
    public void savePost(String postId, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found by id: " + userId));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found by id: " + postId));

        SavedPost savedPost = savedPostRepository.findByUser(user).orElse(null);

        if (savedPost == null) {
            savedPost = new SavedPost();
            savedPost.setUser(user);
            savedPostRepository.save(savedPost);
        }

        SavedPostDetail savedPostDetail = new SavedPostDetail();
        savedPostDetail.setSavedPost(savedPost);
        savedPostDetail.setPost(post);
        savedPostDetailRepository.save(savedPostDetail);

    }

    @Transactional
    public void deleteSavedPost(String postId , String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found by id: " + userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post not found by id: " + postId));

        SavedPost savedPost = savedPostRepository.findByUser(user)
                .orElseThrow(() -> new EntityNotFoundException("SavedPost not found"));

        SavedPostDetail savedPostDetail = savedPostDetailRepository.findBySavedPostAndPost(savedPost, post)
                .orElseThrow(() -> new EntityNotFoundException("SavedPostDetail not found"));

        // Xóa savedPostDetail
        savedPostDetailRepository.delete(savedPostDetail);

        // Kiểm tra nếu savedPost không còn chi tiết nào, thì xóa luôn savedPost
        if (!savedPostDetailRepository.existsBySavedPost(savedPost)) {
            savedPostRepository.delete(savedPost);
        }
    }


}