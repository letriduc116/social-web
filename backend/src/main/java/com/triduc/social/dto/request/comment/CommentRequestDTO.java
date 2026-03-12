package com.triduc.social.dto.request.comment;
import lombok.*;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDTO {
    private String content;
    private String senderId;
    private String postId;
    private String parentCommentId;
}
