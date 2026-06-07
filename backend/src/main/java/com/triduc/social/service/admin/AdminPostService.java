package com.triduc.social.service.admin;

import com.triduc.social.dto.response.admin.AdminPostResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.PostImages;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.service.post.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPostService {

    private final PostRepository postRepository;
    private final PostService postService;

    @Transactional(readOnly = true)
    public Page<AdminPostResponse> getPosts(String keyword, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createAt")
        );

        return postRepository.searchForAdmin(clean(keyword), pageable)
                .map(this::mapToAdminPostResponse);
    }

    @Transactional(readOnly = true)
    public AdminPostResponse getPostDetail(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bài viết"));

        return mapToAdminPostResponse(post);
    }

    @Transactional
    public void deletePostByAdmin(String id) {
        postService.deletePost(id);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private AdminPostResponse mapToAdminPostResponse(Post post) {
        List<String> imageUrls = post.getPostImages() == null
                ? Collections.emptyList()
                : post.getPostImages().stream()
                .map(PostImages::getUrlImage)
                .toList();

        return AdminPostResponse.builder()
                .id(post.getId())
                .content(post.getContent())
                .createAt(post.getCreateAt())

                .authorId(post.getUser() != null ? post.getUser().getId() : null)
                .authorName(post.getUser() != null ? post.getUser().getFullName() : null)
                .authorEmail(post.getUser() != null ? post.getUser().getEmail() : null)
                .authorAvatar(post.getUser() != null ? post.getUser().getProfileImage() : null)

                .visibility(post.getVisibility() != null ? post.getVisibility().name() : null)

                .shared(post.getSharedPost() != null)
                .sharedPostId(post.getSharedPost() != null ? post.getSharedPost().getId() : null)
                .sharedPostContent(post.getSharedPost() != null ? post.getSharedPost().getContent() : null)

                .likes(post.getLikes() == null ? 0 : post.getLikes().size())
                .comments(post.getComments() == null ? 0 : post.getComments().size())

                .imageUrls(imageUrls)
                .build();
    }
}