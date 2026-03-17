package com.triduc.social.service.post;

import com.triduc.social.dto.request.post.UpPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.SavedPostDetail;
import com.triduc.social.mapper.PostMapper;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.repository.savedPost.SavedPostDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostMapper postMapper;
    private final PostRepository repo;
    private final SavedPostDetailRepository savedPostDetailRepository;

    public List<PostResponse> getAllPosts(String currentId) {
        List<Post> post = repo.findByUser_IdNot(currentId, Sort.by(Sort.Direction.DESC, "createAt"));
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : post) {
            rs.add(postMapper.toPostResponse(p, currentId));
        }
        return rs;
    }

    public List<PostResponse> getPostsByUser(String currentId) {
        List<Post> post = repo.findByUser_Id(currentId);
        List<PostResponse> rs = new ArrayList<>();
        for (Post p : post) {
            rs.add(postMapper.toPostResponse(p, currentId));
        }
        return rs;
    }


    public Post insertPost(UpPostRequest request) {
        Post post = postMapper.toPost(request);
        return repo.save(post);
    }

    public void deletePost(String postId) {
        repo.deleteById(postId);
    }

    public List<PostProfileResponse> getSavedPosts(String userId) {
        List<SavedPostDetail> savedDetails = savedPostDetailRepository.findBySavedPost_User_Id(userId);

        return savedDetails.stream()
                .map(SavedPostDetail::getPost)
                .map(post -> PostProfileResponse.builder()
                        .id(post.getId())
                        .content(post.getContent())
                        .createdAt(post.getCreateAt())
                        .likeCount(post.getLikes().size())
                        .commentCount(post.getComments().size())
                        .imageUrls(post.getPostImages())
                        .userId(post.getUser().getId())
                        .userName(post.getUser().getUserName())
                        .avatarUrl(post.getUser().getProfileImage())
                        .build())
                .sorted(Comparator.comparing(PostProfileResponse::getCreatedAt).reversed())
                .toList();
    }




}
