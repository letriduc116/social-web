package com.triduc.social.repository.friend;

import com.triduc.social.entity.FriendRequest;
import com.triduc.social.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, String> {

    Optional<FriendRequest> findFirstByRequester_IdAndReceiver_IdAndStatusOrderByCreatedAtDesc(
            String requesterId,
            String receiverId,
            FriendRequestStatus status
    );

    boolean existsByRequester_IdAndReceiver_IdAndStatus(
            String requesterId,
            String receiverId,
            FriendRequestStatus status
    );

    List<FriendRequest> findByReceiver_IdAndStatusOrderByCreatedAtDesc(
            String receiverId,
            FriendRequestStatus status
    );

    List<FriendRequest> findByRequester_IdAndStatusOrderByCreatedAtDesc(
            String requesterId,
            FriendRequestStatus status
    );

    @Query("""
        SELECT fr FROM FriendRequest fr
        WHERE fr.status = :status
          AND (
            (fr.requester.id = :userAId AND fr.receiver.id = :userBId)
            OR
            (fr.requester.id = :userBId AND fr.receiver.id = :userAId)
          )
        ORDER BY fr.updatedAt DESC, fr.createdAt DESC
    """)
    List<FriendRequest> findBetweenUsersByStatus(
            @Param("userAId") String userAId,
            @Param("userBId") String userBId,
            @Param("status") FriendRequestStatus status
    );
}