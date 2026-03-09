package com.triduc.social.dto.response.user;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponseDTO {
    private String id;
    private String content;
    private String createdAt;
    private String updatedAt;
    private UserResponse sender;
    private List<CommentResponseDTO> replies;
    private Long likesCount;
    private Boolean isLiked;
}