package com.triduc.social.mapper;
import org.springframework.context.annotation.Lazy;
import com.triduc.social.dto.request.post.UpPostRequest;
import com.triduc.social.dto.response.post.PostResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.PostImages;
import com.triduc.social.entity.User;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.savedPost.SavedPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostMapper {
    private final UserRepository user_repo;
    private final UserMapper userMapper;
    private SavedPostService savedPostService;

    @Lazy
    @Autowired
    public void setSavedPostService(SavedPostService savedPostService) {
        this.savedPostService = savedPostService;
    }

    public PostResponse toPostResponse(Post post, String currentUserId) {
        boolean isLiked = post.getLikes().stream().anyMatch(like -> like.getUser().getId().equals(currentUserId));
        boolean isSavedPost = savedPostService.isSavedPost(post,currentUserId);

        return PostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .createAt(post.getCreateAt())
                .images(post.getPostImages())
                .comments(post.getComments().size())
                .likes(post.getLikes().size())
                .liked(isLiked)
                .savedPost(isSavedPost)
                .user(userMapper.toUserResponse(post.getUser()))
                .build();
    }



    public Post toPost(UpPostRequest request) {
        if (request == null) {
            return null;
        }
        Post post = new Post();
        post.setContent(request.getContent());
        post.setCreateAt(LocalDateTime.now());
        // set list img
        List<PostImages> images = new ArrayList<>();
        for (String url: request.getPostImages()){
            PostImages img = new PostImages();
            img.setUrlImage(url);
            img.setPost(post);
            images.add(img);
        }
        post.setPostImages(images);
        // set user
        Optional<User> u = user_repo.findById(request.getUser_Id());
        if (u.isEmpty()) {
            throw new RuntimeException("User not found with id: " + request.getUser_Id());
        }
        post.setUser(u.get());
        return post;
    }
}
