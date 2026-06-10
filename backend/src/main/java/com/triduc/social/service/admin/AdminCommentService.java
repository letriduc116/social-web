package com.triduc.social.service.admin;

import com.triduc.social.dto.response.admin.AdminCommentResponse;
import com.triduc.social.entity.Comment;
import com.triduc.social.repository.comment.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminCommentService {

    private final CommentRepository commentRepository;

    @Transactional(readOnly = true)
    public Page<AdminCommentResponse> getComments(String postId, String keyword, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createAt")
        );

        return commentRepository.searchForAdmin(
                        clean(postId),
                        clean(keyword),
                        pageable
                )
                .map(this::mapToAdminCommentResponse);
    }

    @Transactional(readOnly = true)
    public AdminCommentResponse getCommentDetail(String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận"));

        return mapToAdminCommentResponse(comment);
    }

    @Transactional
    public AdminCommentResponse hideComment(String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận"));
        comment.setHidden(true);
        return mapToAdminCommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public AdminCommentResponse unhideComment(String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận"));
        comment.setHidden(false);
        return mapToAdminCommentResponse(commentRepository.save(comment));
    }

    @Transactional
    public void deleteCommentByAdmin(String id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bình luận"));

        commentRepository.delete(comment);
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private AdminCommentResponse mapToAdminCommentResponse(Comment comment) {
        return AdminCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createAt(comment.getCreateAt())
                .hidden(comment.isHidden())

                .senderId(comment.getSender() != null ? comment.getSender().getId() : null)
                .senderName(comment.getSender() != null ? comment.getSender().getFullName() : null)
                .senderEmail(comment.getSender() != null ? comment.getSender().getEmail() : null)
                .senderAvatar(comment.getSender() != null ? comment.getSender().getProfileImage() : null)

                .postId(comment.getPost() != null ? comment.getPost().getId() : null)
                .postContent(comment.getPost() != null ? comment.getPost().getContent() : null)

                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .parentCommentContent(comment.getParentComment() != null ? comment.getParentComment().getContent() : null)

                .likesCount(comment.getLikes() == null ? 0 : comment.getLikes().size())
                .repliesCount(comment.getReplies() == null ? 0 : comment.getReplies().size())
                .build();
    }
}