package com.triduc.social.service.user;
import com.triduc.social.enums.Role;
import com.triduc.social.enums.PostVisibility;

import com.triduc.social.dto.request.auth.RegisterRequest;
import com.triduc.social.dto.request.user.UpdateProfileRequest;
import com.triduc.social.dto.response.story.StoryResponse;
import com.triduc.social.dto.response.user.AuthResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.dto.response.user.UserProfileResponse;
import com.triduc.social.dto.response.user.UserResponse;
import com.triduc.social.dto.response.user.UserSearchResponse;
import com.triduc.social.entity.Follow;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.User;
import com.triduc.social.mapper.UserMapper;
import com.triduc.social.repository.follow.FollowRepository;
import com.triduc.social.repository.post.PostRepository;
import com.triduc.social.repository.user.UserRepository;
import com.triduc.social.service.FileService;
import com.triduc.social.service.jwt.JwtService;
import com.triduc.social.service.story.StoryService;
import com.triduc.social.utils.JwtUtil;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper mapper;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final PostRepository postRepository;
    private final FollowRepository followRepository;
    private final FileService fileService;
    private final StoryService storyService;

    public AuthResponse login(String email, String password, HttpServletResponse response) {
        Authentication authenticationRequest = UsernamePasswordAuthenticationToken.unauthenticated(email, password);
        Authentication authenticationResponse = this.authenticationManager.authenticate(authenticationRequest);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        String accessToken = jwtService.createAccessToken(authenticationResponse, user.getRole().name());
        String refreshToken = jwtService.createRefreshToken(authenticationResponse);

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(true);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(7 * 24 * 60 * 60);
        refreshTokenCookie.setAttribute("SameSite", "Strict");
        response.addCookie(refreshTokenCookie);

//        User user = userRepository.findByEmail(email)
//                .orElseThrow(EntityNotFoundException::new);

        return mapper.toAuthResponse(user, accessToken);
    }

    public UserResponse findById(String userId){
        User user = userRepository.findById(userId).orElseThrow(EntityNotFoundException::new);
        return mapper.toUserResponse(user);
    }

    @Transactional
    public AuthResponse createUser(RegisterRequest registerRequest) {
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setUserName(registerRequest.getUserName());
        user.setFullName(registerRequest.getFullName());
        user.setRole(Role.USER);
        String hashPassword = passwordEncoder.encode(registerRequest.getPassword());
        user.setPassword(hashPassword);
        userRepository.save(user);
        return mapper.toAuthResponse(user, "");
    }

    @Transactional
    public AuthResponse registerAndLogin(RegisterRequest registerRequest, HttpServletResponse response) {
        createUser(registerRequest);
        return login(registerRequest.getEmail(), registerRequest.getPassword(), response);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public UserProfileResponse getUserProfile(String profileUserId, String currentUserId) {
        User profileUser = userRepository.findById(profileUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        System.out.println(profileUserId);
        System.out.println(currentUserId);
        boolean isFollowing = followRepository.countByUserIdAndFollowerId(profileUserId, currentUserId) > 0;
        System.out.println(isFollowing);

        long followersCount = followRepository.countByUserId(profileUserId);
        long followingCount = followRepository.countByFollowerId(profileUserId);

        List<UserResponse> followers = followRepository.findByUserId(profileUserId).stream()
                .map(Follow::getFollower)
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());

        List<UserResponse> followings = followRepository.findByFollowerId(profileUserId).stream()
                .map(Follow::getUser)
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());

        List<PostProfileResponse> posts = getVisibleProfilePosts(profileUserId, currentUserId);

        return UserProfileResponse.builder()
                .userId(profileUser.getId())
                .userName(profileUser.getUserName())
                .fullName(profileUser.getFullName())
                .avatarUrl(profileUser.getProfileImage())
                .coverUrl(profileUser.getCoverImage())
                .bio(profileUser.getBio())
                .isFollowing(isFollowing)
                .isMe(profileUserId.equals(currentUserId))
                .followersCount(followersCount)
                .followingCount(followingCount)
                .postCount(posts.size())
                .followers(followers)
                .followings(followings)
                .posts(posts)
                .build();
    }


    // Phương thức upload ảnh ĐƯỢC CHỈNH SỬA để sử dụng FileService
    @Transactional
    public String uploadAndSetProfileImage(String userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File ảnh không được trống.");
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

            // Sử dụng FileService để tải ảnh lên Cloudinary
            String imageUrl = fileService.uploadImageToCloudinary(file);

            // Cập nhật URL ảnh vào user và lưu vào MySQL
            user.setProfileImage(imageUrl);
            userRepository.save(user);

            return imageUrl;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tải ảnh lên Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi chung khi xử lý ảnh: " + e.getMessage(), e);
        }
    }





    /**
     * Upload và cập nhật ảnh bìa trang cá nhân.
     */
    @Transactional
    public String uploadAndSetCoverImage(String userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File ảnh không được trống.");
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

            String imageUrl = fileService.uploadImageToCloudinary(file);
            user.setCoverImage(imageUrl);
            userRepository.save(user);

            return imageUrl;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khi tải ảnh bìa lên Cloudinary: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi chung khi xử lý ảnh bìa: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void follow(String currentUserId, String targetUserId) {
        if (targetUserId.equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự theo dõi chính mình");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        User follower = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if (followRepository.countByUserIdAndFollowerId(targetUserId, currentUserId) > 0) {
            return;
        }

        Follow follow = new Follow();
        follow.setUser(target);
        follow.setFollower(follower);
        followRepository.save(follow);
    }

    @Transactional
    public void unfollow(String currentUserId, String targetUserId) {
        followRepository.deleteByUserIdAndFollowerId(targetUserId, currentUserId);
    }

    @Transactional
    public List<UserResponse> getFollowers(String userId) {
        return followRepository.findByUserId(userId).stream()
                .map(Follow::getFollower)
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<UserResponse> getFollowing(String userId) {
        return followRepository.findByFollowerId(userId).stream()
                .map(Follow::getUser)
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
    }

    public List<PostProfileResponse> getUserPosts(String userId) {
        // API cũ chỉ nhận userId, nên mặc định hiểu là chính user đó đang xem trang của mình.
        return getVisibleProfilePosts(userId, userId);
    }

    public String getIdByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại"))
                .getId();
    }

    @Transactional
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getUserName() != null) {
            user.setUserName(request.getUserName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }
        if (request.getCoverImage() != null) {
            user.setCoverImage(request.getCoverImage());
        }

        return mapper.toUserResponse(userRepository.save(user));
    }

    public List<UserResponse> suggestUsersToFollow(String userId, int limit) {
        List<User> allUsers = userRepository.findAll();

        List<String> followingIds = followRepository.findByFollowerId(userId).stream()
                .map(f -> f.getUser().getId())
                .collect(Collectors.toList());

        return allUsers.stream()
                .filter(u -> !u.getId().equals(userId) && !followingIds.contains(u.getId()))
                .limit(limit)
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
    }


    public UserProfileResponse findUserById(String userId, String currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        boolean isFollowing = followRepository.countByUserIdAndFollowerId(userId, currentUserId) > 0;
        long followersCount = followRepository.countByUserId(userId);
        long followingCount = followRepository.countByFollowerId(userId);

        List<PostProfileResponse> posts = getVisibleProfilePosts(userId, currentUserId);

        return mapper.toUserProfileResponse(user, isFollowing, followersCount, followingCount, posts);
    }

    public List<UserSearchResponse> searchUsers(String name) {
        List<User> users = userRepository.searchChatUsers(name);
        String currentUserId =  getIdByEmail(JwtUtil.getCurrentUserEmail());

        return users.stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .map(user -> {
                    List<StoryResponse> stories = storyService.getMyStories(user.getId());
                    return UserSearchResponse.builder()
                            .id(user.getId())
                            .userName(user.getUserName())
                            .fullName(user.getFullName())
                            .profileImage(user.getProfileImage())
                            .hasStory(!stories.isEmpty())
                            .stories(stories)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Lọc bài viết trên trang cá nhân theo quyền xem:
     * - EVERYONE: ai cũng xem được
     * - FRIENDS: chỉ hai người follow qua lại nhau mới xem được
     * - ONLY_ME: chỉ chủ bài viết xem được
     */
    private List<PostProfileResponse> getVisibleProfilePosts(String profileUserId, String currentUserId) {
        return postRepository.findByUser_Id(profileUserId).stream()
                .filter(post -> canViewPostAndSharedOriginal(post, currentUserId))
                .map(mapper::toPostResponse)
                .sorted(Comparator.comparing(PostProfileResponse::getCreatedAt).reversed())
                .collect(Collectors.toList());
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

    @Transactional
    public void removeFollower(String currentUserId, String followerId) {
        if (currentUserId.equals(followerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tự xóa chính mình khỏi danh sách followers");
        }

        // Kiểm tra xem followerId có thực sự đang follow currentUserId không
        long followCount = followRepository.countByUserIdAndFollowerId(currentUserId, followerId);
        if (followCount == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Người này không theo dõi bạn");
        }

        // XÓA quan hệ follow
        followRepository.deleteByUserIdAndFollowerId(currentUserId, followerId);
    }
}
