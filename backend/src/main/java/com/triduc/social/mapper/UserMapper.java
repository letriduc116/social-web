package com.triduc.social.mapper;

import com.triduc.social.dto.response.user.AuthResponse;
//import com.xuandong.ChatApp.dto.response.user.ProfileResponse;
//import com.xuandong.ChatApp.dto.response.user.SimpleUserResponse;
import com.triduc.social.dto.response.user.PostProfileResponse;
import com.triduc.social.dto.response.user.UserProfileResponse;
import com.triduc.social.dto.response.user.UserResponse;
import com.triduc.social.entity.Post;
import com.triduc.social.entity.PostImages;
import com.triduc.social.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserMapper {

	public UserResponse toUserResponse(User user) {
		return UserResponse.builder().id(user.getId()).userName(user.getUserName()).fullName(user.getFullName())
				.email(user.getEmail())
				.profileImage(user.getProfileImage())
				.bio(user.getBio())
				.build();
	}

	// Lấy userId từ Spring Security
	private String getCurrentUser() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (principal instanceof UserDetails userDetails) {
			return userDetails.getUsername();
		}
		return null;
	}

	public AuthResponse toAuthResponse(User user, String accessToken) {
		return AuthResponse.builder()
                .id(user.getId())
                .userName(user.getUserName())
                .fullName(user.getFullName())
				.email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name(): null)
                .accessToken(accessToken).build();
	}

	public PostProfileResponse toPostResponse(Post post) {
		PostProfileResponse response = new PostProfileResponse();
		response.setId(post.getId());
		response.setContent(post.getContent());
		response.setCreatedAt(post.getCreateAt());
		response.setLikeCount(post.countLikes());
		response.setCommentCount(post.countComment());
		response.setUserId(post.getUser().getId());
		response.setUserName(post.getUser().getUserName());
		response.setAvatarUrl(post.getUser().getProfileImage());

		// ✅ Ánh xạ postImages sang PostImage DTO cho FE
		List<PostImages> images = post.getPostImages().stream()
				.map(img -> {
					PostImages dto = new PostImages();
					dto.setId(img.getId());
					dto.setUrlImage(img.getUrlImage());
					return dto;
				}).collect(Collectors.toList());

		response.setImageUrls(images);

		return response;
	}


	public UserProfileResponse toUserProfileResponse(User user,
													 boolean isFollowing,
													 long followersCount,
													 long followingCount,
													 List<PostProfileResponse> posts) {
		return UserProfileResponse.builder()
				.userId(user.getId())
				.userName(user.getUserName())
				.fullName(user.getFullName())
				.avatarUrl(user.getProfileImage())
				.bio(user.getBio())
				.isFollowing(isFollowing)
				.followersCount(followersCount)
				.followingCount(followingCount)
				.posts(posts)
				.build();
	}

}
