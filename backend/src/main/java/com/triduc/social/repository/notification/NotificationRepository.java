package com.triduc.social.repository.notification;

import com.triduc.social.entity.Notification;
import com.triduc.social.enums.NotificationType;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findTop30ByReceiver_IdOrderByCreatedAtDesc(String receiverId);

    long countByReceiver_IdAndReadStatusFalse(String receiverId);

    @Transactional
    @Modifying
    @Query("""
        DELETE FROM Notification n
        WHERE n.type = :type
          AND n.receiver.id = :receiverId
          AND n.sender.id = :senderId
    """)
    int deleteByReceiverIdAndSenderIdAndType(
            @Param("receiverId") String receiverId,
            @Param("senderId") String senderId,
            @Param("type") NotificationType type
    );

    @Transactional
    @Modifying
    @Query("""
        DELETE FROM Notification n
        WHERE n.type = :type
          AND n.referenceId = :referenceId
    """)
    int deleteByTypeAndReferenceId(
            @Param("type") NotificationType type,
            @Param("referenceId") String referenceId
    );
}