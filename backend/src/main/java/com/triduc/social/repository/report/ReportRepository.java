package com.triduc.social.repository.report;

import com.triduc.social.entity.Report;
import com.triduc.social.enums.ReportStatus;
import com.triduc.social.enums.ReportTargetType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, String> {
    Optional<Report> findFirstByReporter_IdAndTargetTypeAndReportedUser_IdAndStatusIn(
            String reporterId,
            ReportTargetType targetType,
            String reportedUserId,
            Collection<ReportStatus> statuses
    );

    Optional<Report> findFirstByReporter_IdAndTargetTypeAndPost_IdAndStatusIn(
            String reporterId,
            ReportTargetType targetType,
            String postId,
            Collection<ReportStatus> statuses
    );

    Optional<Report> findFirstByReporter_IdAndTargetTypeAndComment_IdAndStatusIn(
            String reporterId,
            ReportTargetType targetType,
            String commentId,
            Collection<ReportStatus> statuses
    );

    long countByTargetType(ReportTargetType targetType);

    long countByStatus(ReportStatus status);

    long countByTargetTypeAndStatus(ReportTargetType targetType, ReportStatus status);

    @Query("""
        SELECT r FROM Report r
        LEFT JOIN r.reporter reporter
        LEFT JOIN r.reportedUser reportedUser
        LEFT JOIN r.post post
        LEFT JOIN post.user postAuthor
        LEFT JOIN r.comment comment
        LEFT JOIN comment.sender commentSender
        WHERE r.targetType = :targetType
          AND (:status IS NULL OR r.status = :status)
          AND (
                :keyword IS NULL OR :keyword = ''
                OR LOWER(COALESCE(r.id, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))

                OR LOWER(COALESCE(reporter.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(reporter.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(reporter.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))

                OR LOWER(COALESCE(reportedUser.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(reportedUser.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(reportedUser.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))

                OR LOWER(COALESCE(postAuthor.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(postAuthor.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(postAuthor.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))

                OR LOWER(COALESCE(commentSender.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(commentSender.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(commentSender.userName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))

                OR CAST(r.description AS string) LIKE CONCAT('%', :keyword, '%')
                OR CAST(post.content AS string) LIKE CONCAT('%', :keyword, '%')
                OR CAST(comment.content AS string) LIKE CONCAT('%', :keyword, '%')
          )
        """)
    Page<Report> searchForAdmin(
            @Param("targetType") ReportTargetType targetType,
            @Param("status") ReportStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
