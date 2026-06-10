package com.triduc.social.service.report;

import com.triduc.social.dto.request.report.CreateCommentReportRequest;
import com.triduc.social.dto.request.report.CreatePostReportRequest;
import com.triduc.social.dto.request.report.CreateUserReportRequest;
import com.triduc.social.dto.request.report.UpdateReportStatusRequest;
import com.triduc.social.dto.response.report.AdminReportStatsResponse;
import com.triduc.social.dto.response.report.ReportPostCommentResponse;
import com.triduc.social.dto.response.report.ReportResponse;
import com.triduc.social.entity.Comment;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.PostImages;
import com.triduc.social.entity.Report;
import com.triduc.social.entity.User;
import com.triduc.social.enums.ReportReason;
import com.triduc.social.enums.ReportStatus;
import com.triduc.social.enums.ReportTargetType;
import com.triduc.social.repository.comment.CommentRepository;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.repository.report.ReportRepository;
import com.triduc.social.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {
    private static final List<ReportStatus> ACTIVE_STATUSES = List.of(
            ReportStatus.PENDING,
            ReportStatus.REVIEWING
    );

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public ReportResponse reportUser(CreateUserReportRequest request, Jwt jwt) {
        User reporter = getCurrentUser(jwt);

        if (request == null || isBlank(request.resolveReportedUserId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu reportedUserId");
        }

        User reportedUser = userRepository.findById(request.resolveReportedUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng bị báo cáo không tồn tại"));

        if (reporter.getId().equals(reportedUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể tự báo cáo chính mình");
        }

        return reportRepository
                .findFirstByReporter_IdAndTargetTypeAndReportedUser_IdAndStatusIn(
                        reporter.getId(),
                        ReportTargetType.USER,
                        reportedUser.getId(),
                        ACTIVE_STATUSES
                )
                .map(report -> mapToResponse(report, false))
                .orElseGet(() -> {
                    Report report = new Report();
                    report.setTargetType(ReportTargetType.USER);
                    report.setReporter(reporter);
                    report.setReportedUser(reportedUser);
                    report.setReason(ReportReason.fromString(request.resolveReason()));
                    report.setDescription(clean(request.getDescription()));
                    report.setStatus(ReportStatus.PENDING);
                    return mapToResponse(reportRepository.save(report), false);
                });
    }

    @Transactional
    public ReportResponse reportPost(CreatePostReportRequest request, Jwt jwt) {
        User reporter = getCurrentUser(jwt);

        if (request == null || isBlank(request.resolvePostId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu postId");
        }

        Post post = postRepository.findById(request.resolvePostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bài viết bị báo cáo không tồn tại"));

        if (post.getUser() != null && reporter.getId().equals(post.getUser().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể tự báo cáo bài viết của chính mình");
        }

        return reportRepository
                .findFirstByReporter_IdAndTargetTypeAndPost_IdAndStatusIn(
                        reporter.getId(),
                        ReportTargetType.POST,
                        post.getId(),
                        ACTIVE_STATUSES
                )
                .map(report -> mapToResponse(report, false))
                .orElseGet(() -> {
                    Report report = new Report();
                    report.setTargetType(ReportTargetType.POST);
                    report.setReporter(reporter);
                    report.setPost(post);
                    report.setReason(ReportReason.fromString(request.resolveReason()));
                    report.setDescription(clean(request.getDescription()));
                    report.setStatus(ReportStatus.PENDING);
                    return mapToResponse(reportRepository.save(report), false);
                });
    }

    @Transactional
    public ReportResponse reportComment(CreateCommentReportRequest request, Jwt jwt) {
        User reporter = getCurrentUser(jwt);

        if (request == null || isBlank(request.resolveCommentId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu commentId");
        }

        Comment comment = commentRepository.findById(request.resolveCommentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bình luận bị báo cáo không tồn tại"));

        if (comment.getSender() != null && reporter.getId().equals(comment.getSender().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bạn không thể tự báo cáo bình luận của chính mình");
        }

        return reportRepository
                .findFirstByReporter_IdAndTargetTypeAndComment_IdAndStatusIn(
                        reporter.getId(),
                        ReportTargetType.COMMENT,
                        comment.getId(),
                        ACTIVE_STATUSES
                )
                .map(report -> mapToResponse(report, false))
                .orElseGet(() -> {
                    Report report = new Report();
                    report.setTargetType(ReportTargetType.COMMENT);
                    report.setReporter(reporter);
                    report.setComment(comment);
                    report.setPost(comment.getPost());
                    report.setReason(ReportReason.fromString(request.resolveReason()));
                    report.setDescription(clean(request.getDescription()));
                    report.setStatus(ReportStatus.PENDING);
                    return mapToResponse(reportRepository.save(report), false);
                });
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getReports(ReportTargetType targetType, String statusValue, String keyword, int page, int size) {
        ReportStatus status = ReportStatus.fromString(statusValue);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return reportRepository
                .searchForAdmin(targetType, status, clean(keyword), pageable)
                .map(report -> mapToResponse(report, false));
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportDetail(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));

        return mapToResponse(report, true);
    }

    @Transactional
    public ReportResponse updateStatus(String id, UpdateReportStatusRequest request, Jwt jwt) {
        User processor = getCurrentUser(jwt);

        if (request == null || isBlank(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu status");
        }

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));

        ReportStatus status = ReportStatus.fromString(request.getStatus());
        report.setStatus(status);
        report.setAdminNote(clean(request.getAdminNote()));
        report.setResolvedBy(processor);

        if (status == ReportStatus.RESOLVED || status == ReportStatus.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        } else {
            report.setResolvedAt(null);
        }

        boolean shouldApplyAction = status == ReportStatus.RESOLVED
                && (request.getApplyAction() == null || request.getApplyAction());

        if (shouldApplyAction) {
            applyViolationAction(report);
        }

        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse resolveAndApplyAction(String id, String adminNote, Jwt jwt) {
        UpdateReportStatusRequest request = new UpdateReportStatusRequest();
        request.setStatus(ReportStatus.RESOLVED.name());
        request.setAdminNote(adminNote);
        request.setApplyAction(true);
        return updateStatus(id, request, jwt);
    }

    @Transactional
    public void deleteReport(String id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));

        reportRepository.delete(report);
    }

    @Transactional
    public ReportResponse lockReportedUserByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getReportedUser() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với tài khoản cần khoá");
        }
        report.getReportedUser().setLocked(true);
        userRepository.save(report.getReportedUser());
        markActionApplied(report);
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse unlockReportedUserByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getReportedUser() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với tài khoản cần mở khoá");
        }
        report.getReportedUser().setLocked(false);
        userRepository.save(report.getReportedUser());
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse hidePostByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getPost() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với bài viết cần ẩn");
        }
        report.getPost().setHidden(true);
        postRepository.save(report.getPost());
        markActionApplied(report);
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse unhidePostByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getPost() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với bài viết cần mở hiển thị");
        }
        report.getPost().setHidden(false);
        postRepository.save(report.getPost());
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse hideCommentByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getComment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với bình luận cần ẩn");
        }
        report.getComment().setHidden(true);
        commentRepository.save(report.getComment());
        markActionApplied(report);
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional
    public ReportResponse unhideCommentByReport(String reportId) {
        Report report = getReportOrThrow(reportId);
        if (report.getComment() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo này không gắn với bình luận cần mở hiển thị");
        }
        report.getComment().setHidden(false);
        commentRepository.save(report.getComment());
        return mapToResponse(reportRepository.save(report), true);
    }

    @Transactional(readOnly = true)
    public AdminReportStatsResponse getStats() {
        return AdminReportStatsResponse.builder()
                .totalReports(reportRepository.count())
                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                .reviewingReports(reportRepository.countByStatus(ReportStatus.REVIEWING))
                .resolvedReports(reportRepository.countByStatus(ReportStatus.RESOLVED))
                .rejectedReports(reportRepository.countByStatus(ReportStatus.REJECTED))
                .userReports(reportRepository.countByTargetType(ReportTargetType.USER))
                .postReports(reportRepository.countByTargetType(ReportTargetType.POST))
                .commentReports(reportRepository.countByTargetType(ReportTargetType.COMMENT))
                .build();
    }

    private void applyViolationAction(Report report) {
        if (report.isActionApplied()) {
            return;
        }

        if (report.getTargetType() == ReportTargetType.USER) {
            if (report.getReportedUser() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo tài khoản thiếu reportedUser");
            }
            report.getReportedUser().setLocked(true);
            userRepository.save(report.getReportedUser());
        } else if (report.getTargetType() == ReportTargetType.POST) {
            if (report.getPost() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo bài viết thiếu post");
            }
            report.getPost().setHidden(true);
            postRepository.save(report.getPost());
        } else if (report.getTargetType() == ReportTargetType.COMMENT) {
            if (report.getComment() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Báo cáo bình luận thiếu comment");
            }
            report.getComment().setHidden(true);
            commentRepository.save(report.getComment());
        }

        markActionApplied(report);
    }

    private void markActionApplied(Report report) {
        report.setActionApplied(true);
        report.setActionAt(LocalDateTime.now());
    }

    private Report getReportOrThrow(String id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy báo cáo"));
    }

    private User getCurrentUser(Jwt jwt) {
        if (jwt == null || isBlank(jwt.getSubject())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy thông tin xác thực");
        }

        return userRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại"));
    }

    private ReportResponse mapToResponse(Report report, boolean includePostComments) {
        User reporter = report.getReporter();
        User reportedUser = report.getReportedUser();
        Post post = report.getPost();
        Comment comment = report.getComment();

        List<String> imageUrls = List.of();
        if (post != null && post.getPostImages() != null) {
            imageUrls = post.getPostImages().stream()
                    .map(PostImages::getUrlImage)
                    .filter(url -> url != null && !url.isBlank())
                    .toList();
        }

        return ReportResponse.builder()
                .id(report.getId())
                .targetType(report.getTargetType() != null ? report.getTargetType().name() : null)
                .reason(report.getReason() != null ? report.getReason().name() : null)
                .reasonCode(report.getReason() != null ? report.getReason().getCode() : null)
                .reasonLabel(report.getReason() != null ? report.getReason().getLabel() : null)
                .description(report.getDescription())
                .status(report.getStatus() != null ? report.getStatus().name() : null)
                .statusLabel(report.getStatus() != null ? report.getStatus().getLabel() : null)
                .adminNote(report.getAdminNote())
                .actionApplied(report.isActionApplied())
                .actionAt(report.getActionAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .resolvedAt(report.getResolvedAt())

                .reporterId(reporter != null ? reporter.getId() : null)
                .reporterName(reporter != null ? firstNonBlank(reporter.getFullName(), reporter.getUserName()) : null)
                .reporterEmail(reporter != null ? reporter.getEmail() : null)
                .reporterAvatar(reporter != null ? reporter.getProfileImage() : null)
                .reporterLocked(reporter != null && reporter.isLocked())

                .reportedUserId(reportedUser != null ? reportedUser.getId() : null)
                .reportedUserName(reportedUser != null ? reportedUser.getUserName() : null)
                .reportedUserFullName(reportedUser != null ? reportedUser.getFullName() : null)
                .reportedUserEmail(reportedUser != null ? reportedUser.getEmail() : null)
                .reportedUserAvatar(reportedUser != null ? reportedUser.getProfileImage() : null)
                .reportedUserLocked(reportedUser != null && reportedUser.isLocked())

                .postId(post != null ? post.getId() : null)
                .postContent(post != null ? post.getContent() : null)
                .postCreatedAt(post != null ? post.getCreateAt() : null)
                .postVisibility(post != null && post.getVisibility() != null ? post.getVisibility().name() : null)
                .postHidden(post != null && post.isHidden())
                .postShared(post != null && post.getSharedPost() != null)
                .postLikesCount(post != null && post.getLikes() != null ? post.getLikes().size() : 0)
                .postCommentsCount(post != null && post.getComments() != null ? post.getComments().size() : 0)
                .postImageUrls(imageUrls)

                .postAuthorId(post != null && post.getUser() != null ? post.getUser().getId() : null)
                .postAuthorName(post != null && post.getUser() != null ? firstNonBlank(post.getUser().getFullName(), post.getUser().getUserName()) : null)
                .postAuthorEmail(post != null && post.getUser() != null ? post.getUser().getEmail() : null)
                .postAuthorAvatar(post != null && post.getUser() != null ? post.getUser().getProfileImage() : null)
                .postAuthorLocked(post != null && post.getUser() != null && post.getUser().isLocked())

                .commentId(comment != null ? comment.getId() : null)
                .commentContent(comment != null ? comment.getContent() : null)
                .commentCreatedAt(comment != null ? comment.getCreateAt() : null)
                .commentHidden(comment != null && comment.isHidden())
                .commentSenderId(comment != null && comment.getSender() != null ? comment.getSender().getId() : null)
                .commentSenderName(comment != null && comment.getSender() != null ? firstNonBlank(comment.getSender().getFullName(), comment.getSender().getUserName()) : null)
                .commentSenderEmail(comment != null && comment.getSender() != null ? comment.getSender().getEmail() : null)
                .commentSenderLocked(comment != null && comment.getSender() != null && comment.getSender().isLocked())
                .parentCommentId(comment != null && comment.getParentComment() != null ? comment.getParentComment().getId() : null)

                .postComments(includePostComments && post != null ? getPostCommentSummaries(post.getId()) : List.of())
                .build();
    }

    private List<ReportPostCommentResponse> getPostCommentSummaries(String postId) {
        List<ReportPostCommentResponse> result = new ArrayList<>();
        List<Comment> parents = commentRepository.findAllParentCommentsByPostIdForAdmin(postId);

        for (Comment parent : parents) {
            result.add(mapCommentSummary(parent, 0));
            appendReplies(parent.getId(), result, 1);
        }

        return result;
    }

    private void appendReplies(String parentCommentId, List<ReportPostCommentResponse> result, int depth) {
        List<Comment> replies = commentRepository.findAllRepliesByParentIdForAdmin(parentCommentId);

        for (Comment reply : replies) {
            result.add(mapCommentSummary(reply, depth));
            appendReplies(reply.getId(), result, depth + 1);
        }
    }

    private ReportPostCommentResponse mapCommentSummary(Comment comment, int depth) {
        User sender = comment.getSender();

        return ReportPostCommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .createAt(comment.getCreateAt())
                .hidden(comment.isHidden())
                .senderId(sender != null ? sender.getId() : null)
                .senderName(sender != null ? firstNonBlank(sender.getFullName(), sender.getUserName()) : null)
                .senderEmail(sender != null ? sender.getEmail() : null)
                .senderAvatar(sender != null ? sender.getProfileImage() : null)
                .senderLocked(sender != null && sender.isLocked())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .depth(depth)
                .likesCount(comment.getLikes() != null ? comment.getLikes().size() : 0)
                .repliesCount(comment.getReplies() != null ? comment.getReplies().size() : 0)
                .build();
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String firstNonBlank(String first, String second) {
        if (!isBlank(first)) return first;
        if (!isBlank(second)) return second;
        return null;
    }
}
