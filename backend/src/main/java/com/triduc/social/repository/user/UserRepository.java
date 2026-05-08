package com.triduc.social.repository.user;

import com.triduc.social.dto.response.user.UserProfileResponse;
import com.triduc.social.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(@Param("email") String userEmail);

    public Optional<User> findById(String id);
    Optional<User> findByUserName(String userName);

    Optional<UserProfileResponse>  findUserProfileById(String id);


//    @Query("""
//    SELECT DISTINCT fof FROM User u
//    JOIN u.following f
//    JOIN f.following fof
//    WHERE u.id = :userId
//      AND fof.id <> :userId
//      AND fof.id NOT IN (
//          SELECT followed.id FROM User u2
//          JOIN u2.following followed
//          WHERE u2.id = :userId
//      )
//""")
//    List<User> findByUsernameContainingIgnoreCase(String keyword, int limit);

//    @Query("SELECT u FROM User u WHERE u.userName LIKE %:keyWord% OR u.fullName LIKE %:keyWord%")
//    public List<User> searchChatUsers(@Param("keyWord") String keyword);

    @Query("""
    SELECT u FROM User u
    WHERE u.id <> :currentUserId
      AND (
        LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
      )
    ORDER BY
      CASE
        WHEN LOWER(u.fullName) = LOWER(:keyword) THEN 0
        WHEN LOWER(u.userName) = LOWER(:keyword) THEN 1
        WHEN LOWER(u.fullName) LIKE LOWER(CONCAT(:keyword, '%')) THEN 2
        WHEN LOWER(u.userName) LIKE LOWER(CONCAT(:keyword, '%')) THEN 3
        ELSE 4
      END,
      u.fullName ASC
    """)
    List<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("currentUserId") String currentUserId,
            Pageable pageable
    );



}