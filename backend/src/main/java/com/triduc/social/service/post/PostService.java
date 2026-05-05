package com.triduc.social.service.post;

import com.triduc.social.dto.request.post.SharePostRequest;
import com.triduc.social.dto.request.post.UpPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.SavedPostDetail;
import com.triduc.social.entity.User;
import com.triduc.social.enums.PostVisibility;
import com.triduc.social.mapper.PostMapper;
import com.triduc.social.repository.follow.FollowRepository;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.repository.savedPost.SavedPostDetailRepository;
import com.triduc.social.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostMapper postMapper;
    private final PostRepository repo;
    private final SavedPostDetailRepository savedPostDetailRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    /**
     * Feed bài viết của người khác.
     * Chỉ trả về bài mà currentId được phép xem theo visibility.
     */
    public List<PostResponse> getAllPosts(String currentId) {
        List<Post> posts = repo.findByUser_IdNot(currentId, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : posts) {
            if (canViewPostAndSharedOriginal(p, currentId)) {
                rs.add(postMapper.toPostResponse(p, currentId));
            }
        }
        return rs;
    }

    /**
     * Lấy bài viết của một user bất kỳ theo góc nhìn của viewerId.
     */
    public List<PostResponse> getPostsByUser(String profileUserId, String viewerId) {
        List<Post> posts = repo.findByUser_Id(profileUserId, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : posts) {
            if (canViewPostAndSharedOriginal(p, viewerId)) {
                rs.add(postMapper.toPostResponse(p, viewerId));
            }
        }
        return rs;
    }

    /**
     * Giữ lại method cũ để không làm vỡ code đang gọi getPostsByUser(currentId).
     */
    public List<PostResponse> getPostsByUser(String currentId) {
        return getPostsByUser(currentId, currentId);
    }

    @Transactional
    public Post insertPost(UpPostRequest request) {
        Post post = postMapper.toPost(request);
        return repo.save(post);
    }

    /**
     * Chia sẻ bài viết của người khác về trang cá nhân.
     * Để tránh lộ nội dung riêng tư, chỉ cho phép share bài có visibility = EVERYONE.
     */
    @Transactional
    public PostResponse sharePost(SharePostRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dữ liệu chia sẻ không hợp lệ");
        }
        if (request.getUserId() == null || request.getUserId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu userId người chia sẻ");
        }
        if (request.getOriginalPostId() == null || request.getOriginalPostId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu originalPostId bài viết gốc");
        }

        User sharer = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        Post original = repo.findById(request.getOriginalPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài viết gốc không tồn tại"));

        // Nếu user share lại một bài share, ta luôn trỏ về bài gốc thật để tránh lồng nhiều tầng.
        Post rootOriginal = original.getSharedPost() != null ? original.getSharedPost() : original;

        if (rootOriginal.getUser().getId().equals(sharer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể chia sẻ bài viết của chính mình bằng chức năng này");
        }

        if (!canViewPost(rootOriginal, sharer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem bài viết này nên không thể chia sẻ");
        }

        PostVisibility originalVisibility = rootOriginal.getVisibility() == null
                ? PostVisibility.EVERYONE
                : rootOriginal.getVisibility();
        if (originalVisibility != PostVisibility.EVERYONE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chỉ có thể chia sẻ bài viết đang ở chế độ Mọi người");
        }

        Post sharedPost = new Post();
        sharedPost.setContent(request.getContent());
        sharedPost.setCreateAt(LocalDateTime.now());
        sharedPost.setUser(sharer);
        sharedPost.setSharedPost(rootOriginal);
        sharedPost.setVisibility(request.getVisibility() == null ? PostVisibility.EVERYONE : request.getVisibility());

        Post saved = repo.save(sharedPost);
        return postMapper.toPostResponse(saved, sharer.getId());
    }

    @Transactional
    public void deletePost(String postId) {
        Post post = repo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài viết không tồn tại"));

        // Nếu bài gốc bị xóa, các bài share sẽ không còn phần nhúng bài gốc.
        List<Post> sharedPosts = repo.findBySharedPost_Id(postId);
        for (Post shared : sharedPosts) {
            shared.setSharedPost(null);
        }
        repo.saveAll(sharedPosts);

        repo.delete(post);
    }

    public List<PostProfileResponse> getSavedPosts(String userId) {
        List<SavedPostDetail> savedDetails = savedPostDetailRepository.findBySavedPost_User_Id(userId);

        return savedDetails.stream()
                .map(SavedPostDetail::getPost)
                .filter(post -> canViewPostAndSharedOriginal(post, userId))
                .map(post -> PostProfileResponse.builder()
                        .id(post.getId())
                        .content(post.getContent())
                        .createdAt(post.getCreateAt())
                        .likeCount(post.getLikes() == null ? 0 : post.getLikes().size())
                        .commentCount(post.getComments() == null ? 0 : post.getComments().size())
                        .imageUrls(post.getPostImages())
                        .userId(post.getUser().getId())
                        .userName(post.getUser().getUserName())
                        .avatarUrl(post.getUser().getProfileImage())
                        .visibility(post.getVisibility() == null ? PostVisibility.EVERYONE : post.getVisibility())
                        .shared(post.getSharedPost() != null)
                        .build())
                .sorted(Comparator.comparing(PostProfileResponse::getCreatedAt).reversed())
                .toList();
    }

    private boolean canViewPostAndSharedOriginal(Post post, String currentUserId) {
        if (!canViewPost(post, currentUserId)) {
            return false;
        }
        return post.getSharedPost() == null || canViewPost(post.getSharedPost(), currentUserId);
    }

    private boolean canViewPost(Post post, String currentUserId) {
        if (post == null || post.getUser() == null || currentUserId == null || currentUserId.isBlank()) {
            return false;
        }

        String ownerId = post.getUser().getId();
        if (ownerId.equals(currentUserId)) {
            return true;
        }

        PostVisibility visibility = post.getVisibility() == null ? PostVisibility.EVERYONE : post.getVisibility();
        if (visibility == PostVisibility.EVERYONE) {
            return true;
        }
        if (visibility == PostVisibility.ONLY_ME) {
            return false;
        }

        // FRIENDS: hiểu là hai người follow qua lại nhau.
        return isFriend(ownerId, currentUserId);
    }

    private boolean isFriend(String userAId, String userBId) {
        return followRepository.countByUserIdAndFollowerId(userAId, userBId) > 0
                && followRepository.countByUserIdAndFollowerId(userBId, userAId) > 0;
    }
}
